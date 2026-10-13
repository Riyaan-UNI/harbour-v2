/* The Harbour wave motif: a gentle swell that settles into a calm line. */
export default function WaveDivider({ className = "", label }) {
  return (
    <svg
      className={`wave-divider ${className}`.trim()}
      viewBox="0 0 680 28"
      preserveAspectRatio="none"
      role={label ? "img" : undefined}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      focusable="false"
    >
      {label ? <title>{label}</title> : null}
      <path
        d="M0 19c56 0 84-15 140-15s84 15 140 15 84-15 140-15 84 15 140 15 84-15 120-15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M0 26.5h680" stroke="currentColor" strokeWidth="1" opacity="0.45" />
    </svg>
  );
}

export function WaveLoader({ label = "Loading", className = "" }) {
  return (
    <span className={`wave-loader ${className}`.trim()} role="status" aria-label={label}>
      <i /><i /><i /><i /><i />
    </span>
  );
}
