import { useEffect, useRef } from "react";

/**
 * ScrollProgress — a thin gold-to-coral progress bar at the very top of
 * the viewport that fills as the user scrolls. Pure CSS transition,
 * rAF-throttled scroll listener. Hidden in calm/reduced-motion mode.
 *
 * Dependency-free.
 */
export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const calm = document.documentElement.dataset.calm === "true";
    if (calm || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let ticking = false;
    const update = () => {
      const scroll = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, (scroll / max) * 100) : 0;
      if (barRef.current) barRef.current.style.width = `${pct}%`;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div className="harbour-scroll-progress" ref={barRef} aria-hidden="true" />;
}
