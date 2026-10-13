export default function ToolPageHeading({ eyebrow, title, description, narrow = false }) {
  return <header className={`figma-tool-heading ${narrow ? "is-narrow" : ""}`}><span className="figma-tool-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></header>;
}
