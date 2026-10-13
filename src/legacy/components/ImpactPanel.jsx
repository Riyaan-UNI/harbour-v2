import CountUp from "./CountUp.jsx";
import { Icon } from "./Icons.jsx";
import { Skeleton } from "./Skeleton.jsx";
import { useImpact } from "../hooks/useImpact.js";

/* F4 — Impact panel on the Dashboard. Anonymous aggregate counters only. */

const COUNTER_LABELS = {
  listingChecks: { label: "Listings checked", icon: "search" },
  leaseReads: { label: "Leases read", icon: "checklist" },
  counterCards: { label: "Counter cards made", icon: "translate" },
  drillsCompleted: { label: "Drills completed", icon: "shield" },
};

const SDG_FALLBACK = [
  { id: "10", label: "Reduced inequalities" },
  { id: "11", label: "Sustainable cities and communities" },
  { id: "16", label: "Peace, justice and strong institutions" },
];

export default function ImpactPanel() {
  const { status, data, error } = useImpact();

  if (status === "loading") {
    return (
      <section className="impact-panel" aria-label="Harbour impact" aria-busy="true">
        <div className="panel-heading"><span><small>COMMUNITY IMPACT</small><h2>What Harbour has helped with.</h2></span></div>
        <div className="impact-grid">
          {[0, 1, 2, 3].map(index => <Skeleton key={index} variant="card" style={{ minHeight: 120 }} />)}
        </div>
      </section>
    );
  }

  const counters = data?.counters || {};
  const minDisplay = data?.minDisplay ?? 5;
  const sdgs = data?.sdgDetails?.length ? data.sdgDetails : SDG_FALLBACK;
  const visible = Object.entries(COUNTER_LABELS).filter(([key]) => (counters[key] || 0) >= minDisplay);

  return (
    <section className="impact-panel" aria-label="Harbour impact">
      <div className="panel-heading">
        <span><small>COMMUNITY IMPACT</small><h2>What Harbour has helped with.</h2></span>
        <span className="chart-chip">ANONYMOUS TOTALS</span>
      </div>

      {error && <p className="panel-note">Harbour could not load the totals just now. Everything else on this page still works.</p>}

      {!error && visible.length === 0 && (
        <p className="panel-note">Totals appear here once enough students have used a tool. Nothing is shown below {minDisplay} so no single person can be identified.</p>
      )}

      {!error && visible.length > 0 && (
        <div className="impact-grid">
          {visible.map(([key, meta]) => (
            <article className="impact-card" key={key}>
              <span className="impact-icon" aria-hidden="true"><Icon name={meta.icon} size={22} /></span>
              <strong><CountUp value={counters[key] || 0} /></strong>
              <span>{meta.label}</span>
            </article>
          ))}
        </div>
      )}

      <div className="sdg-row" aria-label="Related Sustainable Development Goals">
        <span className="eyebrow">ALIGNED WITH</span>
        <div className="sdg-chips">
          {sdgs.map(sdg => (
            <span className="sdg-chip" key={sdg.id}>
              <b>SDG {sdg.id}</b>
              <span>{sdg.label}</span>
            </span>
          ))}
        </div>
      </div>

      <p className="panel-note">Counts are anonymous and carry no identifiers. Harbour never stores the text you paste.</p>
    </section>
  );
}
