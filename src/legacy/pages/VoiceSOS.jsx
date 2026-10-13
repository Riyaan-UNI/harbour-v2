import { useEffect, useRef, useState } from "react";
import PageHeading from "../components/PageHeading.jsx";
import Button from "../components/Button.jsx";
import { Icon } from "../components/Icons.jsx";
import { useDialogAccessibility } from "../hooks/useDialogAccessibility.js";

const STATES = {
  idle: { label: "Start", title: "Ready when you are", detail: "Press once to begin a simulated check-in. Nothing is called or recorded." },
  listening: { label: "Listening…", title: "Listening", detail: "Harbour is preparing a friendly voice for you." },
  matching: { label: "Finding someone…", title: "Finding someone", detail: "Matching you with a volunteer guide." },
  connected: { label: "Connected", title: "You’re connected", detail: "You’re speaking with a sample volunteer." },
  failed: { label: "Try again", title: "Connection not made", detail: "If you are in danger, call 999 straight away." },
};
const STEPS = [["listening", "Listening"], ["matching", "Matching"], ["connected", "Connected"]];

export default function VoiceSOS() {
  const [status, setStatus] = useState("idle");
  const [open, setOpen] = useState(false);
  const timers = useRef([]);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  const clearTimers = () => { timers.current.forEach(window.clearTimeout); timers.current = []; };
  useEffect(() => clearTimers, []);

  function begin() {
    clearTimers();
    setStatus("listening");
    timers.current.push(window.setTimeout(() => setStatus("matching"), 1200));
    timers.current.push(window.setTimeout(() => { setStatus("connected"); setOpen(true); }, 3000));
  }
  function reset() { clearTimers(); setStatus("idle"); }
  function closeModal() { setOpen(false); reset(); }
  useDialogAccessibility({ open, dialogRef, initialFocusRef: closeRef, onClose: closeModal });

  const current = STATES[status];
  const stepIndex = STEPS.findIndex(([key]) => key === status);

  return <section className="page figma-toolpage sos-page">
    <PageHeading eyebrow="VOICE SOS · SIMULATED" title="You don’t have to figure it out alone." description="In a difficult moment, it can help to know who to reach. This demo shows how a volunteer connection might work."/>

    <div className="sos-card">
      <div className="sos-symbol" aria-hidden="true">SOS</div>
      <div className="sos-card-copy">
        <span className="eyebrow">A FRIENDLY VOICE, WHEN YOU NEED ONE</span>
        <h2>Talk it through with someone.</h2>
        <p>This is a clickable mockup. It does not place a call or connect you to a real volunteer.</p>
      </div>
    </div>

    <div className="sos-panel">
      <div className="sos-control">
        <button
          type="button"
          className={`sos-button is-${status}`}
          onClick={status === "idle" || status === "failed" ? begin : reset}
          aria-describedby="sos-status-detail"
        >
          <Icon name={status === "connected" ? "phone" : status === "failed" ? "alert" : "sos"} size={40} />
          <span>{current.label}</span>
        </button>
      </div>

      <div className="sos-state" role="status" aria-live="polite">
        <strong>{current.title}</strong>
        <p id="sos-status-detail">{current.detail}</p>
      </div>

      <ol className="sos-steps">
        {STEPS.map(([key, label], index) => (
          <li key={key} data-state={status === "connected" || index < stepIndex ? "done" : index === stepIndex ? "active" : "pending"}>
            <Icon name={status === "connected" || index < stepIndex ? "check" : "dot"} size={14} />{label}
          </li>
        ))}
      </ol>

      <div className="sos-demo-controls">
        <button type="button" className="sample-link" onClick={() => { clearTimers(); setStatus("failed"); setOpen(false); }}>Show a failed connection</button>
        {(status === "listening" || status === "matching") && <button type="button" className="sample-link" onClick={reset}>Cancel</button>}
        <a className="sample-link" href="tel:999">Call emergency services · 999</a>
      </div>
    </div>

    {open && <div className="modal-backdrop" role="presentation" onClick={closeModal}>
      <div className="volunteer-modal" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="vol-title" onClick={e => e.stopPropagation()}>
        <button className="modal-close" ref={closeRef} onClick={closeModal} aria-label="Close Voice SOS preview"><Icon name="close" size={18} /></button>
        <span className="eyebrow">SAMPLE VOLUNTEER · DEMO ONLY</span>
        <div className="volunteer-avatar">L</div>
        <h2 id="vol-title">Meet Lina</h2>
        <p>Second-year student · Cantonese, English, Mandarin</p>
        <div className="voice-wave" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ animationDelay: `${i * -0.07}s` }}/>)}</div>
        <div className="demo-banner">This is a fictional profile. No call is being made.</div>
        <Button type="button" onClick={closeModal}>Got it</Button>
      </div>
    </div>}
  </section>;
}
