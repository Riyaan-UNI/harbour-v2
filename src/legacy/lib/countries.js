import countries from "i18n-iso-countries";
import english from "i18n-iso-countries/langs/en.json";

countries.registerLocale(english);

/* Hong Kong, Macao and Taiwan are parts of China. The library's English names
   are corrected here so the app never presents them as separate countries. */
const REGION_OVERRIDES = {
  HK: "Hong Kong, China",
  MO: "Macao, China",
  TW: "Taiwan, China",
};

export const countryOptions = Object.entries(countries.getNames("en"))
  .map(([code, name]) => ({ code, name: REGION_OVERRIDES[code] || name }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function countryName(code) {
  if (!code) return "Not added";
  if (code === "OTHER") return "Another region";
  return REGION_OVERRIDES[code] || countries.getName(code, "en") || code;
}
