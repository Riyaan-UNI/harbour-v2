import { useEffect, useRef } from "react";

/**
 * useHarbourReveal — IntersectionObserver-driven scroll reveal.
 * Attaches to a container ref and adds the `harbour-revealed` class to
 * every `.harbour-reveal` descendant when it enters the viewport.
 *
 * Dependency-free: uses the native IntersectionObserver API.
 * Respects prefers-reduced-motion (shows immediately).
 */
export function useHarbourReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const calm = document.documentElement.dataset.calm === "true";
    const targets = root.querySelectorAll(".harbour-reveal");

    if (reduced || calm || !("IntersectionObserver" in window)) {
      targets.forEach(t => t.classList.add("harbour-revealed"));
      return undefined;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("harbour-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -5% 0px",
    });

    targets.forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return ref;
}
