import { type CSSProperties } from 'react';
import { Heading, Cluster, Stack, Text } from '../layout';
import { Button, DemoBadge, Mascot, UniversityLogo, type MascotKind } from '../ui';
import type { UniversityId } from '../ui';
import { publicUrl } from '../../lib/public-url';

/**
 * ProfilePublicCard — the ONE presentational "how others see you" view.
 *
 * Dumb by construction: it takes a `person`-shaped prop and reads no store, so
 * a single implementation serves both callers on `/app/profile`:
 *
 *   - **own preview** — fed from `useProfile()`, `isSample: false`, no friend
 *     toggle, no SAMPLE badge;
 *   - **`:userId`** — fed from `SAMPLE_PEOPLE`, `isSample: true`, which adds the
 *     SAMPLE badge, the note and the Follow/Friend toggle.
 *
 * The portait plate shows a photo when one is present, else the person's
 * `Mascot` on the same `--person-accent` field the People directory uses, so a
 * sample person keeps the creature that greets you on their directory card.
 * The name is the page's one `h1`; the card carries no other heading, so it can
 * never introduce a second one.
 *
 * Country: the component takes a display-name string (resolved by the caller,
 * which owns the code-or-string nuance) and an optional ISO code for the flag.
 * The flag is a tiny inline `<img>` guarded so a missing or unknown code renders
 * nothing — never a flag emoji (spec §3 / §10).
 */

export type PublicPerson = {
  name: string;
  mascot: MascotKind;
  /** A data URL (own profile) or nothing. A photo wins over the mascot. */
  photo?: string;
  /** The full institution name, for readable text. */
  university: string;
  /** The manifest id, for `<UniversityLogo>`. Optional (a raw string may not map). */
  universityId?: UniversityId;
  /** The home region, as display text (already code-resolved by the caller). */
  country: string;
  /** ISO 3166-1 alpha-2, lowercase — resolves `/flags/<code>.svg`. */
  countryCode?: string;
  /** Sample people carry a note; an own profile omits it. */
  note?: string;
  /** Renders the SAMPLE badge and the friend toggle. */
  isSample: boolean;
  /** The sample person's stable id, when this is a `:userId` view. */
  personId?: string;
  /** A §3 chart token, scoped as `--person-accent`. Optional accent override. */
  accent?: string;
};

export type ProfilePublicCardProps = {
  person: PublicPerson;
  /** The heading tag for the name. Defaults to `h1` (the page's one heading). */
  nameTag?: 'h1' | 'h2';
  /** Whether this viewer has this sample person in `harbour-friends`. */
  isFriend?: boolean;
  /** Toggles the friend connection. Sample profiles only. */
  onToggleFriend?: () => void;
};

/** Only flag codes we ship resolve; an unknown one renders no image. */
function validFlagCode(code: string | undefined): string | undefined {
  if (!code) return undefined;
  return /^[a-z]{2}$/.test(code) ? code : undefined;
}

export function ProfilePublicCard({
  person,
  nameTag = 'h1',
  isFriend = false,
  onToggleFriend,
}: ProfilePublicCardProps): JSX.Element {
  const flagCode = validFlagCode(person.countryCode);

  return (
    <article
      className="app-profile-public"
      style={
        person.accent
          ? ({ '--person-accent': person.accent } as CSSProperties)
          : undefined
      }
    >
      {/* Portrait plate — a photo wins; otherwise the mascot on its field. */}
      <div className="app-profile-public__plate">
        {person.photo ? (
          <img
            className="app-profile-public__photo"
            src={person.photo}
            alt={`${person.name} profile`}
          />
        ) : (
          <Mascot
            kind={person.mascot}
            className="app-profile-public__mascot"
            title={`${person.name}’s mascot`}
          />
        )}
      </div>

      <Stack gap={4} className="app-profile-public__body">
        <Stack gap={2}>
          <Heading level={1} as={nameTag} role={nameTag}>
            {person.name}
          </Heading>

          <Cluster className="app-profile-public__facts" gap={3}>
            <span className="app-profile-public__uni">
              {person.universityId ? (
                <UniversityLogo
                  id={person.universityId}
                  size="sm"
                  variant="art"
                  className="app-profile-public__crest"
                />
              ) : null}
              <Text role="small" tone="muted">
                {person.university || 'University not added'}
              </Text>
            </span>

            <span className="app-profile-public__place">
              {flagCode ? (
                <img
                  className="app-profile-public__flag"
                  src={publicUrl(`/flags/${flagCode}.svg`)}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                />
              ) : null}
              <Text role="small" tone="muted">
                From {person.country || 'not added'}
              </Text>
            </span>
          </Cluster>
        </Stack>

        {person.note ? (
          <Text role="body" tone="muted" className="app-profile-public__note">
            {person.note}
          </Text>
        ) : null}

        {person.isSample && onToggleFriend ? (
          <Cluster gap={3} align="center">
            <Button
              size="small"
              variant={isFriend ? 'secondary' : 'primary'}
              aria-pressed={isFriend}
              onClick={onToggleFriend}
            >
              {isFriend ? 'Following' : 'Follow'}
            </Button>
            <DemoBadge variant="sample" />
          </Cluster>
        ) : null}

        {person.isSample ? (
          <Text role="small" tone="subtle" className="app-profile-public__honesty">
            This is a sample profile. Friend connections are saved locally for
            this demo.
          </Text>
        ) : null}
      </Stack>
    </article>
  );
}
