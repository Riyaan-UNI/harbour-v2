import { useEffect, useRef, useState } from "react";

/* Counts a number up (or down) whenever `value` changes.
   Only the text node updates — no layout properties are animated. */
export default function CountUp({ value, duration = 650, format, className = "" }) {
  const target = Number.isFinite(Number(value)) ? Number(value) : 0;
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  const frameRef = useRef(0);

  useEffect(() => {
    const from = displayRef.current;
    const to = target;
    if (from === to) return undefined;

    const reduced = typeof window !== "undefined"
      && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof requestAnimationFrame !== "function") {
      displayRef.current = to;
      setDisplay(to);
      return undefined;
    }

    const start = performance.now();
    const tick = now => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (to - from) * eased);
      displayRef.current = next;
      setDisplay(next);
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return <span className={`count-up ${className}`.trim()}>{format ? format(display) : display}</span>;
}
