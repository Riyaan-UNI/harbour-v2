import { Icon } from "./Icons.jsx";

/* Additive props only: existing callers keep working unchanged. */
export default function Button({ children, variant = "primary", loading = false, icon, className = "", disabled, type = "button", ...props }) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      className={`button ${variant} ${loading ? "is-loading" : ""} ${className}`.trim()}
      aria-busy={loading ? "true" : undefined}
      {...props}
      disabled={isDisabled}
    >
      {icon ? <Icon name={icon} size={18} /> : null}
      {children}
    </button>
  );
}
