import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProfile } from '@legacy/context/ProfileContext.jsx';
import { Cluster, Heading, Section, Stack, Text } from '../components/layout';
import {
  Button,
  Card,
  Combobox,
  Disclaimer,
  EmptyState,
  FormField,
  Input,
  Mascot,
  toast,
  UniversityLogo,
  type ComboboxOption,
  type MascotKind,
} from '../components/ui';
import { Camera, CheckCircle } from '../components/ui/icons';
import {
  SAMPLE_PEOPLE,
  samplePersonById,
  type SamplePerson,
} from '../lib/sample-people';
import { resolveCountry, resolveUniversity } from '../lib/profile-facts';
import { COUNTRY_OPTIONS } from '../lib/country-options';
import { UNIVERSITIES } from '../components/ui/university-logos';
import type { UniversityId } from '../components/ui/university-logos';
import {
  ProfilePublicCard,
  type PublicPerson,
} from '../components/profile/ProfilePublicCard';
import { ProfileMascotPicker } from '../components/profile/ProfileMascotPicker';
import { publicUrl } from '../lib/public-url';

/**
 * Profile — the rebuilt `/app/profile`.
 *
 * One page, three faces, all served by the same components:
 *
 *   - **own profile** (no `:userId`): an editorial masthead — intro plate left,
 *     portrait plate right — over a "Your details" card, a friends list, and an
 *     honest footer. Edit mode swaps the details card's view rows for the form
 *     in the same box (never two stacked cards).
 *   - **own preview**: the same page with the intro plate replaced by a solid
 *     honesty bar and the identity swapped for the public card. No editing
 *     controls render while previewing, and focus moves to the preview heading.
 *   - **`:userId`** — a sample person, rendered by the one presentational
 *     `ProfilePublicCard` with the SAMPLE badge, the note and the friend toggle,
 *     plus a back-link to the directory.
 *
 * Built against the v2 system only: layout primitives for structure, shared
 * components for surface and state, tokens for every value. It sits on
 * AppHome's proven scene backdrop (`/art/harbour-scene-1.svg`) inside an
 * isolated stacking context, reuses the `.app-home-glass-text` frost recipe for
 * the one plate that is not a Card, and keeps the glass budget to three
 * surfaces on purpose: the masthead intro plate, the details Card and the
 * portrait plate. Friends is a flat (hairline) Card, the footer and the preview
 * bar are solid — none of them glass.
 *
 * Honesty is part of the design, not fine print: the device-only promise, the
 * image limit, the local friend list, and the sample-directory note are all on
 * screen, and the page invents no statistic.
 */

const MAX_NAME = 50;
const MAX_PHOTO_BYTES = 1_500_000;
const MAX_SOCIAL = 40;
const SOCIAL_PLATFORMS = ['instagram', 'linkedin', 'tiktok', 'x'] as const;

type SocialKey = (typeof SOCIAL_PLATFORMS)[number];

const SOCIAL_LABELS: Record<SocialKey, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  x: 'X',
};

/** The twelve kinds, in the v2 manifest's order — one source of truth. */
const MASCOT_KINDS: readonly MascotKind[] = [
  'otter',
  'octopus',
  'turtle',
  'jellyfish',
  'crab',
  'seahorse',
  'starfish',
  'shrimp',
  'seal',
  'eel',
  'pufferfish',
  'whale',
];

function isMascotKind(value: string | undefined): value is MascotKind {
  return typeof value === 'string' && (MASCOT_KINDS as string[]).includes(value);
}

/**
 * The two combobox option lists. Countries come from the shared
 * `country-options` module (one source of truth with the resolver's region
 * corrections); universities come from the `UNIVERSITIES` manifest, so the
 * rows and the `UniversityLogo` read the same table and cannot drift.
 */
const COUNTRY_COMBO_OPTIONS: readonly ComboboxOption[] = COUNTRY_OPTIONS.map(
  (option) => ({ value: option.code, label: option.name }),
);

