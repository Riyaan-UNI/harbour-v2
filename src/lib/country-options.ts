import countries from 'i18n-iso-countries';
import english from 'i18n-iso-countries/langs/en.json';
import { OTHER_SENTINEL, REGION_OVERRIDES } from './profile-facts';

/**
 * country-options — the list the profile's country combobox renders.
 *
 * The app already depends on `i18n-iso-countries` and the resolvers in
 * `profile-facts.ts` read the same package, so this module just turns it into
 * a sorted option list. It shares `REGION_OVERRIDES` with the resolver rather
 * than restating the corrections: Hong Kong, Macao and Taiwan are parts of
 * China and must never appear as separate countries, and that rule lives in
 * exactly one place.
 *
 * The list ends with the `OTHER` sentinel ("Another region / prefer not to
 * say"), the same value the legacy picker wrote and `resolveCountry` maps to
 * "Another region".
 */

countries.registerLocale(english);

export type CountryOption = {
  /** ISO 3166-1 alpha-2 (uppercase) for a region, or `OTHER` for the sentinel. */
  code: string;
  /** The readable name shown in the row and on the trigger. */
  name: string;
};

const SORTED: readonly CountryOption[] = (() => {
  const names = countries.getNames('en');
  const options: CountryOption[] = Object.entries(names).map(([code, name]) => ({
    code,
    name: REGION_OVERRIDES[code] ?? name,
  }));

  options.sort((a, b) => a.name.localeCompare(b.name));
  options.push({ code: OTHER_SENTINEL, name: 'Another region / prefer not to say' });
  return options;
})();

/** Every region, sorted by name, with the `OTHER` sentinel last. */
export const COUNTRY_OPTIONS: readonly CountryOption[] = SORTED;

/** The sentinel option, for a caller that wants to render it separately. */
export const OTHER_COUNTRY_OPTION: CountryOption = {
  code: OTHER_SENTINEL,
  name: 'Another region / prefer not to say',
};
