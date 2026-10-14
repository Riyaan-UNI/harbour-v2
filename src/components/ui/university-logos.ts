/**
 * The university list — spec §10, and the typed manifest `UniversityLogo`
 * resolves against.
 *
 * The names, acronyms and ids are the spec's table, verbatim. The `logo` paths
 * are the canonical public paths the spec names (`/logos/<id>.svg`), which is
 * where a bundled file must sit: logos are never hotlinked and never fetched
 * from an institution's own domain.
 *
 * **All eight logo files are now bundled** in `public/logos/` (see the README
 * beside them for provenance). Seven are SVG; `cuhk` is a PNG, because no SVG
 * of the current CUHK emblem exists on Wikimedia — that is the one path below
 * that does not end in `.svg`.
 *
 * Provenance rule (spec §14): a logo must come from the institution's own
 * official media page, and it may be used only to identify that institution.
 * Never recolour one, never crop it, never redraw it. The files here came from
 * Wikimedia rather than each institution's media page — a documented deviation,
 * recorded in `public/logos/README.md`.
 */

import { publicUrl } from '../../lib/public-url';

export type UniversityId =
  | 'hku'
  | 'cuhk'
  | 'hkust'
  | 'polyu'
  | 'cityu'
  | 'hkbu'
  | 'lingnan'
  | 'eduhk'
  | 'other';

export type University = {
  id: UniversityId;
  /** The full name, used as the logo's alt text. */
  name: string;
  /** The short code shown in the acronym fallback. Empty for `other`. */
  acronym: string;
  /**
   * The bundled file, or `null` when the box must use the generic mark.
   * Always a repo-local path — never a remote URL.
   */
  logo: string | null;
  /**
   * The bundled concept-art SVG, or `null` for `other`. The art is a decorative
   * rendering — orbiting rings, a coloured field and a near-white bed under
   * the mark — built by `scripts/build-university-art.mjs` and committed into
   * `public/logos/art/`. Each file is `prefers-reduced-motion: reduce`-aware,
   * so the static composition is what users with reduced motion see.
   *
   * The art is **never** used as the identifying mark itself. The plain logo
   * is what identifies the institution. The art is for surfaces where the
   * institution is already named in text nearby — a picker row, a saved
   * profile chip, a hero panel — and the mark is decorative colour.
   */
  art: string | null;
  /** `false` for `other`: it is the absence of an institution, not one. */
  enrolled: boolean;
};

/**
 * The nine rows of spec §10. Ordered as the spec orders them, with `other`
 * last, so a dropdown built from this array needs no sorting.
 */
const RAW_UNIVERSITIES: readonly University[] = [
  {
    id: 'hku',
    name: 'The University of Hong Kong',
    acronym: 'HKU',
    logo: '/logos/hku.svg',
    art: '/logos/art/hku.svg',
    enrolled: true,
  },
  {
    id: 'cuhk',
    name: 'The Chinese University of Hong Kong',
    acronym: 'CUHK',
    logo: '/logos/cuhk.png',
    art: '/logos/art/cuhk.svg',
    enrolled: true,
  },
  {
    id: 'hkust',
    name: 'The Hong Kong University of Science and Technology',
    acronym: 'HKUST',
    logo: '/logos/hkust.svg',
    art: '/logos/art/hkust.svg',
    enrolled: true,
  },
  {
    id: 'polyu',
    name: 'The Hong Kong Polytechnic University',
    acronym: 'PolyU',
    logo: '/logos/polyu.svg',
    art: '/logos/art/polyu.svg',
    enrolled: true,
  },
  {
    id: 'cityu',
    name: 'City University of Hong Kong',
    acronym: 'CityU',
    logo: '/logos/cityu.svg',
    art: '/logos/art/cityu.svg',
    enrolled: true,
  },
  {
    id: 'hkbu',
    name: 'Hong Kong Baptist University',
    acronym: 'HKBU',
    logo: '/logos/hkbu.svg',
    art: '/logos/art/hkbu.svg',
    enrolled: true,
  },
  {
    id: 'lingnan',
    name: 'Lingnan University',
    acronym: 'LU',
    logo: '/logos/lingnan.svg',
    art: '/logos/art/lingnan.svg',
    enrolled: true,
  },
  {
    id: 'eduhk',
    name: 'The Education University of Hong Kong',
    acronym: 'EdUHK',
    logo: '/logos/eduhk.svg',
    art: '/logos/art/eduhk.svg',
    enrolled: true,
  },
  {
    id: 'other',
    name: 'Other / not enrolled yet',
    acronym: '',
    logo: null,
    art: null,
    enrolled: false,
  },
];

/**
 * The manifest as the app reads it. The paths above are written root-relative
 * (`/logos/hku.svg`); `publicUrl` adds the deploy base, so they also resolve on
 * GitHub Pages' sub-path. At the root base nothing changes.
 */
export const UNIVERSITIES: readonly University[] = RAW_UNIVERSITIES.map(
  (university) => ({
    ...university,
    logo: university.logo === null ? null : publicUrl(university.logo),
    art: university.art === null ? null : publicUrl(university.art),
  }),
);

/** Every id, in manifest order. */
export const UNIVERSITY_IDS: readonly UniversityId[] = UNIVERSITIES.map(
  (university) => university.id,
);

/**
 * A flat `id → art path` lookup for callers that just need the path — the
 * login art stage and the signup step-3 illustration, both of which already
 * know the id and only want the URL. `undefined` for ids with no art
 * (`other`); callers should treat the absence as "no decoration" rather
 * than as an error.
 */
export const UNIVERSITY_ART_BY_ID: Readonly<Partial<Record<UniversityId, string>>> =
  Object.fromEntries(
    UNIVERSITIES.filter((university) => university.art !== null).map(
      (university) => [university.id, university.art as string],
    ),
  );

const BY_ID = new Map<UniversityId, University>(
  UNIVERSITIES.map((university) => [university.id, university]),
);

export function universityById(id: UniversityId): University {
  const found = BY_ID.get(id);
  if (!found) {
    // Unreachable while `id` is typed, but a stored profile is not typed.
    throw new Error(`Harbour: unknown university id "${id}".`);
  }
  return found;
}

/** The ids that are expected to have a bundled file. `other` has none. */
export const UNIVERSITY_LOGO_IDS: readonly UniversityId[] = UNIVERSITIES.filter(
  (university) => university.logo !== null,
).map((university) => university.id);

export function isUniversityId(value: unknown): value is UniversityId {
  return typeof value === 'string' && BY_ID.has(value as UniversityId);
}
