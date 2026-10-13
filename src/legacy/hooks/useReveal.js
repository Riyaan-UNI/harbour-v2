import { useEffect } from "react";

/** Reveals every [data-reveal] descendant once it scrolls into view.
    Elements are only hidden after the observer has claimed them, so anything
    rendered later stays visible instead of getting stuck at opacity 0.
    IntersectionObserver is the primary mechanism; reduced motion skips it. */
export function useReveal(rootRef, key) {
  useEffect(() => {
    const root = rootRef?.current;
    if (!root) return undefined;

    const targets = Array.from(root.querySelectorAll("[data-reveal]:not(.reveal-init):not(.is-revealed)"));
    if (!targets.length) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove("reveal-init");
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    targets.forEach(target => {
      target.classList.add("reveal-init");
      observer.observe(target);
    });

    return () => observer.disconnect();
  }, [rootRef, key]);
}

export default useReveal;
