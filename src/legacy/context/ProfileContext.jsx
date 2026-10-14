import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ACTIVE_ID_KEY,
  PROFILES_KEY,
  activeProfileId,
  listProfiles,
  persistProfile,
  removeProfile as removeStoredProfile,
  selectProfile as selectStoredProfile,
} from "../../lib/profile-store.ts";

const ProfileContext = createContext(null);
// One source of truth for the mascot kinds. Must stay in exact sync with
// `MascotKind` in `src/components/ui/mascot.tsx` (the v2 lane owns the list;
// this file is JSX in the legacy lane, excluded from tsc/ESLint per D-001, so
// it cannot import the type — it redeclares the twelve names instead). This
// replaces the old four-kind clamp (["otter","crane","turtle","fox"]) which
// silently collapsed ten of the twelve kinds down to "otter" on every
// save-through-context, and built a raster avatar path that 404s for most of
// them. See outputs/profile-design-direction.md §6.
const MASCOT_KINDS = [
  "otter", "octopus", "turtle", "jellyfish", "crab", "seahorse",
  "starfish", "shrimp", "seal", "eel", "pufferfish", "whale",
];
// Only these kinds have a raster on disk (`public/art/mascot-*.webp`). Every
// other kind falls back to the same raster path as "otter", which exists.
const RASTER_MASCOTS = ["crane", "fox", "otter", "turtle"];
const avatarFor = id => `/art/mascot-${RASTER_MASCOTS.includes(id) ? id : "otter"}.webp`;

function normalize(value, key) {
  if (typeof value === "string") {
    try { value = JSON.parse(value); }
    catch { value = key === "harbour-name" ? { name: value } : null; }
  }
  if (!value || typeof value !== "object") return null;
  value = value.profile || value.user || value.account || value;
  const name = String(value.name || value.nickname || value.displayName || value.username || value.fullName || "").trim();
  if (!name) return null;
  const mascotId = MASCOT_KINDS.includes(value.mascotId) ? value.mascotId : "otter";
  return {
    ...value,
    id: value.id || null,
    name,
    nickname: value.nickname || name,
    country: value.country || value.countryCode || value.homeCountry || "",
    university: value.university || value.universityId || value.school || "",
    socials: value.socials && typeof value.socials === "object" ? value.socials : {},
    mascotId,
    avatar: value.avatar || avatarFor(mascotId),
  };
}

function readLegacyProfile() {
  if (typeof window === "undefined") return null;
  for (const key of ["harbour-profile", "harbour-user", "harbour-local-profile", "harbour-account", "harbour-current-user", "harbour-name", "profile", "user"]) {
    try {
      const profile = normalize(localStorage.getItem(key), key);
      if (profile) return profile;
    } catch { /* A malformed or blocked legacy key must not hide other profiles. */ }
  }
  return null;
}

function readProfiles() {
  const stored = listProfiles().map(profile => normalize(profile, PROFILES_KEY)).filter(Boolean);
  if (stored.length) return stored;
  const legacy = readLegacyProfile();
  return legacy ? [{ ...legacy, id: legacy.id || "legacy-profile", createdAt: legacy.createdAt || new Date(0).toISOString() }] : [];
}

function readActiveProfile(profiles) {
  const legacy = readLegacyProfile();
  if (legacy) {
    const selectedId = activeProfileId();
    return profiles.find(profile => profile.id === selectedId) || profiles.find(profile => profile.id === legacy.id) || profiles[0] || legacy;
  }
  return null;
}

export function ProfileProvider({ children }) {
  const [profiles, setProfiles] = useState(readProfiles);
  const [profile, setProfile] = useState(() => readActiveProfile(readProfiles()));
  const migrationAttempted = useRef(false);

  // Migrate an existing single local profile into the versioned picker store,
  // while leaving the legacy record intact for the ported pages.
  useEffect(() => {
    if (!profiles.length || listProfiles().length || migrationAttempted.current) return;
    migrationAttempted.current = true;
    const legacy = profiles[0];
    persistProfile({ ...legacy, id: legacy.id || undefined, createdAt: legacy.createdAt || undefined });
    setProfiles(listProfiles().map(row => normalize(row, PROFILES_KEY)).filter(Boolean));
  }, [profiles]);

  const saveProfile = useCallback(value => {
    const next = normalize(value, "profile");
    if (!next) return false;
    const { record, persisted } = persistProfile({
      ...next,
      id: next.id || undefined,
      createdAt: next.createdAt || undefined,
      avatar: next.photo || avatarFor(next.mascotId),
    });
    const normalized = normalize(record, PROFILES_KEY);
    setProfiles(current => [normalized, ...current.filter(item => item.id !== normalized.id)]);
    setProfile(normalized);
    return persisted;
  }, []);

  const selectProfile = useCallback(id => {
    const selected = profiles.find(item => item.id === id);
    if (!selected) return false;
    selectStoredProfile(id);
    setProfile(selected);
    return true;
  }, [profiles]);

  const clearProfile = useCallback(() => {
    try {
      localStorage.removeItem(ACTIVE_ID_KEY);
      for (const key of ["harbour-profile", "harbour-name", "harbour-user", "harbour-local-profile", "harbour-account", "harbour-current-user", "profile", "user"]) localStorage.removeItem(key);
    } catch { /* The in-memory session can still be cleared. */ }
    setProfile(null);
    window.dispatchEvent(new Event("harbour-profile-change"));
  }, []);

  const removeProfile = useCallback(id => {
    removeStoredProfile(id);
    setProfiles(current => current.filter(item => item.id !== id));
    if (profile?.id === id) setProfile(null);
  }, [profile]);

  useEffect(() => {
    const sync = () => {
      const nextProfiles = readProfiles();
      setProfiles(nextProfiles);
      setProfile(readActiveProfile(nextProfiles));
    };
    window.addEventListener("storage", sync);
    window.addEventListener("harbour-profile-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("harbour-profile-change", sync);
    };
  }, []);

  const value = useMemo(() => ({ profile, profiles, saveProfile, selectProfile, clearProfile, removeProfile }), [profile, profiles, saveProfile, selectProfile, clearProfile, removeProfile]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export const useProfile = () => useContext(ProfileContext);
