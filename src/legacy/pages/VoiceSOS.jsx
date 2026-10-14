import { useEffect, useRef, useState } from "react";
import { Icon } from "../components/Icons.jsx";
import Button from "../components/Button.jsx";
import { useDialogAccessibility } from "../hooks/useDialogAccessibility.js";
import {
  BackgroundStack,
  SignalOrigin,
  ConceptArtStrip,
} from "../components/VoiceSosConceptArt.jsx";

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

  return <section className="page figma-toolpage vos-page">
    {/* Living background: canvas network + morphing blobs, full-bleed. */}
    <BackgroundStack />

    <div className="vos-main">
      {/* Hero with the distress-signal origin. */}
      <section className="vos-hero">
        <SignalOrigin />
        <span className="vos-eyebrow">Voice SOS · Simulated</span>
        <h1 className="vos-h1">You don’t have to figure it out alone.</h1>
        <p className="vos-lede">In a difficult moment, it can help to know who to reach. This demo shows how a volunteer connection might work.</p>
        <div className="vos-scroll-cue" aria-hidden="true"><span /></div>
      </section>

      {/* The beacon console, on glass over the living background. */}
      <section className="vos-stage">
        <div className="vos-stage__glass">
          <div className="vos-stage__head">
            <span className="vos-eyebrow">A Friendly Voice, When You Need One</span>
            <h2 className="vos-h2">Talk it through with someone.</h2>
            <p className="vos-note">This is a clickable mockup. It does not place a call or connect you to a real volunteer.</p>
          </div>

          <div className="vos-beacon">
            <span className="vos-beacon__glow" aria-hidden="true" />
            <span className="vos-beacon__ring" aria-hidden="true" />
            <span className="vos-beacon__ring vos-beacon__ring--2" aria-hidden="true" />
            <span className="vos-beacon__ring vos-beacon__ring--3" aria-hidden="true" />
            <button
              type="button"
              className={`vos-orb is-${status}`}
              onClick={status === "idle" || status === "failed" ? begin : reset}
              aria-describedby="vos-status-detail"
            >
              <Icon name={status === "connected" ? "phone" : status === "failed" ? "alert" : "sos"} size={40} />
              <span className="vos-orb__label">{current.label}</span>
            </button>
          </div>

          <div className="vos-status" role="status" aria-live="polite">
            <strong className="vos-status__title">{current.title}</strong>
            <p id="vos-status-detail" className="vos-status__detail">{current.detail}</p>
            {(status === "listening" || status === "matching") && (
              <div className="vos-wave" aria-hidden="true">
                {Array.from({ length: 24 }, (_, i) => (
                  <i key={i} style={{ animationDelay: `${i * -0.06}s` }} />
                ))}
              </div>
            )}
          </div>

          <ol className="vos-steps">
            {STEPS.map(([key, label], index) => (
              <li
                key={key}
                data-state={
                  status === "connected" || index < stepIndex
                    ? "done"
                    : index === stepIndex
                      ? "active"
                      : "pending"
                }
              >
                <Icon name={status === "connected" || index < stepIndex ? "check" : "dot"} size={14} />
                <span>{label}</span>
              </li>
            ))}
          </ol>

          <div className="vos-controls">
            <button
              type="button"
              className="sample-link"
              onClick={() => { clearTimers(); setStatus("failed"); setOpen(false); }}
            >Show a failed connection</button>
            {(status === "listening" || status === "matching") && (
              <button type="button" className="sample-link" onClick={reset}>Cancel</button>
            )}
            <a className="sample-link vos-controls__emergency" href="tel:999">
              <Icon name="alert" size={16} /> Call emergency services · 999
            </a>
          </div>
        </div>
      </section>

      {/* Concept art works — three distress-signal scenes. */}
      <section className="vos-gallery" aria-label="Voice SOS concept art">
        <header className="vos-gallery__head">
          <span className="vos-eyebrow">Concept Art</span>
          <h2 className="vos-h2">Three ways a signal reaches you</h2>
          <p className="vos-note">
            Sketches for the same idea — distress signals answered. None are shipping screens;
            they are the feeling we are building toward.
          </p>
        </header>
        <ConceptArtStrip />
      </section>

      <footer className="vos-footer">
        <p>Harbour · Voice SOS concept preview — simulated demo, no calls placed.</p>
      </footer>
    </div>

    {open && (
      <div className="modal-backdrop" role="presentation" onClick={closeModal}>
        <div
          className="volunteer-modal vos-modal"
          ref={dialogRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="vol-title"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="modal-close"
            ref={closeRef}
            onClick={closeModal}
            aria-label="Close Voice SOS preview"
          ><Icon name="close" size={18} /></button>
          <span className="eyebrow">SAMPLE VOLUNTEER · DEMO ONLY</span>
          <div className="vos-modal__avatar" aria-hidden="true">
            <span className="vos-modal__avatar-glow" />
            <span className="vos-modal__avatar-inner">L</span>
          </div>
          <h2 id="vol-title" className="vos-modal__title">Meet Lina</h2>
          <p className="vos-modal__meta">Second-year student · Cantonese, English, Mandarin</p>
          <div className="vos-modal__wave" aria-hidden="true">
            {Array.from({ length: 18 }, (_, i) => (
              <i key={i} style={{ animationDelay: `${i * -0.07}s` }} />
            ))}
          </div>
          <div className="demo-banner">
            <Icon name="info" size={16} />
            <span>This is a fictional profile. No call is being made.</span>
          </div>
          <Button type="button" onClick={closeModal}>Got it</Button>
        </div>
      </div>
    )}
  </section>;
}
