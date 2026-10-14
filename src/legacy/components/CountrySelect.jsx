import { useMemo, useRef, useState } from "react";
import { countryOptions } from "../lib/countries.js";
import { useDialogAccessibility } from "../hooks/useDialogAccessibility.js";
import SearchField from "./SearchField.jsx";
import CountryFlag from "./CountryFlag.jsx";

export default function CountrySelect({ id, value, onChange, required = false, ...props }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dialogRef = useRef(null);
  const searchRef = useRef(null);
  useDialogAccessibility({ open, dialogRef, initialFocusRef: searchRef, onClose: () => setOpen(false) });

  const options = useMemo(() => [
    ...countryOptions,
    { code: "OTHER", name: "Another region / prefer not to say" },
  ], []);
  const matches = options.filter(country => country.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const selected = options.find(country => country.code === value);

  function choose(code) {
    onChange({ target: { value: code } });
    setOpen(false);
    setQuery("");
  }

  return <>
    <button
      {...props}
      id={id}
      type="button"
      className={`country-trigger${selected ? " has-selection" : ""}`}
      aria-haspopup="dialog"
      aria-required={required || undefined}
      aria-label={selected ? `Home country or region: ${selected.name}. Change` : "Choose your home country or region"}
      onClick={() => setOpen(true)}
    >
      <CountryFlag code={selected?.code} />
      <span className="country-trigger-label">{selected?.name || "Choose a country or region"}<small>{selected ? "Home country or region" : "Search more than 200 countries and regions"}</small></span>
      <span className="country-trigger-chevron" aria-hidden="true">⌄</span>
    </button>
    {open && <div className="country-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="country-dialog" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="country-title">
        <button type="button" className="country-close" onClick={() => setOpen(false)} aria-label="Close country picker">×</button>
        <span className="eyebrow">YOUR HOME REGION</span>
        <h2 id="country-title">Where are you from?</h2>
        <p>Choose the country or region you call home.</p>
        <SearchField className="country-search" inputRef={searchRef} label="Search countries and regions" value={query} onChange={event => setQuery(event.target.value)} placeholder="Type a country or region…" />
        <div className="country-options" role="listbox" aria-label="Countries and regions">
          {matches.map(country => <button type="button" role="option" aria-selected={value === country.code} className={`country-option${value === country.code ? " selected" : ""}`} key={country.code} onClick={() => choose(country.code)}>
            <CountryFlag code={country.code} />
            <span>{country.name}</span>
            {value === country.code && <span className="country-option-check" aria-hidden="true">✓</span>}
          </button>)}
          {!matches.length && <p className="country-empty">No match. Try another spelling.</p>}
        </div>
      </section>
    </div>}
  </>;
}
