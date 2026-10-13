import { useEffect, useRef, useState } from "react";
import Button from "./Button.jsx";
import { Icon } from "./Icons.jsx";
import { SkeletonLines } from "./Skeleton.jsx";
import ServiceError from "./ServiceError.jsx";
import SpeechButton from "./SpeechButton.jsx";
import { toast } from "./Toast.jsx";
import { useDialogAccessibility } from "../hooks/useDialogAccessibility.js";
import { COUNTER_SCENARIOS, DOCUMENT_OPTIONS, useCounterCard } from "../hooks/useCounterCard.js";

function decodePayload(hash) {
  const match = /(?:^#|&)cc=([A-Za-z0-9_-]+)/.exec(hash || "");
  if (!match) return null;
  try {
    const json = decodeURIComponent(escape(atob(match[1].replace(/-/g, "+").replace(/_/g, "/"))));
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

/* F2 — Counter Card, a mode inside Translate. */
export default function CounterCard({ userLang = "en" }) {
  const card = useCounterCard(userLang);
  const [form, setForm] = useState({ scenario: "immigration", need: "", documents: [] });
  const [fullScreen, setFullScreen] = useState(false);
  const adoptedRef = useRef(false);
  const fullScreenRef = useRef(null);
  const fullScreenCloseRef = useRef(null);

  // A link with a fragment payload reopens the same card on another device.
  useEffect(() => {
    if (adoptedRef.current) return;
    const payload = decodePayload(window.location.hash);
    if (!payload) return;
    adoptedRef.current = true;
    const next = {
      scenario: COUNTER_SCENARIOS.some(item => item.id === payload.s) ? payload.s : "other",
      need: typeof payload.n === "string" ? payload.n : "",
      documents: Array.isArray(payload.d) ? payload.d.filter(item => typeof item === "string") : [],
    };
    setForm(next);
    card.build(next);
  }, [card]);

  useDialogAccessibility({ open: fullScreen, dialogRef: fullScreenRef, initialFocusRef: fullScreenCloseRef, onClose: () => setFullScreen(false) });

  const toggleDocument = label => setForm(current => ({
    ...current,
    documents: current.documents.includes(label)
      ? current.documents.filter(item => item !== label)
      : [...current.documents, label],
  }));

  const result = card.card;
  const link = result ? `${window.location.origin}/translate#cc=${result.fragmentPayload}` : "";

  async function copyLink() {
    if (!link) return;
    try { await navigator.clipboard.writeText(link); toast("Card link copied. Nothing was stored.", { tone: "success" }); }
    catch { toast("Copy is not available in this browser.", { tone: "warning" }); }
  }

  return (
    <div className="counter-card">
      <div className="counter-intro">
        <span className="eyebrow">COUNTER CARD · NEW</span>
        <h2>Show the right words at the counter.</h2>
        <p className="panel-note">Pick where you are going, say what you need, and tick the documents you have. Harbour writes a Traditional Chinese card for the staff member, with your own language underneath.</p>
      </div>

      <form className="counter-form harbour-card" onSubmit={event => { event.preventDefault(); card.build(form); }}>
        <fieldset className="counter-scenarios">
          <legend>Where are you going?</legend>
          <div className="filter-chips">
            {COUNTER_SCENARIOS.map(item => (
              <button type="button" key={item.id} className="chip" aria-pressed={form.scenario === item.id} onClick={() => setForm(current => ({ ...current, scenario: item.id }))}>
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label htmlFor="counter-need">What do you need?</label>
        <textarea id="counter-need" value={form.need} maxLength="500" onChange={event => setForm(current => ({ ...current, need: event.target.value }))} placeholder="For example: I need to open a student bank account."/>
        <span className="field-count">{form.need.length} / 500</span>

        <fieldset className="counter-documents">
          <legend>Which documents do you have?</legend>
          <div className="counter-doc-grid">
            {DOCUMENT_OPTIONS.map(label => (
              <label className="rental-check" key={label}>
                <input type="checkbox" checked={form.documents.includes(label)} onChange={() => toggleDocument(label)}/>
                <span className="figma-checkbox" aria-hidden="true"/>
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <Button loading={card.status === "loading"} disabled={card.status === "loading"} icon="translate">
          {card.status === "loading" ? "Writing your card…" : "Build my card"}
        </Button>
      </form>

      <div className="counter-result" aria-live="polite">
        {card.status === "loading" && (
          <div className="counter-preview harbour-card" role="status" aria-busy="true">
            <span className="harbour-visually-hidden">Writing your card</span>
            <SkeletonLines count={4} />
          </div>
        )}
        {card.status === "error" && <ServiceError error={card.error} onRetry={() => card.build(form)} />}

        {result && (
          <>
            <article className="counter-preview harbour-card" data-reveal>
              <div className="counter-preview-head">
                <span className="eyebrow">SHOW THIS TO STAFF</span>
                <span className="status-badge is-info"><Icon name="info" size={16} />Traditional Chinese</span>
              </div>
              <div className="staff-card" lang="zh-HK">
                <h3>{result.staffCard.title}</h3>
                <ul>{result.staffCard.lines.map((line, index) => <li key={index}>{line}</li>)}</ul>
                <SpeechButton text={[result.staffCard.title, ...result.staffCard.lines].join("。 ")} label="Listen to the Cantonese counter card" />
              </div>
              <div className="student-card" lang={result.studentCard.lang}>
                <h4>{result.studentCard.title}</h4>
                <ul>{result.studentCard.lines.map((line, index) => <li key={index}>{line}</li>)}</ul>
              </div>

              {result.glossary?.length ? (
                <div className="counter-glossary">
                  <span className="eyebrow">KEY TERMS</span>
                  <ul>{result.glossary.map(item => <li key={item.term}><span>{item.term}</span><strong>{item.zh}</strong></li>)}</ul>
                </div>
              ) : null}
            </article>

            <div className="counter-actions">
              <Button onClick={() => setFullScreen(true)} icon="external">Show to staff</Button>
              <button className="button secondary" type="button" onClick={() => window.print()}><Icon name="checklist" size={18} />Print</button>
              <button className="button secondary" type="button" onClick={copyLink}><Icon name="copy" size={18} />Copy card link</button>
            </div>
            <p className="figma-tool-note">Nothing is stored. The card travels in the link’s fragment, so it only exists on the device that opens it.</p>
          </>
        )}
      </div>

      {fullScreen && result && (
        <div className="counter-fullscreen" ref={fullScreenRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="counter-full-title">
          <div className="counter-fullscreen-inner">
            <h2 id="counter-full-title">{result.staffCard.title}</h2>
            <ul lang="zh-HK">{result.staffCard.lines.map((line, index) => <li key={index}>{line}</li>)}</ul>
            <SpeechButton text={[result.staffCard.title, ...result.staffCard.lines].join("。 ")} label="Listen to the Cantonese counter card" />
          </div>
          <div className="counter-fullscreen-controls">
            <button className="button" type="button" onClick={() => window.print()}><Icon name="checklist" size={18} />Print</button>
            <button className="button secondary" ref={fullScreenCloseRef} type="button" onClick={() => setFullScreen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
