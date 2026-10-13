import { countryOptions } from "../lib/countries.js";

export default function CountrySelect({ value, onChange, ...props }) {
  return <select value={value || ""} onChange={onChange} {...props}>
    <option value="" disabled>Select a country or region</option>
    {countryOptions.map(country => <option value={country.code} key={country.code}>{country.name}</option>)}
    <option value="OTHER">Another region / prefer not to say</option>
  </select>;
}
