/* Skeleton loaders. Always reserve the final height so nothing shifts. */

export function Skeleton({ variant = "line", width, height, className = "", style }) {
  const variantClass = {
    line: "sk sk--line",
    text: "sk sk--text",
    title: "sk sk--title",
    pill: "sk sk--pill",
    card: "sk sk--card",
    block: "sk",
  }[variant] || "sk sk--line";

  return (
    <span
      className={`${variantClass} ${className}`.trim()}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}

export function SkeletonLines({ count = 3, widths, className = "" }) {
  return (
    <span className={`skeleton-stack ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton
          key={index}
          variant="line"
          width={widths ? widths[index % widths.length] : index === count - 1 ? "62%" : "100%"}
        />
      ))}
    </span>
  );
}

/* A polite live region so assistive tech hears that content is loading. */
export function LoadingRegion({ label = "Loading content", children }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="harbour-visually-hidden">{label}</span>
      {children}
    </div>
  );
}

export default Skeleton;
