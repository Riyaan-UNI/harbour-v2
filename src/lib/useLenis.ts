import Lenis from 'lenis';
import { useEffect } from 'react';

/**
 * Lenis smooth scrolling — spec §2 and §7.
 *
 * Landing page only, and off entirely under `prefers-reduced-motion`: smooth
 * scrolling is motion, and the spec is explicit that a reduced-motion user gets
 * none of it. `autoRaf` lets Lenis drive its own frame loop, so there is no rAF
 * call to keep in step with anything else.
 *
 * **Anchor gliding.** The nav's three links are in-page anchors, and without
 * this they jump. Lenis' own `anchors` option handles them: it intercepts a
 * click on `a[href^="#"]`, scrolls the target into view over `duration`, and
 * takes the sticky bar into account through `offset`. The offset is
 * `--nav-height` read live from the computed style rather than hard-coded, so
 * the two stay in step if the bar's padding ever changes.
 *
 * The hook returns nothing and takes no options on purpose — the moment a
 * caller can pass options is the moment two pages can disagree about scroll
 * behaviour.
 */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Read a rem-valued custom property as a pixel number. */
function navHeightPx(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    '--nav-height',
  );
  const rem = Number.parseFloat(raw);
  if (!Number.isFinite(rem)) return 0;
  const rootFontSize = Number.parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );
  return rem * (Number.isFinite(rootFontSize) ? rootFontSize : 16);
}

export function useLenis(): void {
  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return undefined;

    const lenis = new Lenis({
      autoRaf: true,
      anchors: {
        offset: navHeightPx(),
        duration: 1.1,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
      },
    });

    return () => {
      lenis.destroy();
    };
  }, []);
}
