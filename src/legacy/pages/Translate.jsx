import { useEffect, useState } from "react";
import { Link } from "../router.jsx";
import { translateText } from "../lib/api.js";
import Button from "../components/Button.jsx";
import ToolPageHeading from "../components/ToolPageHeading.jsx";
import ServiceError from "../components/ServiceError.jsx";
import CounterCard from "../components/CounterCard.jsx";
import { SkeletonLines } from "../components/Skeleton.jsx";
import { Icon } from "../components/Icons.jsx";
import { toast } from "../components/Toast.jsx";
import { essentialCantonesePhrases } from "../data/essentialCantonesePhrases.js";
import SpeechButton from "../components/SpeechButton.jsx";

const categories = [...new Set(essentialCantonesePhrases.map(phrase => phrase.category))];
const phraseColumns = [categories.filter((_, index) => index % 2 === 0), categories.filter((_, index) => index % 2 === 1)];
export default function Translate() {
  const [text, setText] = useState(""); const [result, setResult] = useState(""); const [error, setError] = useState(null); const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [mode, setMode] = useState(() => (
    typeof window !== "undefined" && /(^#|&)cc=/.test(window.location.hash) ? "counter" : "translate"
  ));
  async function runTranslation() { if (!text.trim() || busy) return; setBusy(true); setError(null); setResult(""); try { setResult((await translateText(text.trim())).translation); } catch (err) { setError(err); } finally { setBusy(false); } }
  function submit(event) { event.preventDefault(); runTranslation(); }
  function swapLanguages() { if (!result) return; setText(result); setResult(""); setError(null); toast("Panes swapped — edit and translate again.", { tone: "default" }); }
  async function copyResult() {
    if (!result) return;
    try { await navigator.clipboard.writeText(result); toast("Translation copied.", { tone: "success" }); }
    catch { toast("Copy is not available in this browser.", { tone: "warning" }); }
  }
  function speakResult() {
    if (!result) return;
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      toast("Speech playback is not available in this browser.", { tone: "warning" });
      return;
    }
    const speech = window.speechSynthesis;
    if (speaking) {
      speech.cancel();
      setSpeaking(false);
      return;
    }
    speech.cancel();
    const utterance = new window.SpeechSynthesisUtterance(result);
    utterance.lang = "zh-HK";
    utterance.rate = 0.88;
    utterance.voice = speech.getVoices().find(voice => /^(yue|zh)-HK$/i.test(voice.lang)) || null;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeaking(false);
      toast("Could not play speech on this device.", { tone: "warning" });
    };
    speech.speak(utterance);
  }
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, [result]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  return <section className="page figma-toolpage translate-page">
    <ToolPageHeading eyebrow="LANGUAGE TOOL" title={<>Say it with<br className="desktop-break"/> confidence.</>} description="Enter a phrase to request a translation, or build a card you can show at a counter. Both need an internet connection."/>
    <div className="mode-switch" role="tablist" aria-label="Cantonese helper modes">
      <button type="button" role="tab" aria-selected={mode === "translate"} className={mode === "translate" ? "is-active" : ""} onClick={() => setMode("translate")}><Icon name="translate" size={18} />Translate a phrase</button>
      <button type="button" role="tab" aria-selected={mode === "counter"} className={mode === "counter" ? "is-active" : ""} onClick={() => setMode("counter")}><Icon name="chat" size={18} />Counter Card</button>
    </div>
    {mode === "counter" ? <CounterCard /> : <>
    <p className="text-privacy-note">Avoid including names or private details. When available, your phrase is sent to Harbour&rsquo;s translation provider.</p>
    <div className="privacy-callout">
      <span aria-hidden="true"><Icon name="shield" size={18} /></span>
      <span><strong>Your text stays private.</strong><small>Harbour redacts HKID, phone and bank details before any translation. Pasted text is not saved.</small></span>
    </div>
    <form onSubmit={submit}>
      <div className="translate-workspace">
        <div className="translate-pane">
          <label htmlFor="translate-text">ENGLISH</label>
          <textarea id="translate-text" value={text} onChange={event => setText(event.target.value)} maxLength="5000" placeholder="What would you like to say?"/>
          <button type="button" className="sample-link" onClick={() => { setText("Where is the nearest MTR station?"); setResult(""); setError(null); }}>Try a sample phrase</button>
        </div>
        <div className="translate-controls">
          <button className="translate-arrow" type="submit" disabled={busy || !text.trim()} aria-label="Translate phrase" aria-busy={busy ? "true" : undefined}>{busy ? "···" : <Icon name="chevronRight" size={22} />}</button>
          <button className="translate-swap" type="button" onClick={swapLanguages} disabled={!result} aria-label="Swap panes and edit the Cantonese text"><Icon name="swap" size={20} /></button>
        </div>
        <div className={`translate-pane translate-output ${result ? "has-result" : ""}`}>
          <div className="translate-output-head">
            <label>CANTONESE · 廣東話</label>
            {result && <div className="translate-output-actions">
              <button type="button" className={`translate-speak ${speaking ? "is-speaking" : ""}`} onClick={speakResult} aria-label={speaking ? "Stop Cantonese speech" : "Listen to Cantonese translation"} aria-pressed={speaking} title={speaking ? "Stop speaking" : "Listen to translation"}>
                <Icon name={speaking ? "pause" : "volume"} size={18} />{speaking ? "Stop" : "Listen"}
              </button>
              <button type="button" className="translate-copy" onClick={copyResult}><Icon name="copy" size={18} />Copy</button>
            </div>}
          </div>
          {busy
            ? <div className="translate-skeleton" aria-label="Translation loading"><SkeletonLines count={4} /></div>
            : result
              ? <p className="translated-copy" lang="yue">{result}</p>
              : <p className="translate-placeholder">Your translation will appear here.</p>}
        </div>
      </div>
      <div className="translate-submit">
        <span className="field-count">{text.length} / 5,000</span>
        <Button loading={busy} disabled={!text.trim() || busy} icon="translate">{busy ? "Translating…" : "Translate phrase"}</Button>
      </div>
    </form>
    {error && <ServiceError error={error} onRetry={runTranslation}>
      <h3>Essential Cantonese phrases</h3>
      <p className="phrase-draft-note">Offline phrase card · Draft wording. Please check with a Cantonese speaker before relying on it.</p>
      <div className="phrase-groups">{phraseColumns.map((column, columnIndex) => <div className="phrase-group-column" key={columnIndex}>{column.map(category => <details key={category}><summary>{category}<Icon name="chevronDown" size={18} /></summary><ul>{essentialCantonesePhrases.filter(phrase => phrase.category === category).map(phrase => <li key={phrase.english}><strong>{phrase.english}</strong><div className="phrase-output-row" lang="zh-HK"><span>{phrase.cantonese}</span><SpeechButton text={phrase.cantonese} label={`Listen to Cantonese: ${phrase.english}`} /></div><small>{phrase.jyutping}</small></li>)}</ul></details>)}</div>)}</div>
    </ServiceError>}
    {result && <>
      <p className="figma-tool-note">Machine translation can miss context. For important matters, check with a fluent speaker.</p>
      <p className="translation-next-step">Need help with the situation around this phrase? <Link to="/chat">Ask Harbour for practical context ↗</Link></p>
    </>}
    </>}
  </section>;
}
