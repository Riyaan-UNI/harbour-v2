/* One shared ambient background. Blobs drift with transform only — the blur is
   static, never animated. Two blobs on small screens, static under reduced motion. */
export default function BlobBackground({ className = "" }) {
  return (
    <div className={`blob-bg ${className}`.trim()} aria-hidden="true">
      <span className="blob blob-a" />
      <span className="blob blob-b" />
      <span className="blob blob-c" />
    </div>
  );
}
