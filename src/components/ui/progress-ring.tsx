import { cn } from '../../lib/cn';

/**
 * ProgressRing — the progress indicator spec §8 lists for Brick 2b, built in
 * Brick 4 because the landing's Settle-in sample is its first consumer.
 *
 * The shape is an SVG ring in a 100-unit viewBox, so the geometry is unitless
 * and scales with the box. The visible number beside it is the caller's: a
 * progress indicator is never the only carrier of meaning (Addendum 1 rule 4),
 * so the ring itself is `aria-hidden` decoration and the words carry it.
 *
 * It is deliberately static — no animation, no count-up. A percentage that
 * eases into place is a number performing for someone who asked for a fact,
 * and the spec's motion rules animate transform and opacity only, which a
 * stroke's dash array is not. Under reduced motion there is nothing to
 * switch off, because there is nothing moving.
 */

export type ProgressRingSize = 'sm' | 'md' | 'lg';

export type ProgressRingProps = {
  /** Progress from 0 to 1. Clamped, never asserted. */
  value: number;
  /** Box size: sm 2.5rem, md 3rem, lg 4.5rem. */
  size?: ProgressRingSize;
  className?: string;
};

/** Radius inside the 100-unit box; the ring is inset from the edge. */
const RADIUS = 42;

/** 2πr in the same units, computed once — the dash array needs it. */
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({
  value,
  size = 'md',
  className,
}: ProgressRingProps): JSX.Element {
  const safe = Number.isFinite(value) ? value : 0;
  const clamped = Math.min(1, Math.max(0, safe));

  return (
    <svg
      className={cn('progress-ring', `progress-ring--${size}`, className)}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="progress-ring__track" cx="50" cy="50" r={RADIUS} />
      <circle
        className="progress-ring__value"
        cx="50"
        cy="50"
        r={RADIUS}
        strokeDasharray={`${(clamped * CIRCUMFERENCE).toFixed(2)} ${CIRCUMFERENCE.toFixed(2)}`}
      />
    </svg>
  );
}
