import { useEffect, useRef } from "react";

/* Progressive disclosure. Stays uncontrolled so native <details> toggling
   keeps working; `defaultOpen` is applied once on mount. */
export default function Expander({ summary, children, defaultOpen = false, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (defaultOpen && ref.current) ref.current.open = true;
  }, [defaultOpen]);

  return (
    <details className={`expander ${className}`.trim()} ref={ref}>
      <summary>{summary}</summary>
      <div className="expander-body">{children}</div>
    </details>
  );
}
