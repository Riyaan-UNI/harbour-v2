import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";

/** Progressive enhancement: route transitions run inside document.startViewTransition
    when the browser supports it and the user has not asked for reduced motion.
    Falls back to a plain navigate everywhere else. */
export function useViewTransitionNavigate() {
  const navigate = useNavigate();

  return useCallback((to, options) => {
    const reduced = typeof window !== "undefined"
      && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (typeof document === "undefined" || !document.startViewTransition || reduced) {
      navigate(to, options);
      return;
    }

    try {
      document.startViewTransition(() => {
        flushSync(() => navigate(to, options));
      });
    } catch {
      navigate(to, options);
    }
  }, [navigate]);
}

export default useViewTransitionNavigate;
