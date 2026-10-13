import { Icon } from "./Icons.jsx";

/** Shared, responsive search input used anywhere Harbour filters a collection. */
export default function SearchField({
  label,
  value,
  onChange,
  placeholder = "Search…",
  className = "",
  inputRef,
  autoComplete = "off",
}) {
  return (
    <label className={`search-field ${className}`.trim()}>
      <Icon name="search" size={20} aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={label}
        autoComplete={autoComplete}
      />
    </label>
  );
}
