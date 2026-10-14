import countries from 'i18n-iso-countries';
import english from 'i18n-iso-countries/langs/en.json';
import {
  UNIVERSITIES,
  isUniversityId,
  type UniversityId,
} from '../components/ui';

/**
 * profile-facts — resolve the profile store's dual-shaped facts.
 *
 * The store's `country` and `university` fields are deliberately polymorphic
 * (`outputs/profile-requirements.md` §3, F2/F3): a profile this app wrote
 * carries an **ISO alpha-2 code** and a **manifest `universityId`**, while a
 * profile rescued from the older build carries the **display strings** it
 * always did ("Taiwan, China", "The University of Hong Kong"). The page must
 * read either without assuming one, so the two resolvers live here rather than
 * being re-derived at each call site.
 *
 * This is a small v2-lane wrapper over the `i18n-iso-countries` package the app
 * already depends on — it does not import the legacy lane's helper, and it
 * keeps the three region corrections (HK/MO/TW are parts of China) so the app
 * never presents them as separate countries, exactly as the signup combobox
 * does.
 */

countries.registerLocale(english);

/** Hong Kong, Macao and Taiwan are parts of China — corrected English names. */
export const REGION_OVERRIDES: Record<string, string> = {
  HK: 'Hong Kong, China',
  MO: 'Macao, China',
  TW: 'Taiwan, China',
};

/** The sentinel the legacy picker used for "not on the list". */
const OTHER_SENTINEL = 'OTHER';

export type CountryFact = {
  /** The readable display name. "Not added" when there is nothing to show. */
  name: string;
  /** A lowercase ISO code for the flag, when the value was (or maps to) one. */
  code?: string;
};

/**
 * Resolve a stored country value to a display name and an optional flag code.
 *
 * - A two-letter value is treated as an ISO alpha-2 code and looked up;
 * - any other non-empty value is already a display string and is shown as-is;
 * - an empty value renders "Not added".
 */
export function resolveCountry(value: string | undefined): CountryFact {
  const raw = value?.trim() ?? '';
  if (!raw) return { name: 'Not added' };
  if (raw === OTHER_SENTINEL) return { name: 'Another region' };

  if (/^[A-Za-z]{2}$/.test(raw)) {
    const upper = raw.toUpperCase();
    const name =
      REGION_OVERRIDES[upper] ?? countries.getName(upper, 'en') ?? raw;
    return { name, code: upper.toLowerCase() };
  }

  // A display string like "Ghana" or "Taiwan, China". If it names a region we
  // know by name, recover its code so the flag can follow the text.
  const lower = raw.toLowerCase();
  const entry = Object.entries(countries.getNames('en')).find(
    ([, englishName]) => englishName.toLowerCase() === lower,
  );
  return entry
    ? { name: raw, code: entry[0].toLowerCase() }
    : { name: raw };
}

export type UniversityFact = {
  /** The full institution name, or the raw display string as a fallback. */
  name: string;
  /** The manifest id, when the value maps to one (`<UniversityLogo>` needs it). */
  id?: UniversityId;
};

/**
 * Resolve a stored university value to a display name and an optional id.
 *
 * - A manifest id ("hku") resolves to its canonical name and id;
 * - a display string matches the manifest by full name or acronym;
 * - anything else is shown verbatim, with no logo (the raw-string fallback the
 *   requirement asks for).
 */
export function resolveUniversity(value: string | undefined): UniversityFact {
  const raw = value?.trim() ?? '';
  if (!raw) return { name: '' };

  if (isUniversityId(raw)) {
    const entry = UNIVERSITIES.find((item) => item.id === raw);
    return { name: entry?.name ?? raw, id: raw };
  }

  const lower = raw.toLowerCase();
  const byName = UNIVERSITIES.find(
    (item) =>
      item.name.toLowerCase() === lower || item.acronym.toLowerCase() === lower,
  );
  return byName ? { name: byName.name, id: byName.id } : { name: raw };
}

export { OTHER_SENTINEL };
