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
 * The hook returns nothing and takes no options on purpose — the moment a
 * caller can pass options is the moment two pages can disagree about scroll
 * behaviour.
 */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function useLenis(): void {
  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return undefined;

    const lenis = new Lenis({ autoRaf: true });
    return () => {
      lenis.destroy();
    };
  }, []);
}
