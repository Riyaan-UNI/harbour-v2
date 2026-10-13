import { useMemo, useState } from "react";
import { Link } from "../router.jsx";
import PageHeading from "../components/PageHeading.jsx";
import { Icon } from "../components/Icons.jsx";
import SearchField from "../components/SearchField.jsx";
import Card from "../components/Card.jsx";
import { toast } from "../components/Toast.jsx";
const people = [{ id: "lina-chen", name: "Lina Chen", country: "Taiwan, China", university: "City University of Hong Kong", note: "Finding little cafés around Kowloon.", tags: ["Cafés", "Design"] }, { id: "arjun-mehta", name: "Arjun Mehta", country: "India", university: "The University of Hong Kong", note: "Always up for a campus walk.", tags: ["Hiking", "Food"] }, { id: "mei-wong", name: "Mei Wong", country: "Malaysia", university: "Hong Kong Polytechnic University", note: "Learning the city one MTR stop at a time.", tags: ["Language exchange", "Markets"] }, { id: "sara-kim", name: "Sara Kim", country: "South Korea", university: "Hong Kong Baptist University", note: "New here too. Sharing small discoveries.", tags: ["Photography", "Museums"] }];
const allTags = [...new Set(people.flatMap(person => person.tags))];
function friendsRead() { try { return JSON.parse(localStorage.getItem("harbour-friends") || "[]"); } catch { return []; } }
export default function People() {
  const [query, setQuery] = useState(""); const [activeTag, setActiveTag] = useState(""); const [friends, setFriends] = useState(friendsRead);
  const filtered = useMemo(() => people.filter(person => {
    const matchesQuery = `${person.name} ${person.country} ${person.university} ${person.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    const matchesTag = !activeTag || person.tags.includes(activeTag);
    return matchesQuery && matchesTag;
  }), [query, activeTag]);
  function toggle(id) {
    const person = people.find(item => item.id === id);
    const added = friends.includes(id);
    const next = added ? friends.filter(item => item !== id) : [...friends, id];
    setFriends(next);
    localStorage.setItem("harbour-friends", JSON.stringify(next));
    if (person) toast(added ? `${person.name} removed from friends.` : `${person.name} added to friends.`, { tone: added ? "default" : "success" });
  }
  return <section className="page people-page figma-toolpage">
    <PageHeading eyebrow="COMMUNITY · SAMPLE DIRECTORY" title="Find your people." description="Search by name, university, home region, or shared interests. These sample profiles are here to show how Harbour connections work."/>
    <div className="directory-banner"><span className="demo-badge">LOCAL DEMO</span><p>Friend connections are saved on this device. No real users are being contacted.</p></div>

    <div className="people-controls">
      <SearchField className="people-search" label="Search people" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search people, universities, or interests" />
      <div className="filter-chips" role="group" aria-label="Filter by interest">
        <button type="button" className="chip" aria-pressed={activeTag === ""} onClick={() => setActiveTag("")}>All</button>
        {allTags.map(tag => <button type="button" key={tag} className="chip" aria-pressed={activeTag === tag} onClick={() => setActiveTag(activeTag === tag ? "" : tag)}>{tag}</button>)}
      </div>
    </div>

    <div className="people-results">
      <div className="results-title"><span>{filtered.length} sample profiles</span><Link to="/profile">View my profile ↗</Link></div>
      {filtered.length
        ? <div className="people-grid">{filtered.map(person => {
            const added = friends.includes(person.id);
            return <Card as="article" tone="glass" className="person-card" key={person.id}>
              <Link className="person-avatar" to={`/profile/${person.id}`} aria-label={`Open ${person.name}’s profile`}>{person.name[0]}</Link>
              <div className="person-info">
                <span className="person-meta">{person.country} · {person.university}</span>
                <h2><Link to={`/profile/${person.id}`}>{person.name}</Link></h2>
                <p>{person.note}</p>
                <div className="person-tags">{person.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
              </div>
              <button type="button" className={`friend-action ${added ? "is-friend" : ""}`} onClick={() => toggle(person.id)} aria-label={added ? `Remove ${person.name} from friends` : `Add ${person.name} as a friend`} aria-pressed={added}>
                <Icon name={added ? "check" : "plus"} size={16} />{added ? "Added" : "Add friend"}
              </button>
            </Card>;
          })}</div>
        : <div className="directory-empty">
            <span aria-hidden="true"><Icon name="search" size={28} /></span>
            <h2>No matches yet.</h2>
            <p>Try a different name, university, or interest.</p>
            <button type="button" className="button secondary" onClick={() => { setQuery(""); setActiveTag(""); }}>Clear filters</button>
          </div>}
    </div>
  </section>;
}
