/* Circular progress indicator. Colour is never the only signal — the
   percentage is always rendered as text too. */
export default function ProgressRing({ value = 0, size = 132, stroke = 12, label }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <div className="progress-ring-wrap" style={{ position: "relative", width: size, height: size }}>
      <svg
        className="progress-ring"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${Math.round(pct)}% complete`}
      >
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
        <circle
          className="ring-value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeContent: "center",
          textAlign: "center",
          gap: 2,
        }}
      >
        <strong style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-24)", color: "var(--text-strong)" }}>
          {Math.round(pct)}%
        </strong>
        {label ? <small style={{ color: "var(--text-muted)", fontSize: "var(--fs-12)" }}>{label}</small> : null}
      </div>
    </div>
  );
}
