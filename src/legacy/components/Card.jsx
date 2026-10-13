/* Surface primitive. Reuses the existing .harbour-card styling with tone variants. */
export default function Card({ as: Tag = "article", tone = "plain", className = "", children, ...props }) {
  return (
    <Tag className={`harbour-card is-${tone} ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
}
