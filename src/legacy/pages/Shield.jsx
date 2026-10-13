import { useRef, useState } from "react";
import { Link } from "../router.jsx";
import { analyzeScam } from "../lib/api.js";
import Button from "../components/Button.jsx";
import ToolPageHeading from "../components/ToolPageHeading.jsx";
import ServiceError from "../components/ServiceError.jsx";
import Expander from "../components/Expander.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import ScamDrill from "../components/ScamDrill.jsx";
import { SkeletonLines } from "../components/Skeleton.jsx";
import { Icon } from "../components/Icons.jsx";
import { useReveal } from "../hooks/useReveal.js";

const sample = "Your parcel is waiting. Pay a small redelivery fee now: hxxps://hk-post.example/claim. Reply with your bank card details to avoid return.";
const redFlags = ["An upfront fee to receive a prize, parcel, job, or loan", "Pressure to act immediately or keep the offer secret", "Requests for your HKID, bank PIN, password, or one-time code", "A payment link that is not on the organisation’s official website"];
function redactPrivateInfo(value) {
  let count = 0;
  let text = value.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|\b(?:\+?852[-\s]?)?[2-9]\d{3}[-\s]?\d{4}\b|\b[A-Z]{1,2}\d{6}\(?[0-9A]\)?\b|\b(?:\d[ -]?){13,19}\b/gi, () => { count += 1; return "[hidden]"; });
  text = text.replace(/(\b(?:otp|one[- ]time (?:code|password)|verification code)\s*(?:is|:)?\s*)(\d{4,8}\b)/gi, (_match, label) => { count += 1; return `${label}[hidden]`; });
  return { text, count };
}
const RISK_TONE = { low: "success", medium: "warning", high: "danger" };
export default function Shield() {
  const [text, setText] = useState(""); const [result, setResult] = useState(null); const [error, setError] = useState(null); const [busy, setBusy] = useState(false); const [redactedCount, setRedactedCount] = useState(0);
  const [mode, setMode] = useState("check");
  const pageRef = useRef(null);
  useReveal(pageRef, mode);
  async function runAnalysis() { if (!text.trim() || busy) return; setBusy(true); setError(null); setResult(null); const safe = redactPrivateInfo(text.trim()); setRedactedCount(safe.count); try { setResult(await analyzeScam(safe.text)); } catch (err) { setError(err); } finally { setBusy(false); } }
  function submit(event) { event.preventDefault(); runAnalysis(); }
  const isDemo = result ? /basic keyword screen/i.test(result.explanation || "") : false;
  return <section className="page figma-toolpage scam-page" ref={pageRef}>
    <ToolPageHeading eyebrow="SAFETY TOOL" title={<>Look beneath the<br className="desktop-break"/> message.</>} description="Paste suspicious text for an educational pattern check, not a verified result." />

    <div className="mode-switch" role="tablist" aria-label="Scam X-ray modes">
      <button type="button" role="tab" aria-selected={mode === "check"} className={mode === "check" ? "is-active" : ""} onClick={() => setMode("check")}><Icon name="search" size={18} />Check a message</button>
      <button type="button" role="tab" aria-selected={mode === "drill"} className={mode === "drill" ? "is-active" : ""} onClick={() => setMode("drill")}><Icon name="shield" size={18} />Practise a scam</button>
    </div>

    {mode === "drill" ? <ScamDrill /> : <>
    <div className="scam-workspace">
      <form className="scam-input-card" onSubmit={submit}>
        <label htmlFor="scam-text">Suspicious message</label>
        <textarea id="scam-text" value={text} onChange={event => { setText(event.target.value); setRedactedCount(0); }} maxLength="8000" placeholder="Paste a message, link or offer here…" aria-describedby="scam-privacy"/>
        <p className="scam-privacy-note" id="scam-privacy">Review before sending. Harbour automatically hides common email, phone, ID, card-number, and one-time-code patterns in your browser; other private details may be missed.</p>
        <div className="scam-controls">
          <button type="button" className="sample-link" onClick={() => { setText(sample); setResult(null); setError(null); setRedactedCount(0); }}>Use fictional sample</button>
          <Button type="submit" loading={busy} disabled={!text.trim() || busy} icon="shield">{busy ? "Checking…" : "X-ray this message"}</Button>
        </div>
        <span className="field-count">{text.length} / 8,000</span>
      </form>

      {!result && !error && <div className={`scam-result-placeholder ${busy ? "is-busy" : ""}`} aria-live="polite">
        {busy
          ? <><span className="result-pulse" aria-hidden="true"><Icon name="search" size={32} /></span><strong>Looking for patterns…</strong><SkeletonLines count={3} /></>
          : <><span className="result-target" aria-hidden="true"><Icon name="shield" size={32} /></span><strong>Your result will appear here</strong><p>We’ll explain patterns and offer cautious<br className="desktop-break"/> next steps.</p></>}
      </div>}

      {error && <ServiceError error={error} onRetry={runAnalysis}>
        <h3>Check these red flags yourself</h3>
        <ul className="red-flag-list">{redFlags.map(flag => <li key={flag}>{flag}</li>)}</ul>
        <div className="scam-help-lines">
          <p><strong>ADCC Anti-Scam Helpline</strong><a href="tel:18222">18222 · call for advice</a></p>
          <p><strong>Police Scameter+</strong><a href="https://www.adcc.gov.hk/en-hk/alerts-detail/alerts-1805163751902826497.html" target="_blank" rel="noreferrer">Check suspicious details ↗</a></p>
        </div>
      </ServiceError>}

      {result && <article className="scam-result-card">
        <div className="scam-result-top">
          <span className="eyebrow">{isDemo ? "DEMO · BASIC KEYWORD CHECK" : "YOUR MESSAGE REVIEW"}</span>
          <StatusBadge tone={RISK_TONE[String(result.riskLevel).toLowerCase()] || "neutral"} icon="alert">{result.riskLevel} risk</StatusBadge>
        </div>
        {isDemo && <p className="demo-review-note" role="note">Demo check only. This is not an AI review and cannot confirm whether a message is genuine.</p>}
        <h2>{result.issue}</h2>
        <p>{result.explanation}</p>
        {redactedCount > 0 && <p className="redaction-confirmation" role="status">{redactedCount} possible private detail{redactedCount === 1 ? " was" : "s were"} hidden in your browser before analysis.</p>}

        <Expander summary="Why was this flagged?">
          <div className="result-columns">
            <div>
              <h3>Signals to notice</h3>
              <ul>{result.warningSigns.map((item, index) => <li key={index}>{item}</li>)}</ul>
            </div>
          </div>
        </Expander>

        <div className="result-columns">
          <div>
            <h3>What you can do</h3>
            <ul>{result.actions.map((item, index) => <li key={index}>{item}</li>)}</ul>
          </div>
        </div>

        <div className="support-line">
          <span>NEED A SECOND OPINION?</span>
          <strong>{result.support.name} · <a href={`tel:${result.support.phone}`}>{result.support.phone}</a></strong>
        </div>

        <Link className="button secondary" to="/checklist" state={{ checklistSuggestion: "Verify the offer using the organisation’s official website; do not use the message link or pay a fee." }}>
          Add a verification step to your checklist <Icon name="checklist" size={18} />
        </Link>
      </article>}
    </div>
    <p className="figma-tool-note">Harbour offers general guidance, not an official determination. When unsure, contact the organisation through its official channels.</p>
    </>}

    <section className="crosslink-card harbour-card" data-reveal>
      <span className="crosslink-icon" aria-hidden="true"><Icon name="lock" size={24} /></span>
      <div>
        <span className="eyebrow">RENTING SOMEWHERE?</span>
        <h2>Rental Shield checks listings and leases.</h2>
        <p className="panel-note">Rental scams are the most common way international students lose money in Hong Kong. Check the listing before you pay anything.</p>
      </div>
      <Link className="button" to="/rental">Open Rental Shield <Icon name="chevronRight" size={18} /></Link>
    </section>
  </section>;
}
