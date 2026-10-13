import { Icon } from "./Icons.jsx";

const TONE_ICON = {
  success: "check",
  warning: "alert",
  danger: "alert",
  info: "info",
  neutral: "dot",
};

/* Status is always colour + icon + label, never colour alone. */
export default function StatusBadge({ tone = "neutral", icon, children, className = "" }) {
  const name = icon || TONE_ICON[tone] || "info";
  return (
    <span className={`status-badge is-${tone} ${className}`.trim()}>
      <Icon name={name} size={16} />
      <span>{children}</span>
    </span>
  );
}
