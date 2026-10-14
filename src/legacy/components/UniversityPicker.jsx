import { useRef, useState } from "react";
import { hkUniversities } from "../data/hkUniversities.js";
import { useDialogAccessibility } from "../hooks/useDialogAccessibility.js";
import SearchField from "./SearchField.jsx";
import { UniversityLogo } from "../../components/ui/university-logo";

export default function UniversityPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dialogRef = useRef(null);
  const searchRef = useRef(null);
  useDialogAccessibility({ open, dialogRef, initialFocusRef: searchRef, onClose: () => setOpen(false) });
  const matches = hkUniversities.filter(item => item.name.toLowerCase().includes(query.toLowerCase()) || item.short.toLowerCase().includes(query.toLowerCase()));
  const selected = hkUniversities.find(item => item.name === value);
  return <>
    <button type="button" className={`university-trigger ${selected ? "has-selection" : ""}`} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={selected ? `University: ${value}. Change` : "Choose your university, optional"}>
      {selected ? <UniversityLogo id={selected.id} size="md" variant="art"/> : <span className="university-trigger-icon" aria-hidden="true">＋</span>}
      <span className="university-trigger-label">{value || "Choose a Hong Kong university"}<small>{selected ? "Your university" : "Optional · search the list"}</small></span><b aria-hidden="true">⌄</b>
    </button>
    {open && <div className="university-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}><section className="university-dialog" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="university-title">
      <button type="button" className="university-close" onClick={() => setOpen(false)} aria-label="Close university picker">×</button><span className="eyebrow">YOUR CAMPUS</span><h2 id="university-title">Where will you study?</h2><p>Choose your Hong Kong university, or leave this for later.</p><SearchField className="university-search" inputRef={searchRef} label="Search universities" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search universities…" />
      <div className="university-options" role="listbox" aria-label="Hong Kong universities">{matches.map(item => <button type="button" role="option" aria-selected={value === item.name} className={`university-option ${value === item.name ? "selected" : ""}`} key={item.id} onClick={() => { onChange(item.name); setOpen(false); setQuery(""); }}><UniversityLogo id={item.id} size="md" variant="art"/><span><strong>{item.name}</strong><small>{item.short}</small></span><b aria-hidden="true">{value === item.name ? "✓" : "→"}</b></button>)}{!matches.length && <p className="university-empty">No match. You can leave this optional field blank.</p>}</div>
      <button type="button" className="university-skip" onClick={() => { onChange(""); setOpen(false); setQuery(""); }}>I’ll add this later</button>
    </section></div>}
  </>;
}
