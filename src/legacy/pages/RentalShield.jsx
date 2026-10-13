import { useRef, useState } from "react";
import ToolPageHeading from "../components/ToolPageHeading.jsx";
import Button from "../components/Button.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import ServiceError from "../components/ServiceError.jsx";
import Expander from "../components/Expander.jsx";
import RentalPlaybook from "../components/RentalPlaybook.jsx";
import { Skeleton, SkeletonLines } from "../components/Skeleton.jsx";
import { Icon } from "../components/Icons.jsx";
import { toast } from "../components/Toast.jsx";
import { useRentalShield } from "../hooks/useRentalShield.js";
import { useReveal } from "../hooks/useReveal.js";

const RISK_TONE = { red: "danger", amber: "warning", green: "success" };
const RISK_LABEL = { red: "High risk", amber: "Worth checking", green: "No patterns found" };
const SEVERITY_TONE = { red: "danger", amber: "warning", info: "info" };
const CLAUSE_TONE = { high: "danger", medium: "warning", low: "success" };
const CLAUSE_TITLE = {
  TERM: "Term", BREAK_CLAUSE: "Break clause", DEPOSIT: "Deposit", ADVANCE_RENT: "Advance rent",
  AGENCY_COMMISSION: "Agency commission", SUBLET: "Sublet", STAMP_DUTY: "Stamp duty",
  FEES_AND_UTILITIES: "Fees and utilities", REPAIRS: "Repairs", LANDLORD_ENTRY: "Landlord entry",
  TERMINATION_NOTICE: "Termination notice", INVENTORY: "Inventory",
};

