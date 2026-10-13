import { useMemo, useState } from "react";
import PageHeading from "../components/PageHeading.jsx";
import Button from "../components/Button.jsx";
import { Icon } from "../components/Icons.jsx";
import { toast } from "../components/Toast.jsx";
const events = [{ id: "walk", type: "EXPLORE TOGETHER", title: "A slow Sunday in Sheung Wan", date: "SAT · 10:30 AM", place: "Sheung Wan MTR · Exit A2", color: "coral" }, { id: "tea", type: "MEET & CONNECT", title: "Tea, chats & new beginnings", date: "WED · 4:00 PM", place: "Campus common room", color: "blue" }, { id: "market", type: "CITY DISCOVERY", title: "Market morning in Kowloon City", date: "SUN · 9:00 AM", place: "Kowloon City Market", color: "gold" }];
const types = [...new Set(events.map(event => event.type))];
export default function Community() {
  const [joined, setJoined] = useState({});
  const [activeType, setActiveType] = useState("");
  const visible = useMemo(() => events.filter(event => !activeType || event.type === activeType), [activeType]);
  function toggle(event) {
    const next = { ...joined, [event.id]: !joined[event.id] };
    setJoined(next);
    toast(next[event.id] ? `Interested in “${event.title}”.` : `Removed “${event.title}” from your interests.`, { tone: next[event.id] ? "success" : "default" });
  }
  return <section className="page figma-toolpage community-page">
    <PageHeading eyebrow="COMMUNITY · DEMO" title="The city feels smaller together." description="A few friendly ideas for getting out and meeting people. Listings are demo content and aren’t live events."/>
    <div className="demo-banner">DEMO EXPERIENCE <span>Events and match counts are illustrative.</span></div>

    <div className="filter-chips" role="group" aria-label="Filter events by type">
      <button type="button" className="chip" aria-pressed={activeType === ""} onClick={() => setActiveType("")}>All events</button>
      {types.map(type => <button type="button" key={type} className="chip" aria-pressed={activeType === type} onClick={() => setActiveType(activeType === type ? "" : type)}>{type}</button>)}
    </div>

    {visible.length
      ? <div className="event-grid">{visible.map(event => <article className={`event-card ${event.color}`} key={event.id}>
          <div className="event-card-top">
            <span className="event-type">{event.type}</span>
            <span className="event-number" aria-hidden="true">0{events.indexOf(event) + 1}</span>
          </div>
          <h2>{event.title}</h2>
          <p>{event.date}<br/>{event.place}</p>
          <Button variant="secondary" onClick={() => toggle(event)} icon={joined[event.id] ? "check" : "plus"}>{joined[event.id] ? "You’re interested" : "I’m interested"}</Button>
        </article>)}</div>
      : <div className="directory-empty">
          <span aria-hidden="true"><Icon name="calendar" size={28} /></span>
          <h2>Nothing here yet.</h2>
          <p>No sample events match this filter.</p>
          <button type="button" className="button secondary" onClick={() => setActiveType("")}>Show all events</button>
        </div>}

    <div className="match-card">
      <span className="eyebrow">YOUR COMMUNITY</span>
      <strong>12 students nearby</strong>
      <p>A sample match count for this demo.</p>
    </div>
  </section>;
}
