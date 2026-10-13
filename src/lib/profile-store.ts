/**
 * The profile store adapter — the one seam between the v2 lane and the ported
 * legacy lane.
 *
 * Both lanes need a profile, and they need it in different shapes:
 *
 *   - **Legacy** (`src/legacy/context/ProfileContext.jsx`) reads
 *     `harbour-profile` = `{ name, country, university, socials: {} }`, where
 *     `country` and `university` are display strings, and `name` is what it
 *     greets the user with. It also accepts seven older key spellings and
 *     normalises them.
 *   - **v2** keeps a *list* of profiles under `harbour:v1:profiles`, with an
 *     `activeProfileId` pointing at one of them, so the login page can offer a
 *     picker.
 *
 * This module is what keeps the two in step. The rule from the master prompt,
 * which the write path below implements literally: **the v2 shape also carries
 * the exact legacy keys**, so a profile created on the signup page is
 * immediately readable by the ported app with no translation at read time.
 *
 * The legacy `ProfileContext` is the reader the app actually uses; this module
 * is the writer plus the small conveniences the v2 pages need.
 */

/** The shape the porter legacy lane reads. */
export type LegacyProfile = {
  name: string;
  country: string;
  university: string;
  socials: Record<string, string>;
  /** Not part of the legacy contract, but harmless to carry. */
  avatar?: string;
  photo?: string;
  /** Set when a guided tour has been completed; Brick 4's tour reads it. */
  tourDone?: boolean;
};

/** The v2 record: a legacy profile plus the id the picker needs. */
export type StoredProfile = LegacyProfile & {
  id: string;
  createdAt: string;
};

export const PROFILES_KEY = 'harbour:v1:profiles';
export const ACTIVE_ID_KEY = 'harbour:v1:activeProfileId';
export const LEGACY_PROFILE_KEY = 'harbour-profile';

/** Storage is optional: a private-mode browser throws on every access. */
function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* Nothing to do: the key is already unreachable. */
  }
}

/** A short, collision-resistant id without pulling in a uuid dependency. */
function makeId(): string {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Every saved profile, newest first. */
export function listProfiles(): StoredProfile[] {
  const rows = safeRead<StoredProfile[]>(PROFILES_KEY, []);
  if (!Array.isArray(rows)) return [];
  return rows
    .filter(
      (row): row is StoredProfile =>
        Boolean(row) && typeof row.name === 'string' && row.name.length > 0,
    )
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
}

/** The id of the selected profile, or null. */
export function activeProfileId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_ID_KEY);
  } catch {
    return null;
  }
}

/**
 * Write a profile into **both** stores.
 *
 * The legacy keys are written unconditionally rather than only when the app
 * lane is about to mount, because the landing page's own CTA also reads the
 * saved profile — and a user who signs up and never opens the app this session
 * should still see a personalised landing page when they come back.
 */
export function saveProfile(
  input: Omit<StoredProfile, 'id' | 'createdAt'> &
    Partial<Pick<StoredProfile, 'id' | 'createdAt'>>,
): StoredProfile {
  const record: StoredProfile = {
    ...input,
    id: input.id ?? makeId(),
    createdAt: input.createdAt ?? new Date().toISOString(),
  };

  const rows = listProfiles().filter((row) => row.id !== record.id);
  rows.unshift(record);
  safeWrite(PROFILES_KEY, rows);
  safeWrite(ACTIVE_ID_KEY, record.id);
  activateProfile(record);

  // The legacy context listens for this and re-reads `harbour-profile`.
  window.dispatchEvent(new Event('harbour-profile-change'));
  return record;
}

/**
 * Copy a profile into the legacy key — what "selecting a profile on login"
 * means. The legacy reader is the app's own source of truth, so this is the
 * step that actually signs someone in.
 */
export function activateProfile(record: StoredProfile): void {
  const legacy: LegacyProfile = {
    name: record.name,
    country: record.country,
    university: record.university,
    socials: record.socials ?? {},
    avatar: record.avatar ?? '',
    photo: record.photo ?? '',
    tourDone: record.tourDone ?? false,
  };
  safeWrite(LEGACY_PROFILE_KEY, legacy);
  // The legacy context also reads a plain-string name key as a fallback.
  try {
    localStorage.setItem('harbour-name', record.name);
  } catch {
    /* Storage unavailable; the JSON key above is the one that matters. */
  }
}

/** Sign in as a saved profile by id. Returns the record, or null if unknown. */
export function selectProfile(id: string): StoredProfile | null {
  const record = listProfiles().find((row) => row.id === id) ?? null;
  if (!record) return null;
  try {
    localStorage.setItem(ACTIVE_ID_KEY, record.id);
  } catch {
    /* Storage unavailable. */
  }
  activateProfile(record);
  window.dispatchEvent(new Event('harbour-profile-change'));
  return record;
}

/**
 * Remove a profile from this device.
 *
 * If the removed profile was the active one, the legacy key is cleared too, so
 * the next `/app` visit is guarded back to login rather than resurrecting a
 * profile the user just deleted.
 */
export function removeProfile(id: string): void {
  const rows = listProfiles().filter((row) => row.id !== id);
  safeWrite(PROFILES_KEY, rows);

  if (activeProfileId() === id) {
    safeRemove(ACTIVE_ID_KEY);
    safeRemove(LEGACY_PROFILE_KEY);
    safeRemove('harbour-name');
  }
  window.dispatchEvent(new Event('harbour-profile-change'));
}

/** Whether any profile is currently signed in on this device. */
export function hasActiveProfile(): boolean {
  return Boolean(readLegacyProfile());
}

/**
 * Read whichever profile the legacy lane would read.
 *
 * This mirrors `ProfileContext`'s normalisation just enough to answer "is
 * somebody signed in?" — it does not try to reproduce the seven legacy key
 * fallbacks, because those exist to rescue data from an older build and this
 * function only ever sees profiles this app wrote.
 */
export function readLegacyProfile(): LegacyProfile | null {
  try {
    const raw = localStorage.getItem(LEGACY_PROFILE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<LegacyProfile>;
    if (!value || typeof value.name !== 'string' || !value.name.trim()) {
      return null;
    }
    return {
      name: value.name,
      country: value.country ?? '',
      university: value.university ?? '',
      socials: value.socials ?? {},
      avatar: value.avatar ?? '',
      photo: value.photo ?? '',
      tourDone: value.tourDone ?? false,
    };
  } catch {
    return null;
  }
}