function ListingTab({ shield }) {
  const [form, setForm] = useState({ listingText: "", agentName: "", licenceNo: "", landlordName: "", amountMonths: "", beforeViewing: false, beforeSigning: false });
  const { listing, runListingCheck, resetListing } = shield;
  const busy = listing.status === "loading";

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  function submit(event) {
    event.preventDefault();
    runListingCheck({
      listingText: form.listingText,
      agentName: form.agentName,
      licenceNo: form.licenceNo,
      landlordName: form.landlordName,
      payment: {
        amountMonths: Number(form.amountMonths) || 0,
        beforeViewing: form.beforeViewing,
        beforeSigning: form.beforeSigning,
      },
    });
  }

  const result = listing.result;

  return (
    <div className="rental-workspace">
      <form className="rental-form harbour-card" onSubmit={submit} data-reveal>
        <h2>Check a listing</h2>
        <p className="panel-note">Paste what you were sent. Harbour reads it for known rental-scam patterns — it never sends your text anywhere until you press the button.</p>

        <label htmlFor="rental-text">Listing or message</label>
        <textarea id="rental-text" value={form.listingText} maxLength="5000" onChange={event => update("listingText", event.target.value)} placeholder="Paste the listing, the chat, or the payment request…" aria-describedby="rental-privacy"/>
        <p className="scam-privacy-note" id="rental-privacy">Harbour hides HKID, phone, email and bank-account patterns before any review. Pasted text is not saved.</p>

        <div className="rental-field-grid">
          <div>
            <label htmlFor="rental-agent">Agent name</label>
            <input id="rental-agent" value={form.agentName} maxLength="120" onChange={event => update("agentName", event.target.value)} placeholder="Who is asking you to pay?"/>
          </div>
          <div>
            <label htmlFor="rental-licence">Licence number</label>
            <input id="rental-licence" value={form.licenceNo} maxLength="40" onChange={event => update("licenceNo", event.target.value)} placeholder="E-123456"/>
          </div>
          <div>
            <label htmlFor="rental-landlord">Landlord name</label>
            <input id="rental-landlord" value={form.landlordName} maxLength="120" onChange={event => update("landlordName", event.target.value)} placeholder="Who owns the flat?"/>
          </div>
          <div>
            <label htmlFor="rental-months">Months of rent asked up front</label>
            <input id="rental-months" type="number" min="0" max="60" value={form.amountMonths} onChange={event => update("amountMonths", event.target.value)} placeholder="0"/>
          </div>
        </div>

        <fieldset className="rental-payment">
          <legend>When were you asked to pay?</legend>
          <label className="rental-check">
            <input type="checkbox" checked={form.beforeViewing} onChange={event => update("beforeViewing", event.target.checked)}/>
            <span className="figma-checkbox" aria-hidden="true"/>
            <span>Before I had seen the flat</span>
          </label>
          <label className="rental-check">
            <input type="checkbox" checked={form.beforeSigning} onChange={event => update("beforeSigning", event.target.checked)}/>
            <span className="figma-checkbox" aria-hidden="true"/>
            <span>Before I had signed the agreement</span>
          </label>
        </fieldset>

        <div className="rental-controls">
          {listing.status !== "idle" && <button type="button" className="sample-link" onClick={resetListing}>Clear result</button>}
          <Button type="submit" loading={busy} disabled={busy} icon="shield">{busy ? "Checking…" : "Check this listing"}</Button>
        </div>
      </form>

      <div className="rental-result-column" aria-live="polite">
        {listing.status === "idle" && (
          <div className="rental-placeholder harbour-card" data-reveal>
            <span aria-hidden="true"><Icon name="shield" size={30} /></span>
            <strong>Your result will appear here</strong>
            <p>Harbour explains each pattern it finds, and what to do next.</p>
          </div>
        )}

        {busy && (
          <div className="rental-placeholder harbour-card is-busy" role="status" aria-busy="true">
            <span className="harbour-visually-hidden">Checking the listing</span>
            <Skeleton variant="title" width="55%" />
            <SkeletonLines count={4} />
          </div>
        )}

        {listing.status === "error" && (
          <ServiceError error={listing.error} onRetry={() => runListingCheck(form)}>
            <h3>Check these yourself</h3>
            <ul className="red-flag-list">
              <li>Ask for the estate agent’s licence number and check it on the EAA list.</li>
              <li>Never pay a deposit before you have seen the flat.</li>
              <li>Call the Anti-Scam Helpline on 18222 for advice.</li>
            </ul>
          </ServiceError>
        )}

        {result && (
          <article className="rental-result harbour-card" data-reveal>
            <div className="rental-result-top">
              <span className="eyebrow">LISTING REVIEW</span>
              <StatusBadge tone={RISK_TONE[result.risk]} icon={result.risk === "green" ? "check" : "alert"}>
                {RISK_LABEL[result.risk]}
              </StatusBadge>
            </div>

            {result.risk === "green" && (
              <p className="rental-green-note" role="note">
                A green result does <strong>not</strong> mean the listing is safe. It only means Harbour did not find the patterns it looks for.
              </p>
            )}

            {result.flags.length ? (
              <ul className="flag-list">
                {result.flags.map(flag => (
                  <li key={flag.id} className={`flag flag-${flag.severity}`}>
                    <div className="flag-head">
                      <StatusBadge tone={SEVERITY_TONE[flag.severity]} icon={flag.severity === "info" ? "info" : "alert"}>
                        {flag.id.replace(/_/g, " ").toLowerCase()}
                      </StatusBadge>
                    </div>
                    <p>{flag.why}</p>
                    {flag.verify?.url ? (
                      <a className="flag-verify" href={flag.verify.url} target="_blank" rel="noreferrer">
                        {flag.verify.label} <Icon name="external" size={16} />
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="panel-note">No warning patterns were found in what you gave Harbour.</p>
            )}

            <Expander summary="What you can do next" defaultOpen>
              <ol className="next-steps">
                {result.nextSteps.map(step => <li key={step}>{step}</li>)}
              </ol>
            </Expander>

            <Expander summary="Verify it yourself">
              <ul className="verify-list">
                <li><a href="https://www.eaa.org.hk/en-us/Information-Centre/Licence-Search" target="_blank" rel="noreferrer">Estate agent licence list <Icon name="external" size={16} /></a></li>
                <li><a href="https://www.gov.hk/en/residents/housing/land/" target="_blank" rel="noreferrer">Official land search <Icon name="external" size={16} /></a></li>
                <li><a href="https://www.rvd.gov.hk/en/" target="_blank" rel="noreferrer">Rating and Valuation Department <Icon name="external" size={16} /></a></li>
                <li><a href="tel:18222">Anti-Scam Helpline 18222</a></li>
              </ul>
            </Expander>

            <p className="figma-tool-note">{result.disclaimer}</p>
          </article>
        )}
      </div>
    </div>
  );
}

function LeaseTab({ shield }) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef(null);
  const { lease, runLeaseXray, resetLease } = shield;
  const busy = lease.status === "loading";

  function pickFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1_000_000) { toast("Choose a text file under 1 MB.", { tone: "warning" }); return; }
    if (!/^text\/|json|csv/.test(file.type) && !/\.(txt|md|csv)$/i.test(file.name)) {
      toast("Harbour can read plain text files only.", { tone: "warning" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setText(String(reader.result).slice(0, 20000)); setFileName(file.name); toast("File read in your browser.", { tone: "success" }); };
    reader.onerror = () => toast("That file could not be read.", { tone: "warning" });
    reader.readAsText(file);
  }

  const result = lease.result;

  return (
    <div className="rental-workspace">
      <form className="rental-form harbour-card" onSubmit={event => { event.preventDefault(); runLeaseXray(text); }} data-reveal>
        <h2>Read a lease</h2>
        <p className="panel-note">Paste your tenancy agreement. Harbour sorts the clauses by how much attention they need.</p>
        <label htmlFor="lease-text">Tenancy agreement text</label>
        <textarea id="lease-text" value={text} maxLength="20000" onChange={event => setText(event.target.value)} placeholder="Paste the agreement here…" aria-describedby="lease-privacy"/>
        <p className="scam-privacy-note" id="lease-privacy">Harbour redacts HKID, phone and account patterns before any review, and does not store the text.</p>
        <div className="rental-controls">
          <input ref={fileRef} className="visually-hidden" type="file" accept=".txt,.md,.csv,text/plain" onChange={pickFile} aria-label="Upload a lease text file"/>
          <button type="button" className="sample-link" onClick={() => fileRef.current?.click()}>
            {fileName ? `Loaded ${fileName}` : "Upload a text file"}
          </button>
          {lease.status !== "idle" && <button type="button" className="sample-link" onClick={resetLease}>Clear</button>}
          <Button loading={busy} disabled={busy || text.trim().length < 40} icon="checklist">{busy ? "Reading…" : "Read this lease"}</Button>
        </div>
      </form>

      <div className="rental-result-column" aria-live="polite">
        {lease.status === "idle" && (
          <div className="rental-placeholder harbour-card" data-reveal>
            <span aria-hidden="true"><Icon name="checklist" size={30} /></span>
            <strong>Your clause cards will appear here</strong>
            <p>Highest-risk clauses first, each with a plain-language reason.</p>
          </div>
        )}
        {busy && (
          <div className="rental-placeholder harbour-card is-busy" role="status" aria-busy="true">
            <span className="harbour-visually-hidden">Reading the lease</span>
            <Skeleton variant="title" width="50%" />
            <SkeletonLines count={5} />
          </div>
        )}
        {lease.status === "error" && <ServiceError error={lease.error} onRetry={() => runLeaseXray(text)} />}

        {result && (
          <article className="rental-result harbour-card" data-reveal>
            <div className="rental-result-top">
              <span className="eyebrow">LEASE REVIEW</span>
              <StatusBadge tone={result.clauses.some(c => c.risk === "high") ? "danger" : result.clauses.length ? "warning" : "info"} icon="checklist">
                {result.clauses.length} clause{result.clauses.length === 1 ? "" : "s"} found
              </StatusBadge>
            </div>
            <p className="panel-note">{result.summary}</p>

            <ul className="clause-list">
              {result.clauses.map((clause, index) => (
                <li key={`${clause.type}-${index}`} className={`clause clause-${clause.risk}`}>
                  <div className="clause-head">
                    <strong>{CLAUSE_TITLE[clause.type] || clause.type}</strong>
                    <StatusBadge tone={CLAUSE_TONE[clause.risk]} icon={clause.risk === "high" ? "alert" : clause.risk === "medium" ? "info" : "check"}>
                      {clause.risk} attention
                    </StatusBadge>
                  </div>
                  <p>{clause.summary}</p>
                  <p className="clause-why"><Icon name="info" size={16} /> {clause.why}</p>
                </li>
              ))}
            </ul>

            {result.missing.length ? (
              <Expander summary={`Clauses Harbour did not find (${result.missing.length})`}>
                <p className="panel-note">If the agreement should cover these, ask the agent where they are before you sign.</p>
                <div className="missing-clauses">
                  {result.missing.map(type => <span key={type}>{CLAUSE_TITLE[type] || type}</span>)}
                </div>
              </Expander>
            ) : null}

            <p className="figma-tool-note">{result.disclaimer}</p>
          </article>
        )}
      </div>
    </div>
  );
}

export default function RentalShield() {
  const shield = useRentalShield();
  const [tab, setTab] = useState("listing");
  const [playbookOpen, setPlaybookOpen] = useState(false);
  const pageRef = useRef(null);
  useReveal(pageRef, tab);

  return (
    <section className="page figma-toolpage rental-page" ref={pageRef}>
      <ToolPageHeading
        eyebrow="RENTAL SHIELD · NEW"
        title={<>Rent with your<br className="desktop-break"/> eyes open.</>}
        description="Check a listing or read a lease before you pay. Harbour explains the patterns it finds and the steps you can take — it is general guidance, not legal advice."
      />

      <div className="privacy-callout">
        <span aria-hidden="true"><Icon name="shield" size={18} /></span>
        <span><strong>Harbour protects your privacy.</strong><small>HKID, phone and bank details are automatically redacted before any review. Your pasted text is never saved.</small></span>
      </div>

      <div className="rental-tabs" role="tablist" aria-label="Rental Shield tools">
        <button type="button" role="tab" id="tab-listing" aria-selected={tab === "listing"} aria-controls="panel-listing" onClick={() => setTab("listing")}>
          <Icon name="search" size={18} />Check a listing
        </button>
        <button type="button" role="tab" id="tab-lease" aria-selected={tab === "lease"} aria-controls="panel-lease" onClick={() => setTab("lease")}>
          <Icon name="checklist" size={18} />Read a lease
        </button>
      </div>

      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "listing" ? <ListingTab shield={shield}/> : <LeaseTab shield={shield}/>}
      </div>

      <div className="rental-sos-bar" data-reveal>
        <div>
          <span className="eyebrow">ALREADY PAID?</span>
          <strong>Work through the first hour, one step at a time.</strong>
        </div>
        <Button type="button" onClick={() => setPlaybookOpen(true)} icon="sos">I think I&rsquo;ve been scammed</Button>
      </div>

      <RentalPlaybook open={playbookOpen} onClose={() => setPlaybookOpen(false)}/>
    </section>
  );
}
