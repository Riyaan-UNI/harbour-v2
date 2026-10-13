import { useEffect, useRef, useState } from "react";
import Button from "./Button.jsx";
import StatusBadge from "./StatusBadge.jsx";
import ServiceError from "./ServiceError.jsx";
import { SkeletonLines } from "./Skeleton.jsx";
import { Icon } from "./Icons.jsx";
import { DRILL_SCENARIOS, useScamDrill } from "../hooks/useScamDrill.js";

/* F3 — Scam Drill, a practice mode inside Shield. Text only, always labelled. */
export default function ScamDrill() {
  const drill = useScamDrill();
  const [scamType, setScamType] = useState("fake_parcel");
  const [picked, setPicked] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!bottomRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    bottomRef.current.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [drill.turn, drill.feedback, drill.debrief]);

  const playing = drill.status === "playing" || drill.status === "loading" || drill.status === "answered";
  const busy = drill.status === "loading";

  function choose(optionId) {
    setPicked(optionId);
    drill.answer(optionId);
  }

  return (
    <div className="drill">
      <div className="drill-banner" role="note">
        <Icon name="alert" size={18} />
        <span><strong>SIMULATION</strong> — this is practice. Nothing here is a real message, number, link or account.</span>
      </div>

      {drill.status === "idle" && (
        <div className="drill-start harbour-card">
          <span className="eyebrow">PRACTICE MODE · NEW</span>
          <h2>Practise before it happens.</h2>
          <p className="panel-note">Pick a scenario and answer the way you would in real life. At the end you get a debrief and a resilience score.</p>
          <div className="filter-chips" role="group" aria-label="Choose a practice scenario">
            {DRILL_SCENARIOS.map(item => (
              <button type="button" key={item.id} className="chip" aria-pressed={scamType === item.id} onClick={() => setScamType(item.id)}>{item.label}</button>
            ))}
          </div>
          <Button type="button" onClick={() => drill.begin(scamType)} icon="shield">Start practice</Button>
        </div>
      )}

      {drill.status === "error" && <ServiceError error={drill.error} onRetry={() => drill.begin(scamType)}>
        <p>You can still practise with the checklist on this page, or read the red flags above.</p>
      </ServiceError>}

      {playing && drill.session && (
        <div className="drill-thread">
          <div className="drill-meta">
            <StatusBadge tone="info" icon="info">{drill.session.label}</StatusBadge>
            {drill.turn ? <span className="panel-note">Turn {drill.turn.index} of {drill.turn.total}</span> : null}
          </div>

          {drill.turn?.message ? (
            <article className="drill-bubble">
              <span className="eyebrow">INCOMING · SIMULATED</span>
              <p>{drill.turn.message}</p>
            </article>
          ) : null}

          {busy && <div className="drill-loading" role="status" aria-busy="true"><span className="harbour-visually-hidden">Preparing the next message</span><SkeletonLines count={3} /></div>}

          {!busy && drill.turn?.options && !drill.finished ? (
            <div className="drill-options" role="group" aria-label="Choose your reply">
              {drill.turn.options.map(option => (
                <button key={option.id} type="button" className={`drill-option ${picked === option.id ? "is-picked" : ""}`} onClick={() => choose(option.id)} disabled={busy}>
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}

          {drill.feedback ? (
            <div className={`drill-feedback ${drill.feedback.safe ? "is-safe" : "is-risky"}`} role="status" aria-live="polite">
              <Icon name={drill.feedback.safe ? "check" : "alert"} size={18} />
              <p>{drill.feedback.note}</p>
            </div>
          ) : null}

          {(drill.finished || drill.status === "answered") && !drill.debrief ? (
            <Button type="button" onClick={() => drill.finish()} loading={busy} icon="sparkle">See my debrief</Button>
          ) : null}

          <div ref={bottomRef} />
        </div>
      )}

      {drill.debrief && (
        <div className="drill-debrief harbour-card" role="status" aria-live="polite">
          <span className="eyebrow">DEBRIEF</span>
          <h2>{drill.debrief.band}</h2>
          <p className="drill-score"><strong>{drill.debrief.score}</strong><span>resilience score</span></p>
          <p className="panel-note">{drill.debrief.scenario}</p>
          <ul className="next-steps">{drill.debrief.debrief.map(line => <li key={line}>{line}</li>)}</ul>
          {drill.debrief.missed.length ? (
            <div className="drill-missed">
              <span className="eyebrow">PRACTISE THESE</span>
              <div className="filter-chips">{drill.debrief.missed.map(signal => <span className="chip is-static" key={signal}>{signal}</span>)}</div>
            </div>
          ) : null}
          <div className="drill-actions">
            <Button type="button" onClick={() => { drill.reset(); setPicked(null); }} icon="swap">Practise again</Button>
          </div>
        </div>
      )}
    </div>
  );
}