const UNIVERSITY_COMBO_OPTIONS: readonly ComboboxOption[] = UNIVERSITIES.map(
  (university) => ({
    value: university.id,
    label: university.name,
    detail: university.acronym || undefined,
  }),
);

/** The shape `useProfile()` hands us; the legacy store's fields are untyped. */
type StoredProfile = {
  id?: string;
  name?: string;
  country?: string;
  university?: string;
  socials?: Record<string, string>;
  mascotId?: string;
  photo?: string;
  avatar?: string;
};

function readFriends(): string[] {
  try {
    return JSON.parse(localStorage.getItem('harbour-friends') || '[]');
  } catch {
    return [];
  }
}

/** Whether localStorage is usable at all (private mode throws on every access). */
function storageAvailable(): boolean {
  try {
    localStorage.setItem('harbour:profile-probe', '1');
    localStorage.removeItem('harbour:profile-probe');
    return true;
  } catch {
    return false;
  }
}

export function Profile(): JSX.Element {
  const { userId } = useParams<{ userId: string }>();

  if (userId) {
    return <SampleProfileView userId={userId} />;
  }
  return <OwnProfileView />;
}

/* ------------------------------------------------------------------------- */
/* The `:userId` sample view                                                  */
/* ------------------------------------------------------------------------- */

function SampleProfileView({ userId }: { userId: string }): JSX.Element {
  const person = samplePersonById(userId);
  const [friends, setFriends] = useState<string[]>(readFriends);

  function toggleFriend(id: string): void {
    const added = friends.includes(id);
    const next = added ? friends.filter((item) => item !== id) : [...friends, id];
    setFriends(next);
    try {
      localStorage.setItem('harbour-friends', JSON.stringify(next));
    } catch {
      /* On this visit only, if storage is blocked. */
    }
    if (person) {
      toast.success(
        added ? `${person.name} removed.` : `${person.name} added to your people.`,
      );
    }
  }

  if (!person) {
    return (
      <div className="app-profile">
        <Scene />
        <Stack gap={6} className="app-profile__shell">
          <Section aria-label="Profile not found">
            <Stack gap={5} align="start">
              <Heading level={1}>We could not find that profile.</Heading>
              <Text role="body" tone="muted">
                That sample person is not in the demo directory.
              </Text>
              <Button asChild variant="secondary">
                <Link to="/app/people">← People directory</Link>
              </Button>
            </Stack>
          </Section>
        </Stack>
      </div>
    );
  }

  return (
    <div className="app-profile">
      <Scene />
      <Stack gap={6} className="app-profile__shell">
        <Section
          aria-label={`${person.name}’s profile`}
          className="app-profile__hero"
        >
          <Stack gap={5}>
            <Link className="app-profile__backlink" to="/app/people">
              ← People directory
            </Link>
            <ProfilePublicCard
              person={toSamplePerson(person)}
              isFriend={friends.includes(person.id)}
              onToggleFriend={() => toggleFriend(person.id)}
            />
          </Stack>
        </Section>
      </Stack>
    </div>
  );
}

/** Map a `SamplePerson` to the public card's `person` shape. */
function toSamplePerson(person: SamplePerson): PublicPerson {
  return {
    name: person.name,
    mascot: person.mascot,
    university: person.university,
    universityId: person.universityId,
    country: person.country,
    countryCode: person.countryCode,
    note: person.note,
    isSample: true,
    personId: person.id,
    accent: person.accent,
  };
}

/* ------------------------------------------------------------------------- */
/* The own-profile view (with preview + edit modes)                           */
/* ------------------------------------------------------------------------- */

