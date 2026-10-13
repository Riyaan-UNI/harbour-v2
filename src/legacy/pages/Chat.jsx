import { useEffect, useRef, useState } from "react";
import { Link } from "../router.jsx";
import { sendChat } from "../lib/api.js";
import Button from "../components/Button.jsx";
import ToolPageHeading from "../components/ToolPageHeading.jsx";
import ServiceError from "../components/ServiceError.jsx";
import { SkeletonLines } from "../components/Skeleton.jsx";
import { Icon } from "../components/Icons.jsx";

const suggestions = ["How do I use the MTR?", "Where can I get a SIM card?", "What is an Octopus card?"];
export default function Chat() {
  const [message, setMessage] = useState(""); const [reply, setReply] = useState(""); const [error, setError] = useState(null); const [busy, setBusy] = useState(false);
  const [asked, setAsked] = useState("");
  const inputRef = useRef(null);
  const replyRef = useRef(null);

  async function runChat() { if (!message.trim() || busy) return; setBusy(true); setError(null); setReply(""); setAsked(message.trim()); try { setReply((await sendChat(message.trim())).reply); } catch (err) { setError(err); } finally { setBusy(false); } }
  function submit(event) { event.preventDefault(); runChat(); }

  // Auto-growing input: the height is set directly (never animated).
  useEffect(() => {
    const node = inputRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 240)}px`;
  }, [message]);

  // Keep the newest message in view.
  useEffect(() => {
    if (!reply || !replyRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    replyRef.current.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [reply]);

  const isEmpty = !reply && !busy && !error;

  return <section className="page figma-toolpage ask-page">
    <ToolPageHeading narrow eyebrow="GUIDANCE" title={<>No question<br/>is too small.</>} description="Ask about everyday student life. Answers need an internet connection."/>
    <p className="text-privacy-note">Avoid including names or private account details. When available, your question is sent to Harbour’s AI provider to prepare a response.</p>

    {isEmpty && <div className="ask-empty">
      <span className="ask-empty-mark" aria-hidden="true"><Icon name="chat" size={28} /></span>
      <p>Start with anything on your mind. These are the questions people ask most.</p>
    </div>}

    <div className="ask-suggestions">{suggestions.map(item => <button type="button" key={item} onClick={() => { setMessage(item); setError(null); }}>{item}<Icon name="chevronRight" size={16} /></button>)}</div>

    {(asked || busy) && <div className="ask-thread">
      {asked && <article className="ask-bubble ask-bubble-user"><span className="eyebrow">YOU</span><p>{asked}</p></article>}
      {busy && <article className="ask-reply-card ask-loading" aria-label="Harbour is preparing an answer">
        <span className="eyebrow">HARBOUR IS THINKING</span>
        <span className="typing-dots" aria-hidden="true"><i/><i/><i/></span>
        <SkeletonLines count={3} />
      </article>}
    </div>}

    {error && <ServiceError error={error} onRetry={runChat}>
      <h3>While you wait</h3>
      <p>These pages and numbers are available without Harbour’s service.</p>
      <div className="offline-links">
        <Link to="/checklist">Open your settling-in checklist ↗</Link>
        <Link to="/home#emergency-ripples">View emergency numbers ↗</Link>
        <a href="tel:999">Call emergency services · 999</a>
      </div>
    </ServiceError>}

    {reply && <article className="ask-reply-card" ref={replyRef} aria-live="polite">
      <span className="eyebrow">HARBOUR SAYS</span>
      <p>{reply}</p>
      <small>General information only. Check official sources for important decisions.</small>
    </article>}

    {reply && <nav className="related-tools" aria-label="Continue with another Harbour tool">
      <span>TAKE A NEXT STEP</span>
      <Link to="/checklist">Save an action to your checklist <b>↗</b></Link>
      <Link to="/translate">Prepare a Cantonese phrase <b>↗</b></Link>
    </nav>}

    <form className="ask-form-card" onSubmit={submit}>
      <label htmlFor="chat-message">Your question</label>
      <div className="ask-input-row">
        <textarea ref={inputRef} id="chat-message" rows={1} value={message} onChange={event => setMessage(event.target.value)} maxLength="3000" placeholder="Ask Harbour anything about settling in…"/>
        <Button type="submit" loading={busy} disabled={!message.trim() || busy} icon="send">{busy ? "Thinking…" : "Ask Harbour"}</Button>
      </div>
      <span className="field-count">{message.length} / 3,000</span>
    </form>
  </section>;
}
