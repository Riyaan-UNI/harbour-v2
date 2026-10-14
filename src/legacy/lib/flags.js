/**
 * Flag artwork for the country picker.
 *
 * The files in `public/flags/` are copied out of `flag-icons` by
 * `npm run sync:flags` and keyed by ISO 3166-1 alpha-2 — the same codes
 * `i18n-iso-countries` hands us in `countries.js`. Nothing is fetched from the
 * network at runtime and no institution's or service's domain is hotlinked.
 *
 * A flag is always decorative here: the country name is rendered as text beside
 * it, so the image carries `alt=""` and never needs a label of its own.
 */

/** Two uppercase letters, the only shape that has a file. */
const CODE = /^[A-Z]{2}$/;

/**
 * The bundled flag for a country code, or `null` when there is none.
 *
 * `null` is the normal answer for the picker's "Another region / prefer not to
 * say" sentinel and for an empty or malformed code, so a caller can fall back
 * to the two-letter tile without a second check.
 */
export function flagSrc(code) {
  if (typeof code !== "string" || !CODE.test(code)) return null;
  return `/flags/${code.toLowerCase()}.svg`;
}