function OwnProfileView(): JSX.Element {
  const navigate = useNavigate();
  const { profile: rawProfile, saveProfile, clearProfile } = useProfile();
  const profile = rawProfile as StoredProfile | null;

  const [storageOk] = useState(storageAvailable);
  const [preview, setPreview] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form state, seeded from the profile and re-seeded whenever we enter edit.
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [university, setUniversity] = useState('');
  const [socials, setSocials] = useState<Record<string, string>>({});
  const [mascotId, setMascotId] = useState<MascotKind>('otter');
  // The photo currently shown on the plate (data URL), and the one held for the
  // session so "Use my photo again" can restore it after a mascot replaces it.
  const [photo, setPhoto] = useState('');
  const [photoBackup, setPhotoBackup] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const previewHeadingRef = useRef<HTMLHeadingElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const [announcement, setAnnouncement] = useState('');

  const seedFromProfile = useCallback((): void => {
    const current = rawProfile as StoredProfile | null;
    setName(current?.name?.trim() || '');
    // The store is dual-shaped: a profile this app wrote holds an ISO code and
    // a manifest universityId, while one rescued from the older build holds
    // display strings. The combobox speaks codes/ids, so resolve to those on
    // the way in — a legacy string is upgraded rather than shown as unmatched.
    const countryFact = resolveCountry(current?.country);
    // `resolveCountry` maps the OTHER sentinel to a name with no code, so keep
    // the sentinel itself when the stored value was it.
    const storedCountry = (current?.country ?? '').trim();
    setCountry(
      storedCountry === 'OTHER'
        ? 'OTHER'
        : countryFact.code
          ? countryFact.code.toUpperCase()
          : '',
    );
    const uni = resolveUniversity(current?.university);
    setUniversity(uni.id ?? '');
    setSocials(
      current?.socials && typeof current.socials === 'object'
        ? current.socials
        : {},
    );
    setMascotId(isMascotKind(current?.mascotId) ? current.mascotId : 'otter');
    setPhoto(current?.photo || '');
    setPhotoBackup(null);
  }, [rawProfile]);

  // Keep the plate in step with the store while not editing.
  useEffect(() => {
    if (!editing) seedFromProfile();
  }, [editing, seedFromProfile]);

  const displayName = profile?.name?.trim() || 'Your profile';

  const facts = useMemo(() => {
    return {
      countryFact: resolveCountry(profile?.country),
      uni: resolveUniversity(profile?.university),
    };
  }, [profile?.country, profile?.university]);

  const friendPeople = useMemo(
    () =>
      readFriends()
        .map((id) => SAMPLE_PEOPLE.find((person) => person.id === id))
        .filter((person): person is SamplePerson => Boolean(person)),
    [],
  );

  const socialEntries = useMemo(() => {
    const stored = (profile?.socials ?? {}) as Record<string, string>;
    return SOCIAL_PLATFORMS.filter((key) => stored[key]?.trim());
  }, [profile?.socials]);

  const publicPerson: PublicPerson = useMemo(() => {
    const countryFact = resolveCountry(profile?.country);
    const uni = resolveUniversity(profile?.university);
    return {
      name: profile?.name?.trim() || 'Your profile',
      mascot: isMascotKind(profile?.mascotId) ? profile.mascotId : 'otter',
      photo: profile?.photo || undefined,
      university: uni.name,
      universityId: uni.id,
      country: countryFact.name === 'Not added' ? '' : countryFact.name,
      countryCode: countryFact.code,
      isSample: false,
    };
  }, [
    profile?.name,
    profile?.mascotId,
    profile?.photo,
    profile?.country,
    profile?.university,
  ]);

  /* --- Photo upload (F4) ------------------------------------------------- */

  function handlePhoto(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    // Reset so choosing the same file twice still fires a change event.
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > MAX_PHOTO_BYTES) {
      toast.warning('Choose an image under 1.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const nextPhoto = String(reader.result);
      setPhoto(nextPhoto);
      setPhotoBackup(null);
      saveProfile({
        id: profile?.id,
        name: profile?.name?.trim() || 'Student',
        country: profile?.country || '',
        university: profile?.university || '',
        socials: (profile?.socials as Record<string, string>) ?? {},
        mascotId: profile?.mascotId,
        avatar: profile?.avatar,
        photo: nextPhoto,
      });
      toast.success('Profile photo updated.');
    };
    reader.readAsDataURL(file);
  }

  function chooseMascot(kind: MascotKind): void {
    // A mascot replaces the visible photo, but the photo is kept aside for the
    // session so the choice is reversible (direction §6).
    if (photo) setPhotoBackup(photo);
    setMascotId(kind);
    setPhoto('');
  }

  function restorePhoto(): void {
    if (!photoBackup) return;
    setPhoto(photoBackup);
    setPhotoBackup(null);
  }

  /* --- Edit / save (F6) -------------------------------------------------- */

  function beginEdit(): void {
    seedFromProfile();
    setEditing(true);
    setAnnouncement('Editing your details.');
  }

  function cancelEdit(): void {
    seedFromProfile();
    setEditing(false);
    setAnnouncement('');
  }

  function handleSave(event: FormEvent): void {
    event.preventDefault();
    const nextName = name.trim() || 'Student';
    const cleanSocials: Record<string, string> = {};
    for (const key of SOCIAL_PLATFORMS) {
      const value = (socials[key] ?? '').replace(/^@/, '').trim().slice(0, MAX_SOCIAL);
      if (value) cleanSocials[key] = value;
    }
    const persisted = saveProfile({
      id: profile?.id,
      name: nextName,
      // Both are canonical now — an uppercase ISO alpha-2 code and a manifest
      // universityId — the shape the resolvers expect and the signup flow writes.
      country: country.trim().toUpperCase(),
      university: university.trim(),
      socials: cleanSocials,
      mascotId,
      photo,
      avatar: profile?.avatar,
    });
    setEditing(false);
    if (persisted === false) {
      toast.warning('Profiles cannot be saved in this browser.');
    } else {
      toast.success('Profile saved on this device.');
    }
    setAnnouncement('Changes saved on this device.');
  }

  function setSocial(key: SocialKey, value: string): void {
    setSocials((current) => ({ ...current, [key]: value.replace(/^@/, '') }));
  }

  /* --- Log out (F8) ------------------------------------------------------ */

  function logout(): void {
    clearProfile();
    navigate('/login', { replace: true });
  }

  /* --- Preview toggle (direction §5) ------------------------------------- */

  function enterPreview(): void {
    setEditing(false);
    setPreview(true);
    setAnnouncement('Preview: this is how others see your profile.');
  }

  function leavePreview(): void {
    setPreview(false);
    setAnnouncement('');
    // Restore focus to the toggle once it is back in the tree.
    requestAnimationFrame(() => toggleRef.current?.focus());
  }

  useEffect(() => {
    if (preview) previewHeadingRef.current?.focus();
  }, [preview]);

  /* --- Empty state (F9) -------------------------------------------------- */

  if (!profile) {
    return (
      <div className="app-profile">
        <Scene />
        <Stack gap={6} className="app-profile__shell">
          <Section aria-label="Your Harbour profile" className="app-profile__hero">
            <Stack gap={4} align="center" className="app-profile-empty">
              <span className="app-profile-empty__glyph" aria-hidden="true">
                <Mascot kind="otter" className="app-profile-empty__mascot" />
              </span>
              <Text role="label" tone="subtle">
                Your harbour profile
              </Text>
              <Heading level={1}>Start with a few details.</Heading>
              <Text role="body" tone="muted">
                Your profile is saved only in this browser.
              </Text>
              <Button asChild>
                <Link to="/signup">Create a profile</Link>
              </Button>
            </Stack>
          </Section>
        </Stack>
      </div>
    );
  }

  const editingVisible = editing && !preview;

  return (
    <div className="app-profile">
      <Scene />
      <Stack gap={6} className="app-profile__shell">
        {/* Storage-blocked banner — honest, not hidden. */}
        {!storageOk ? (
          <div className="app-profile__banner" role="status">
            <Text role="small" className="app-profile__banner-text">
              Profiles cannot be saved in this browser.
            </Text>
          </div>
        ) : null}

        {/* 1. Masthead identity band */}
        <Section aria-label="Your identity" className="app-profile__hero">
          {preview ? (
            <div className="app-profile-previewbar" aria-live="polite">
              <Heading level={2} role="h2" ref={previewHeadingRef} tabIndex={-1}>
                Preview — this is how others see your profile.
              </Heading>
              <Button variant="secondary" onClick={leavePreview}>
                Back to editing
              </Button>
            </div>
          ) : null}

          <div className="app-profile-masthead">
            {!preview ? (
              <div className="app-profile-masthead__intro app-profile-glass-text">
                <span className="app-profile-eyebrow">Your space · Profile</span>
                <Heading level={1} role="h1" className="app-profile-name">
                  {displayName}
                </Heading>
                <Text role="body" tone="muted" className="app-profile-lede">
                  Your corner of the harbour. Everything here stays on this
                  device.
                </Text>
                <Cluster gap={3} className="app-profile-masthead__actions">
                  <Button
                    ref={toggleRef}
                    variant="secondary"
                    aria-pressed={preview}
                    onClick={enterPreview}
                  >
                    See how others see you
                  </Button>
                  <Button
                    variant={editing ? 'ghost' : 'primary'}
                    onClick={editing ? cancelEdit : beginEdit}
                  >
                    {editing ? 'Cancel' : 'Edit profile'}
                  </Button>
                </Cluster>
              </div>
            ) : (
              <div className="app-profile-masthead__intro">
                <ProfilePublicCard person={publicPerson} nameTag="h1" />
              </div>
            )}

            {!preview ? (
              <div className="app-profile-masthead__plate">
                <Card
                  variant="static"
                  padded={false}
                  className="app-profile-plate"
                >
                  <PortraitPlate
                    photo={photo}
                    mascot={isMascotKind(profile.mascotId) ? profile.mascotId : 'otter'}
                    name={displayName}
                  />
                </Card>
              </div>
            ) : null}
          </div>
        </Section>

        {/* 2–3. Your details + socials — one Card, view XOR edit. */}
        <Section aria-label="Your details">
          <Card variant="static" className="app-profile-details">
            <Stack gap={5}>
              <Stack gap={1}>
                <Heading level={2}>Your details</Heading>
                <Text role="small" tone="muted">
                  {editingVisible
                    ? 'Change anything below, then save.'
                    : 'The facts that identify you here.'}
                </Text>
              </Stack>

              <p className="sr-only" aria-live="polite">
                {announcement}
              </p>

              {editingVisible ? (
                <form className="app-profile-form" onSubmit={handleSave}>
                  <Stack gap={4}>
                    <FormField id="profile-name" label="Display name" required>
                      {(controlProps) => (
                        <Input
                          {...controlProps}
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          maxLength={MAX_NAME}
                          autoComplete="given-name"
                          placeholder="How you would like to be shown"
                        />
                      )}
                    </FormField>

                    <FormField id="profile-country" label="Home country or region">
                      {(controlProps) => (
                        <Combobox
                          {...controlProps}
                          value={country}
                          onChange={setCountry}
                          options={COUNTRY_COMBO_OPTIONS}
                          placeholder="Where you are from"
                          searchPlaceholder="Search countries and regions…"
                          listLabel="Home country or region"
                          searchLabel="Search countries and regions"
                          renderIcon={(option) =>
                            option.value === 'OTHER' ? null : (
                              <img
                                src={publicUrl(`/flags/${option.value.toLowerCase()}.svg`)}
                                alt=""
                                loading="lazy"
                              />
                            )
                          }
                        />
                      )}
                    </FormField>

                    <FormField id="profile-university" label="University">
                      {(controlProps) => (
                        <Combobox
                          {...controlProps}
                          value={university}
                          onChange={setUniversity}
                          options={UNIVERSITY_COMBO_OPTIONS}
                          placeholder="Where you study"
                          searchPlaceholder="Search universities…"
                          listLabel="University"
                          searchLabel="Search universities"
                          renderIcon={(option) =>
                            option.value === 'other' ? null : (
                              <UniversityLogo
                                id={option.value as UniversityId}
                                size="sm"
                                variant="art"
                              />
                            )
                          }
                        />
                      )}
                    </FormField>

                    {/* Mascot picker — its own accessible radio group. */}
                    <ProfileMascotPicker
                      value={mascotId}
                      onChange={chooseMascot}
                      hasPhoto={Boolean(photo)}
                      canRestorePhoto={Boolean(photoBackup)}
                      onRestorePhoto={restorePhoto}
                    />

                    {/* Photo upload (F4). */}
                    <div className="app-profile-photo">
                      <Text role="small" className="app-profile-photo__label">
                        Profile photo
                      </Text>
                      <Cluster gap={3} align="center">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => fileRef.current?.click()}
                        >
                          <Camera className="size-4" />
                          {photo ? 'Change photo' : 'Add profile photo'}
                        </Button>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handlePhoto}
                          aria-label="Upload a profile photo"
                        />
                      </Cluster>
                      <Text role="small" tone="subtle">
                        Image stays on this device · max 1.5 MB
                      </Text>
                    </div>

                    {/* Socials (F5). */}
                    <fieldset className="app-profile-socials">
                      <legend className="type-small text-text font-medium">
                        Social usernames
                      </legend>
                      <Text
                        role="small"
                        tone="muted"
                        className="app-profile-socials__hint"
                      >
                        Add only the accounts you would like to share. All
                        optional.
                      </Text>
                      <Stack gap={3} className="app-profile-socials__fields">
                        {SOCIAL_PLATFORMS.map((key) => (
                          <FormField
                            key={key}
                            id={`profile-social-${key}`}
                            label={SOCIAL_LABELS[key]}
                          >
                            {(controlProps) => (
                              <Input
                                {...controlProps}
                                value={socials[key] ?? ''}
                                onChange={(event) => setSocial(key, event.target.value)}
                                maxLength={MAX_SOCIAL}
                                autoComplete="off"
                                placeholder="username"
                              />
                            )}
                          </FormField>
                        ))}
                      </Stack>
                    </fieldset>

                    <Cluster gap={3}>
                      <Button type="submit" variant="primary">
                        <CheckCircle className="size-4" />
                        Save changes
                      </Button>
                      <Button type="button" variant="ghost" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </Cluster>
                  </Stack>
                </form>
              ) : (
                <Stack gap={5}>
                  {/* Facts ledger — mono-uppercase labels over plain values. */}
                  <dl className="app-profile-ledger">
                    <div className="app-profile-ledger__row">
                      <dt className="type-label text-text-subtle">Display name</dt>
                      <dd>
                        <Text role="body">{profile.name?.trim() || 'Not added'}</Text>
                      </dd>
                    </div>
                    <div className="app-profile-ledger__row">
                      <dt className="type-label text-text-subtle">
                        Home country or region
                      </dt>
                      <dd className="app-profile-ledger__value">
                        {facts.countryFact.code ? (
                          <img
                            className="app-profile-flag"
                            src={publicUrl(`/flags/${facts.countryFact.code}.svg`)}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                          />
                        ) : null}
                        <Text role="body">{facts.countryFact.name}</Text>
                      </dd>
                    </div>
                    <div className="app-profile-ledger__row">
                      <dt className="type-label text-text-subtle">University</dt>
                      <dd className="app-profile-ledger__value">
                        {facts.uni.id ? (
                          <UniversityLogo
                            id={facts.uni.id}
                            size="sm"
                            variant="art"
                            className="app-profile-uni-crest"
                          />
                        ) : null}
                        <Text role="body">{facts.uni.name || 'Not added'}</Text>
                      </dd>
                    </div>
                  </dl>

                  {/* Socials preview (F5). */}
                  <div className="app-profile-socials-preview">
                    <Text role="label" tone="subtle">
                      Social links
                    </Text>
                    {socialEntries.length ? (
                      <Stack gap={2}>
                        {socialEntries.map((key) => (
                          <Cluster key={key} justify="between" gap={3}>
                            <Text role="small" tone="muted">
                              {SOCIAL_LABELS[key]}
                            </Text>
                            <Text role="small">@{profile.socials?.[key]}</Text>
                          </Cluster>
                        ))}
                      </Stack>
                    ) : (
                      <Text role="small" tone="muted">
                        No social usernames shared yet.{' '}
                        <button
                          type="button"
                          className="app-profile-inline-link"
                          onClick={beginEdit}
                        >
                          Add some
                        </button>
                      </Text>
                    )}
                  </div>
                </Stack>
              )}
            </Stack>
          </Card>
        </Section>

        {/* 4. Friends — a flat Card, so it stays out of the glass budget. */}
        <Section aria-label="Friends">
          <Card variant="flat" className="app-profile-friends">
            <Stack gap={4}>
              <Cluster justify="between" align="center">
                <Heading level={2}>Friends</Heading>
                <Link className="app-profile-findlink" to="/app/people">
                  Find people
                  <span aria-hidden="true"> ↗</span>
                </Link>
              </Cluster>

              {friendPeople.length ? (
                <Stack gap={3} className="app-profile-friend-list">
                  {friendPeople.map((person) => (
                    <Link
                      key={person.id}
                      className="app-profile-friend-row"
                      to={`/app/profile/${person.id}`}
                      style={{ '--person-accent': person.accent } as CSSProperties}
                    >
                      <span
                        className="app-profile-friend-row__pfp"
                        aria-hidden="true"
                      >
                        <Mascot
                          kind={person.mascot}
                          className="app-profile-friend-row__mascot"
                        />
                      </span>
                      <span className="app-profile-friend-row__who">
                        <Text
                          role="small"
                          className="app-profile-friend-row__name"
                        >
                          {person.name}
                        </Text>
                        <Text role="small" tone="subtle">
                          {person.university}
                        </Text>
                      </span>
                      <span className="app-profile-friend-row__go" aria-hidden="true">
                        ↗
                      </span>
                    </Link>
                  ))}
                </Stack>
              ) : (
                <EmptyState
                  title="No friends yet"
                  action={
                    <Button asChild variant="secondary" size="small">
                      <Link to="/app/people">Search the demo directory</Link>
                    </Button>
                  }
                >
                  Your friend list is empty. Search the demo directory to find
                  people.
                </EmptyState>
              )}
            </Stack>
          </Card>
        </Section>

        {/* 5. Footer actions + honesty note — no surface, bare over the scene. */}
        <Section
          aria-label="Profile actions"
          className="app-profile__footer-section"
        >
          <Cluster justify="between" gap={4} className="app-profile-footer">
            <Button variant="ghost" onClick={logout}>
              Log out · keep this profile here
            </Button>
            <Disclaimer className="app-profile-footer__note">
              Local profile only. Harbour does not create an account or store
              profile changes on a server.
            </Disclaimer>
          </Cluster>
        </Section>
      </Stack>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* The portrait plate — photo if present, else the mascot on its field        */
/* ------------------------------------------------------------------------- */

function PortraitPlate({
  photo,
  mascot,
  name,
}: {
  photo: string;
  mascot: MascotKind;
  name: string;
}): JSX.Element {
  return (
    <div className="app-profile-plate__inner">
      {photo ? (
        <>
          <img
            className="app-profile-plate__photo"
            src={photo}
            alt={`${name} profile`}
          />
          <span className="app-profile-plate__veil" aria-hidden="true" />
        </>
      ) : (
        <Mascot
          kind={mascot}
          className="app-profile-plate__mascot"
          title={`${name}’s mascot`}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* The scene backdrop — AppHome's recipe, mounted inside this page's stack    */
/* ------------------------------------------------------------------------- */

function Scene(): JSX.Element {
  return (
    <div className="app-profile__scene" aria-hidden="true">
      <img src={publicUrl('/art/harbour-scene-1.svg')} alt="" />
      <div className="app-profile__scene-tint" />
    </div>
  );
}
