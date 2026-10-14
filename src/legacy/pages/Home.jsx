import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "../router.jsx";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useProfile } from "../context/ProfileContext.jsx";
import HongKongWeather from "../components/HongKongWeather.jsx";
import Button from "../components/Button.jsx";
import CountUp from "../components/CountUp.jsx";
import { Icon } from "../components/Icons.jsx";
import Card from "../components/Card.jsx";
import { useDialogAccessibility } from "../hooks/useDialogAccessibility.js";
import { useHarbourReveal } from "../hooks/useHarbourReveal.js";

const tools = [
  { id: "/shield", number: "01", title: "Scam X-ray", description: "Look beneath suspicious messages.", tone: "portal-coral", icon: "shield" },
  { id: "/checklist", number: "02", title: "Settle-in list", description: "Small steps, sorted for Hong Kong.", tone: "portal-blue", icon: "checklist" },
  { id: "/translate", number: "03", title: "Cantonese helper", description: "Say the useful thing, with context.", tone: "portal-gold", icon: "translate" },
  { id: "/chat", number: "04", title: "Ask Harbour", description: "A calm starting point for questions.", tone: "portal-sage", icon: "chat" },
];
const events = [
  { id: "clay", day: "18", month: "OCT", title: "Clay afternoon", place: "PMQ, Central" },
  { id: "sunset", day: "21", month: "OCT", title: "Sunset campus walk", place: "HKU MTR Exit A" },
  { id: "cafe", day: "26", month: "OCT", title: "Cantonese café", place: "Sham Shui Po" },
];
const emergency = [
  { name: "Emergency services", number: "999", detail: "Police · Fire · Ambulance", href: "tel:999" },
  { name: "Anti-Scam Helpline", number: "18222", detail: "Hong Kong Police · 24-hour consultation", href: "tel:18222" },
  { name: "Immigration enquiries", number: "2824 6111", detail: "Immigration Department", href: "tel:28246111" },
];
const CHART = { line: "var(--chart-line)", grid: "var(--chart-grid)", tick: "var(--chart-tick)", paper: "var(--surface-card)", cursor: "var(--chart-cursor)" };
function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
function weekActivity() {
  const history = read("harbour-progress-history", {});
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - 6 + index);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return { day: new Intl.DateTimeFormat("en", { weekday: "short" }).format(date), steps: Number(history[key] || 0) };
  });
}

