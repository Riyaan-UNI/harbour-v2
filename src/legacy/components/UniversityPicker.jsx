import { useRef, useState } from "react";
import { hkUniversities } from "../data/hkUniversities.js";
import { useDialogAccessibility } from "../hooks/useDialogAccessibility.js";
import SearchField from "./SearchField.jsx";

function UniversityLogo({ university }) {
  const [failed, setFailed] = useState(false);
  return failed || university.monogram
    ? <span className="university-monogram" style={{ "--uni-color": university.color }}>{university.short}</span>
    : <img className="university-logo" src={`https://www.google.com/s2/favicons?domain=${university.domain}&sz=128`} alt="" onError={() => setFailed(true)} />;
}

export default function UniversityPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dialogRef = useRef(null);
  const searchRef = useRef(null);
  useDialogAccessibility({ open, dialogRef, initialFocusRef: searchRef, onClose: () => setOpen(false) });
  const matches = hkUniversities.filter(item => item.name.toLowerCase().includes(query.toLowerCase()) || item.short.toLowerCase().includes(query.toLowerCase()));
  const selected = hkUniversities.find(item => item.name === value);
  return <>
    <button type="button" className={`university-trigger ${selected ? "has-selection" : ""}`} onClick={() => setOpen(true)} aria-haspopup="dialog">
      {selected && <UniversityLogo university={selected} />}<span>{value || "Choose a Hong Kong university"}</span><b>⌄</b>
    </button>
    {open && <div className="university-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}><section className="university-dialog" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="university-title">
      <button type="button" className="university-close" onClick={() => setOpen(false)} aria-label="Close university picker">×</button><span className="eyebrow">YOUR CAMPUS</span><h2 id="university-title">Choose your university.</h2><p>Pick from Hong Kong’s eight UGC-funded universities.</p><SearchField className="university-search" inputRef={searchRef} label="Search universities" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search universities…" />
      <div className="university-options">{matches.map(item => <button type="button" className={`university-option ${value === item.name ? "selected" : ""}`} key={item.short} onClick={() => { onChange(item.name); setOpen(false); setQuery(""); }}><UniversityLogo university={item}/><span><strong>{item.name}</strong><small>{item.short}</small></span><b>{value === item.name ? "✓" : "↗"}</b></button>)}{!matches.length && <p className="university-empty">No match. You can leave this optional field blank.</p>}</div>
      <button type="button" className="university-skip" onClick={() => { onChange(""); setOpen(false); setQuery(""); }}>I’ll add this later</button>
    </section></div>}
  </>;
}
