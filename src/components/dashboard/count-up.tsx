import { useEffect, useRef, useState } from 'react';
import { VisuallyHidden } from '../layout';
import { motionAllowed } from './dashboard-data';

/**
 * CountUp — module 2's KPI figure.
 *
 * A JS text interpolation (not a CSS animation), so it does not touch layout
 * and does not break the "animate transform and opacity only" rule. It runs
 * once, 0 → value, over `--dur-slow` (0.6s) with a power1.out ease — the two
 * values the spec's entrance table names (§6.2).
 *
 * Reduced motion: under `prefers-reduced-motion: reduce` or calm mode the final
 * integer renders immediately with no tween. The animated digits are
 * `aria-hidden`; a sibling `VisuallyHidden` span carries the real value, so
 * assistive tech always reads the true number and never a moving one.
 */

/** `--dur-slow`, in milliseconds — the token is 600ms (spec §7). */
const DURATION = 600;

export type CountUpProps = {
  value: number;
  className?: string;
};

export function CountUp({ value, className }: CountUpProps): JSX.Element {
  const target = Number.isFinite(value) ? Math.round(value) : 0;
  const [display, setDisplay] = useState(() => (motionAllowed() ? 0 : target));
  const frame = useRef(0);
  const shown = useRef(0);

  useEffect(() => {
    if (!motionAllowed()) {
      shown.current = target;
      setDisplay(target);
      return undefined;
    }

    const from = shown.current;
    if (from === target) return undefined;

    const start = performance.now();

    const tick = (now: number): void => {
      const t = Math.min((now - start) / DURATION, 1);
      // power1.out (Quad ease-out) — the ease the spec names for the count-up.
      const eased = 1 - Math.pow(1 - t, 2);
      const next = Math.round(from + (target - from) * eased);
      shown.current = next;
      setDisplay(next);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target]);

  return (
    <span className={className}>
      <span aria-hidden="true">{display}</span>
      <VisuallyHidden>{target}</VisuallyHidden>
    </span>
  );
}