export default function Home() {
  const { profile } = useProfile(); const navigate = useNavigate();
  const revealRef = useHarbourReveal();
  const [revealed, setRevealed] = useState(false); const [savedEvents, setSavedEvents] = useState(() => read("harbour-events-saved", []));
  const [sosOpen, setSosOpen] = useState(false); const [balance] = useState(() => Number(localStorage.getItem("harbour-tide-balance") || 3));
  const sosDialogRef = useRef(null); const sosCloseRef = useRef(null);
  const [activity, setActivity] = useState(weekActivity);
  const name = profile?.name?.trim() || "friend";
  useEffect(() => { const refresh = () => setActivity(weekActivity()); window.addEventListener("harbour-progress", refresh); window.addEventListener("storage", refresh); return () => { window.removeEventListener("harbour-progress", refresh); window.removeEventListener("storage", refresh); }; }, []);
  const totalSteps = useMemo(() => activity.reduce((sum, day) => sum + day.steps, 0), [activity]);
  const busiest = useMemo(() => activity.reduce((best, day) => (day.steps > best.steps ? day : best), activity[0]), [activity]);
  const activitySummary = totalSteps === 0
    ? "No check-ins in the last seven days. Tick one small task to begin."
    : `${totalSteps} check-ins in the last seven days, most on ${busiest.day}.`;
  const toggleEvent = id => { const next = savedEvents.includes(id) ? savedEvents.filter(item => item !== id) : [...savedEvents, id]; setSavedEvents(next); localStorage.setItem("harbour-events-saved", JSON.stringify(next)); };
  const date = new Intl.DateTimeFormat("en-HK", { weekday: "long", timeZone: "Asia/Hong_Kong" }).format(new Date()).toUpperCase();
  useDialogAccessibility({ open: sosOpen, dialogRef: sosDialogRef, initialFocusRef: sosCloseRef, onClose: () => setSosOpen(false) });

  return <div className="portal-content portal-home" ref={revealRef}>
    <section className="portal-welcome zone-sea harbour-reveal">
      <div><span className="portal-tag">{date} · HONG KONG</span><h1>Good to see you,<br/><span>{name}.</span></h1><p>What would make today feel easier?</p></div>
      <HongKongWeather />
    </section>

    <section className="tool-cards zone-harbour harbour-reveal" aria-label="Harbour tools" style={{ "--reveal-delay": "100ms" }}>
      {tools.map(tool => <Card as="button" type="button" tone="clay" className={`portal-tool-card ${tool.tone}`} key={tool.id} onClick={() => navigate(tool.id)}>
        <span className="tool-num" aria-hidden="true">{tool.number}</span>
        <span className="portal-round-arrow" aria-hidden="true"><Icon name="external" size={20} /></span>
        <span className="tool-card-copy"><strong>{tool.title}</strong><small>{tool.description}</small></span>
      </Card>)}
    </section>

    <section className="demo-grid zone-ship harbour-reveal" style={{ "--reveal-delay": "200ms" }}>
      <article className="sos-card portal-card">
        <span className="portal-tag warning">SIMULATION</span>
        <h2>Need a friendly voice?</h2>
        <p>Preview a fictional call with Maya, a volunteer guide. No call will be placed.</p>
        <Button variant="secondary" onClick={() => setSosOpen(true)} icon="sos">Preview Voice SOS</Button>
      </article>
      <article className="bank-card portal-card">
        <span className="portal-tag light-outline">TIDE BANK · DEMO</span>
        <p>Local demo balance</p>
        <button type="button" className="bank-reveal" onClick={() => setRevealed(!revealed)} aria-label={revealed ? "Hide demo balance" : "Reveal demo balance"} aria-pressed={revealed}>
          <strong>{revealed ? `HK$ ${balance.toLocaleString("en-HK")}.00` : "HK$ ••••••"}</strong>
          <span>{revealed ? "Hide" : "Reveal"}</span>
        </button>
        <small>Simulation only · No monetary value</small>
        <Link to="/tide-bank" aria-label="Open Tide Bank">Open Tide Bank ↗</Link>
      </article>
    </section>

    <section className="home-activity zone-sea harbour-reveal" style={{ "--reveal-delay": "300ms" }}>
      <div className="home-activity-heading"><span className="portal-tag">YOUR ACTIVITY</span><span className="activity-total"><CountUp value={totalSteps} /> steps recorded · LAST 7 DAYS</span></div>
      <div className="home-chart" role="img" aria-label={`Your checklist activity over the last seven days. ${activitySummary}`}>
        <ResponsiveContainer width="100%" height={230}>
          <LineChart data={activity} margin={{ top: 16, right: 15, left: 5, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke={CHART.grid} strokeDasharray="5 7"/>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: CHART.tick, fontSize: 14 }}/>
            <Tooltip cursor={{ stroke: CHART.cursor }} contentStyle={{ border: `1px solid ${CHART.grid}`, borderRadius: 12, background: CHART.paper, fontSize: 13 }} formatter={value => [`${value} steps`, "Completed"]}/>
            <Line dataKey="steps" type="monotone" stroke={CHART.line} strokeWidth={4} dot={{ r: 6, fill: CHART.paper, stroke: CHART.line, strokeWidth: 3 }} activeDot={{ r: 8 }} name="Completed"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="activity-foot"><strong>{activitySummary}</strong><span>Progress stays in this browser.</span></div>
    </section>

    <section className="community portal-community zone-land harbour-reveal" style={{ "--reveal-delay": "400ms" }}>
      <div className="section-heading-row"><div><span className="portal-tag">COMMUNITY · SIMULATION</span><h2>Good things nearby</h2></div><p>Sample events only. No live matching or booking.</p></div>
      <div className="event-row">{events.map(event => { const saved = savedEvents.includes(event.id); return <article className="portal-event" key={event.id}>
        <div className="event-date"><strong>{event.day}</strong><span>{event.month}</span></div>
        <div className="event-copy"><h3>{event.title}</h3><p>{event.place}</p><button onClick={() => toggleEvent(event.id)} aria-pressed={saved}>{saved ? "Saved sample ✓" : "Save sample ↗"}</button></div>
      </article>; })}</div>
    </section>

    <section className="portal-extras zone-harbour harbour-reveal" style={{ "--reveal-delay": "500ms" }}>
      <div><span className="portal-tag">A LITTLE MORE HARBOUR</span><h2>Your space, your pace.</h2><p>Track your progress, meet sample profiles, or take a break in the garden.</p></div>
      <div className="portal-extra-links">
        <Link to="/dashboard"><span aria-hidden="true"><Icon name="dashboard" size={20} /></span><strong>Your dashboard</strong><small>Progress and profile details</small></Link>
        <Link to="/people"><span aria-hidden="true"><Icon name="users" size={20} /></span><strong>Find your people</strong><small>Search the sample directory</small></Link>
        <Link to="/community"><span aria-hidden="true"><Icon name="globe" size={20} /></span><strong>Community</strong><small>See all sample events</small></Link>
        <Link to="/voice-sos"><span aria-hidden="true"><Icon name="sos" size={20} /></span><strong>Voice SOS</strong><small>Open the support preview</small></Link>
      </div>
    </section>

    <section className="emergency-ripples zone-ship harbour-reveal" id="emergency-ripples" style={{ "--reveal-delay": "600ms" }}>
      <div className="emergency-heading"><span className="portal-tag">HERE IF YOU NEED IT</span><h2>Useful numbers to keep close.</h2><p>Tap a number to call from your device.</p></div>
      <div className="emergency-numbers">{emergency.map(item => <a key={item.number} href={item.href}><span>{item.name}</span><strong>{item.number}</strong><small>{item.detail}</small></a>)}</div>
    </section>

    {sosOpen && <div className="modal-backdrop" role="presentation" onClick={() => setSosOpen(false)}>
      <section className="portal-modal" ref={sosDialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="sos-preview-title" onClick={event => event.stopPropagation()}>
        <button className="modal-close" ref={sosCloseRef} aria-label="Close Voice SOS preview" onClick={() => setSosOpen(false)}><Icon name="close" size={18} /></button>
        <span className="portal-tag">SAMPLE VOLUNTEER · DEMO</span>
        <h2 id="sos-preview-title">Meet Maya.</h2>
        <p>A fictional volunteer guide for this preview. No call is placed or connected.</p>
        <div className="voice-wave" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ animationDelay: `${i * -0.07}s` }}/>)}</div>
        <Button onClick={() => { setSosOpen(false); navigate("/voice-sos"); }} icon="sos">Explore Voice SOS</Button>
      </section>
    </div>}
  </div>;
}
