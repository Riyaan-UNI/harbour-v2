import { useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "../router.jsx";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useProfile } from "../context/ProfileContext.jsx";
import CountUp from "../components/CountUp.jsx";
import ImpactPanel from "../components/ImpactPanel.jsx";
import { Icon } from "../components/Icons.jsx";

function safeRead(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
function completedCount() { const data = safeRead("harbour-checklist", {}); return Object.values(data).filter(Boolean).length; }
const friendNames = { "lina-chen": ["Lina Chen", "Taiwan, China"], "arjun-mehta": ["Arjun Mehta", "India"], "mei-wong": ["Mei Wong", "Malaysia"], "sara-kim": ["Sara Kim", "South Korea"] };
const socialUrls = { instagram: "https://instagram.com/", linkedin: "https://linkedin.com/in/", tiktok: "https://tiktok.com/@", x: "https://x.com/" };
/* Token colours, resolved to literals so Recharts/SVG can use them. */
/* UI-019: chart colours follow the theme. These were fixed light-theme hexes, so the
   grid and tick labels were wrong in dark mode. */
const CHART = { bar: "var(--chart-line)", barSoft: "var(--teal-300)", grid: "var(--chart-grid)", tick: "var(--chart-tick)", paper: "var(--surface-card)", hover: "var(--surface-sunken)", line: "var(--chart-line)" };
gsap.registerPlugin(ScrollTrigger);

export default function Dashboard() {
  const root = useRef(null);
  const { profile } = useProfile();
  const done = completedCount();
  const points = Number(localStorage.getItem("harbour-tide-balance") || 3);
  const friends = safeRead("harbour-friends", []);
  const history = safeRead("harbour-progress-history", {});
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => { const date = new Date(); date.setDate(date.getDate() - 6 + i); const key = date.toISOString().slice(0, 10); return { label: date.toLocaleDateString("en", { weekday: "short" }), value: Number(history[key] || 0) }; }), [history]);
  const weekTotal = days.reduce((sum, day) => sum + day.value, 0);
  const busiest = days.reduce((best, day) => (day.value > best.value ? day : best), days[0]);
  const summary = weekTotal === 0
    ? "No checklist steps recorded in the last seven days yet. Complete one small task to start the line."
    : `${weekTotal} step${weekTotal === 1 ? "" : "s"} recorded in the last seven days. Your busiest day was ${busiest.label} with ${busiest.value}.`;

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const context = gsap.context(() => {
      gsap.fromTo(
        ".dash-welcome, .metric-grid > *, .dash-panels > *",
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power3.out",
          clearProps: "all",
        },
      );

      gsap.utils.toArray(".dashboard-community-row > *, .dash-shortcuts > *").forEach((item) => {
        gsap.fromTo(
          item,
          { autoAlpha: 0, y: 14 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
            clearProps: "all",
            scrollTrigger: { trigger: item, start: "top 90%", once: true },
          },
        );
      });
    }, root);

    return () => context.revert();
  }, []);

  return <section ref={root} className="page dashboard-page">
    <div className="dash-welcome">
      <div><span className="eyebrow">YOUR HARBOUR · PERSONAL DASHBOARD</span><h1>Your progress,<br/><em>at your own pace.</em></h1><p>A quiet overview of the small steps you’ve taken in Hong Kong.</p></div>
      <Link className="dash-profile-chip" to="/profile">{profile?.photo || profile?.avatar ? <img src={profile.photo || profile.avatar} alt=""/> : <span>{profile?.name?.[0]?.toUpperCase() || "S"}</span>}<span><strong>{profile?.name || "Your profile"}</strong><small>Edit your details ↗</small></span></Link>
    </div>

    <div className="metric-grid">
      <article><small>CHECKLIST STEPS</small><strong><CountUp value={done} /></strong><span>completed on this device</span></article>
      <Link to="/tide-bank"><small>TIDE POINTS <i>DEMO</i></small><strong><CountUp value={points} /></strong><span>Your local demo balance →</span></Link>
      <Link to="/people"><small>FRIENDS</small><strong><CountUp value={friends.length} /></strong><span>People you’ve added →</span></Link>
    </div>

    <div className="dash-panels">
      <article className="dash-chart-card">
        <div className="panel-heading"><span><small>YOUR ACTIVITY</small><h2>Every step counts.</h2></span><span className="chart-chip">LAST 7 DAYS</span></div>
        {weekTotal === 0
          ? <div className="chart-empty">
              <Icon name="check" size={22} />
              <p><strong>No steps yet this week.</strong> Tick one item off your settle-in list and it will show up here.</p>
              <Link className="button secondary" to="/checklist">Open my settle-in list</Link>
            </div>
          : <div className="recharts-activity" role="img" aria-label={`Checklist completions for the last seven days. ${summary}`}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={days} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={CHART.grid} strokeDasharray="4 5"/>
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: CHART.tick, fontSize: 12 }}/>
                  <Tooltip cursor={{ fill: CHART.hover }} contentStyle={{ border: `1px solid ${CHART.grid}`, borderRadius: 12, background: CHART.paper, fontSize: 13 }} formatter={value => [`${value} steps`, "Completed"]}/>
                  <Bar dataKey="value" fill={CHART.bar} radius={[8, 8, 2, 2]} maxBarSize={34} name="Completed steps"/>
                </BarChart>
              </ResponsiveContainer>
            </div>}
        <p className="panel-note">{summary}</p>
        <p className="panel-note">Activity is stored locally in this browser.</p>
      </article>

      <article className="dash-next-card">
        <span className="eyebrow">A GOOD NEXT STEP</span>
        <h2>Make this space<br/>feel like yours.</h2>
        <p>Add a photo, a few profile details, and the social handles you’d like to share.</p>
        <Link className="button" to="/profile">Edit my profile <Icon name="user" size={18} /></Link>
      </article>
    </div>

    <div className="dashboard-community-row">
      <article className="dash-community-card">
        <div className="panel-heading"><span><small>YOUR COMMUNITY</small><h2>Friends you’ve added</h2></span><Link to="/people">Find people ↗</Link></div>
        {friends.length
          ? friends.map(id => friendNames[id] && <Link className="dash-friend-pill" to={`/profile/${id}`} key={id}><span>{friendNames[id][0][0]}</span><strong>{friendNames[id][0]}</strong><small>{friendNames[id][1]}</small><b>↗</b></Link>)
          : <p className="panel-note">Your friend list is empty. Search the sample directory to add someone.</p>}
      </article>
      <article className="dash-community-card">
        <div className="panel-heading"><span><small>YOUR SOCIAL LINKS</small><h2>Shared by you</h2></span><Link to="/profile">Edit ↗</Link></div>
        {Object.entries(profile?.socials || {}).filter(([, value]) => value).length
          ? Object.entries(profile.socials).filter(([platform, value]) => socialUrls[platform] && value).map(([platform, value]) => <a className="dash-social-link" href={`${socialUrls[platform]}${encodeURIComponent(value.replace(/^@/, ""))}`} target="_blank" rel="noreferrer" key={platform}><span>{platform}</span><strong>@{value}</strong><b>↗</b></a>)
          : <p className="panel-note">Add optional usernames in your profile to show them here.</p>}
      </article>
    </div>

    <ImpactPanel />

    <div className="dash-shortcuts">
      <Link to="/checklist"><span>01</span><strong>My checklists</strong><small>Keep moving, one task at a time ↗</small></Link>
      <Link to="/people"><span>02</span><strong>Find your people</strong><small>Search the Harbour demo directory ↗</small></Link>
    </div>
  </section>;
}
