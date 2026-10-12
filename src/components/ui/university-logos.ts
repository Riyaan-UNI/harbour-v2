/**
 * The university list — spec §10, and the typed manifest `UniversityLogo`
 * resolves against.
 *
 * The names, acronyms and ids are the spec's table, verbatim. The `logo` paths
 * are the canonical public paths the spec names (`/logos/<id>.svg`), which is
 * where a bundled file must sit: logos are never hotlinked and never fetched
 * from an institution's own domain.
 *
 * **No logo file is bundled yet.** A search of `public/`, `src/assets/` and the
 * previous build found no university artwork at all — only the three Harbour
 * brand marks (`/harbour-logo.svg`, `/harbour-mark.svg`, `/favicon.svg`). So
 * every path below currently 404s and every box falls back to its acronym, by
 * design rather than by accident. Dropping a file at the matching path is the
 * only change needed to light one up; nothing here has to move.
 *
 * Provenance rule (spec §14): a logo must come from the institution's own
 * official media page, and it may be used only to identify that institution.
 * Never recolour one, never crop it, never redraw it.
 */

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
  /** `false` for `other`: it is the absence of an institution, not one. */
  enrolled: boolean;
};

/**
 * The nine rows of spec §10. Ordered as the spec orders them, with `other`
 * last, so a dropdown built from this array needs no sorting.
 */
export const UNIVERSITIES: readonly University[] = [
  {
    id: 'hku',
    name: 'The University of Hong Kong',
    acronym: 'HKU',
    logo: '/logos/hku.svg',
    enrolled: true,
  },
  {
    id: 'cuhk',
    name: 'The Chinese University of Hong Kong',
    acronym: 'CUHK',
    logo: '/logos/cuhk.svg',
    enrolled: true,
  },
  {
    id: 'hkust',
    name: 'The Hong Kong University of Science and Technology',
    acronym: 'HKUST',
    logo: '/logos/hkust.svg',
    enrolled: true,
  },
  {
    id: 'polyu',
    name: 'The Hong Kong Polytechnic University',
    acronym: 'PolyU',
    logo: '/logos/polyu.svg',
    enrolled: true,
  },
  {
    id: 'cityu',
    name: 'City University of Hong Kong',
    acronym: 'CityU',
    logo: '/logos/cityu.svg',
    enrolled: true,
  },
  {
    id: 'hkbu',
    name: 'Hong Kong Baptist University',
    acronym: 'HKBU',
    logo: '/logos/hkbu.svg',
    enrolled: true,
  },
  {
    id: 'lingnan',
    name: 'Lingnan University',
    acronym: 'LU',
    logo: '/logos/lingnan.svg',
    enrolled: true,
  },
  {
    id: 'eduhk',
    name: 'The Education University of Hong Kong',
    acronym: 'EdUHK',
    logo: '/logos/eduhk.svg',
    enrolled: true,
  },
  {
    id: 'other',
    name: 'Other / not enrolled yet',
    acronym: '',
    logo: null,
    enrolled: false,
  },
];

/** Every id, in manifest order. */
export const UNIVERSITY_IDS: readonly UniversityId[] = UNIVERSITIES.map(
  (university) => university.id,
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
