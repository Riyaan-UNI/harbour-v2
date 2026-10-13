import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "../router.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { getChecklist } from "../lib/api.js";
import ToolPageHeading from "../components/ToolPageHeading.jsx";
import ProgressRing from "../components/ProgressRing.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import { Icon } from "../components/Icons.jsx";
import { toast } from "../components/Toast.jsx";

function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
function createId() { return globalThis.crypto?.randomUUID?.() || `todo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
const offlineStarter = [{ id: "offline-arrival", title: "A few useful first steps", steps: ["Save your university’s emergency contact details.", "Get an Octopus card or another way to travel.", "Find your campus clinic and save emergency number 999.", "Arrange a local SIM or eSIM.", "Check your student registration and campus ID.", "Learn one useful Cantonese phrase for asking for help."] }];

export default function Checklist() {
  const { profile } = useProfile();
  const location = useLocation(); const navigate = useNavigate(); const handledSuggestion = useRef("");
  const [items, setItems] = useState([]);
  const [done, setDone] = useState(() => read("harbour-checklist", {}));
  const [customLists, setCustomLists] = useState(() => read("harbour-custom-lists", []));
  const [newListTitle, setNewListTitle] = useState("");
  const [newItems, setNewItems] = useState({});
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [suggestionNotice, setSuggestionNotice] = useState("");
  const [celebrate, setCelebrate] = useState(false);
  const [expandedCompleted, setExpandedCompleted] = useState({});
  const celebrationTimer = useRef(null);

  useEffect(() => {
    let current = true;
    setLoaded(false);
    setOfflineMode(false);
    getChecklist(profile?.country || "").then(result => { if (current) { setItems(result); setError(""); } }).catch(() => { if (current) { setItems(offlineStarter); setOfflineMode(true); setError(""); } }).finally(() => { if (current) setLoaded(true); });
    return () => { current = false; };
  }, [profile?.country]);
  useEffect(() => () => window.clearTimeout(celebrationTimer.current), []);
  useEffect(() => {
    const suggestion = location.state?.checklistSuggestion;
    if (!suggestion || handledSuggestion.current === location.key) return;
    handledSuggestion.current = location.key;
    const current = read("harbour-custom-lists", []);
    const list = current.find(item => item.title === "Safety follow-up");
    if (list?.items.some(item => item.text === suggestion)) {
      setSuggestionNotice("That safety follow-up is already in your list.");
    } else {
      const next = list
        ? current.map(item => item.id === list.id ? { ...item, items: [...item.items, { id: createId(), text: suggestion }] } : item)
        : [...current, { id: createId(), title: "Safety follow-up", items: [{ id: createId(), text: suggestion }] }];
      localStorage.setItem("harbour-custom-lists", JSON.stringify(next));
      setCustomLists(next);
      setSuggestionNotice("Added a safety follow-up to your personal list.");
      toast("Safety follow-up added to your list.", { tone: "success" });
    }
    navigate(location.pathname, { replace: true, state: null });
  }, [location.key, location.pathname, location.state, navigate]);

  const coreTasks = useMemo(() => items.flatMap(item => item.steps.map((step, index) => ({ id: `${item.id}-${index}`, text: step }))), [items]);
  const groups = useMemo(() => [coreTasks.slice(0, 3), coreTasks.slice(3)], [coreTasks]);
  const allTasks = [...coreTasks, ...customLists.flatMap(list => list.items.map(item => ({ id: item.id, text: item.text })))];
  const count = allTasks.filter(task => done[task.id]).length;
  const progress = allTasks.length ? count / allTasks.length * 100 : 0;
  function toggleCompleted(key) {
    setExpandedCompleted(current => ({ ...current, [key]: !current[key] }));
  }

  const groupCompleteRef = useRef([false, false]);
  useEffect(() => {
    if (!loaded) return;
    groups.forEach((group, index) => {
      if (!group.length) return;
      const complete = group.every(task => done[task.id]);
      if (complete && !groupCompleteRef.current[index]) {
        groupCompleteRef.current[index] = true;
        toast(index === 0 ? "First 48 hours complete. Nicely done." : "This week’s steps are complete.", { tone: "success" });
      } else if (!complete) {
        groupCompleteRef.current[index] = false;
      }
    });
  }, [done, groups, loaded]);

  function toggle(id) {
    const wasDone = !!done[id];
    const next = { ...done, [id]: !wasDone };
    setDone(next);
    localStorage.setItem("harbour-checklist", JSON.stringify(next));
    const nextCount = count + (wasDone ? -1 : 1);
    try {
      const history = read("harbour-progress-history", {});
      history[new Date().toISOString().slice(0, 10)] = nextCount;
      localStorage.setItem("harbour-progress-history", JSON.stringify(history));
      window.dispatchEvent(new Event("harbour-progress"));
    } catch { /* Keep checklist interaction available if browser storage is full. */ }
    if (!wasDone && allTasks.length > 0 && nextCount === allTasks.length) {
      setCelebrate(true);
      window.clearTimeout(celebrationTimer.current);
      celebrationTimer.current = window.setTimeout(() => setCelebrate(false), 5200);
    }
  }

  function addList(event) {
    event.preventDefault();
    const title = newListTitle.trim();
    if (!title) return;
    const next = [...customLists, { id: createId(), title, items: [] }];
    setCustomLists(next);
    localStorage.setItem("harbour-custom-lists", JSON.stringify(next));
    setNewListTitle("");
    toast(`“${title}” created.`, { tone: "success" });
  }
  function addItem(event, listId) {
    event.preventDefault();
    const text = (newItems[listId] || "").trim();
    if (!text) return;
    const next = customLists.map(list => list.id === listId ? { ...list, items: [...list.items, { id: createId(), text }] } : list);
    setCustomLists(next);
    localStorage.setItem("harbour-custom-lists", JSON.stringify(next));
    setNewItems({ ...newItems, [listId]: "" });
  }
  function removeList(listId) {
    const removed = customLists.find(list => list.id === listId);
    const next = customLists.filter(list => list.id !== listId);
    const nextDone = { ...done };
    removed?.items.forEach(item => delete nextDone[item.id]);
    setCustomLists(next);
    setDone(nextDone);
    localStorage.setItem("harbour-custom-lists", JSON.stringify(next));
    localStorage.setItem("harbour-checklist", JSON.stringify(nextDone));
    if (removed) toast(`“${removed.title}” removed.`, { tone: "warning" });
  }

  return <section className="page checklist-page figma-toolpage">
    <ToolPageHeading eyebrow="YOUR PROGRESS" title="Small steps count." description="A practical list that saves automatically on this device."/>

    <div className="figma-progress-card">
      <ProgressRing value={progress} label="complete" />
      <div className="figma-progress-copy">
        <strong>{count} of {allTasks.length}</strong>
        <span>settling-in tasks complete</span>
        <div className="progress-track" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Settling-in progress"><i style={{ width: `${progress}%` }}/></div>
      </div>
    </div>

    {error && <p className="error-box">{error}</p>}
    {offlineMode && <p className="checklist-offline-note" role="status">The starter list is available offline. Your check-ins and personal lists stay in this browser.</p>}
    {suggestionNotice && <p className="checklist-offline-note" role="status">{suggestionNotice}</p>}

    {!loaded && <div className="checklist-skeleton" aria-label="Loading checklist" role="status" aria-busy="true">
      <Skeleton variant="title" width="180px" />
      <Skeleton variant="line" />
      <Skeleton variant="line" />
      <Skeleton variant="line" width="70%" />
    </div>}
    {loaded && !error && !items.length && <p className="loading-note">We couldn’t load the Harbour starter list. Your personal lists are still available below.</p>}

    {loaded && <div className="figma-checklist-grid">{groups.map((group, groupIndex) => {
      const remaining = group.filter(task => !done[task.id]);
      const completed = group.filter(task => done[task.id]);
      return <article className="figma-checklist-card" key={groupIndex}>
        <span className="portal-tag">{groupIndex === 0 ? "FIRST 48 HOURS" : "THIS WEEK"}</span>
        {remaining.map(task => <label className="figma-task-row" key={task.id}>
          <input type="checkbox" checked={false} onChange={() => toggle(task.id)}/>
          <span className="figma-checkbox" aria-hidden="true"/>
          <span>{task.text}</span>
          <small>{groupIndex === 0 ? "About 10 min" : "When ready"}</small>
        </label>)}
        {completed.length > 0 && <div className="completed-task-group">
          <button
            className="completed-task-toggle"
            type="button"
            aria-expanded={!!expandedCompleted[`core-${groupIndex}`]}
            aria-controls={`completed-core-${groupIndex}`}
            onClick={() => toggleCompleted(`core-${groupIndex}`)}
          >
            <span>Completed</span><span className="completed-task-count">{completed.length}</span>
          </button>
          {expandedCompleted[`core-${groupIndex}`] && <div className="completed-task-list" id={`completed-core-${groupIndex}`} role="region" aria-label={`Completed ${groupIndex === 0 ? "first 48 hours" : "this week"} tasks`}>
            {completed.map(task => <label className="figma-task-row checked" key={task.id}>
              <input type="checkbox" checked={true} onChange={() => toggle(task.id)}/>
              <span className="figma-checkbox" aria-hidden="true"/>
              <span>{task.text}</span>
              <small>Done</small>
            </label>)}
          </div>}
        </div>}
      </article>;
    })}</div>}

    <section className="custom-todos">
      <div className="custom-todos-heading">
        <div><span className="eyebrow">MAKE IT YOURS</span><h2>Your own lists</h2><p>Add errands, appointments, or anything you want to remember.</p></div>
        <span className="custom-list-count">{customLists.length} {customLists.length === 1 ? "LIST" : "LISTS"}</span>
      </div>
      <form className="add-list-form" onSubmit={addList}>
        <label className="sr-only" htmlFor="new-list-title">New list name</label>
        <input id="new-list-title" value={newListTitle} onChange={event => setNewListTitle(event.target.value)} placeholder="Name a new list…" maxLength="48"/>
        <button className="button" type="submit" disabled={!newListTitle.trim()}>Create list <Icon name="plus" size={18} /></button>
      </form>
      {customLists.length === 0
        ? <div className="empty-custom-lists"><span aria-hidden="true"><Icon name="list" size={28} /></span><p>Your personal lists will appear here. Start with a small plan for this week.</p></div>
        : <div className="custom-list-grid">{customLists.map(list => <article className="custom-list-card" key={list.id}>
            <header>
              <div><span className="eyebrow">YOUR LIST</span><h3>{list.title}</h3></div>
              <button type="button" className="remove-list" onClick={() => removeList(list.id)} aria-label={`Remove ${list.title}`}><Icon name="close" size={18} /></button>
            </header>
            {list.items.length
              ? <>
                  <div className="custom-list-items">{list.items.filter(item => !done[item.id]).map(item => <label className="task" key={item.id}><input type="checkbox" checked={false} onChange={() => toggle(item.id)}/><span className="fake-check" aria-hidden="true"/><span>{item.text}</span></label>)}</div>
                  {list.items.some(item => done[item.id]) && <div className="completed-task-group">
                    <button
                      className="completed-task-toggle"
                      type="button"
                      aria-expanded={!!expandedCompleted[`custom-${list.id}`]}
                      aria-controls={`completed-custom-${list.id}`}
                      onClick={() => toggleCompleted(`custom-${list.id}`)}
                    >
                      <span>Completed</span><span className="completed-task-count">{list.items.filter(item => done[item.id]).length}</span>
                    </button>
                    {expandedCompleted[`custom-${list.id}`] && <div className="completed-task-list" id={`completed-custom-${list.id}`} role="region" aria-label={`Completed tasks in ${list.title}`}>
                      {list.items.filter(item => done[item.id]).map(item => <label className="task checked" key={item.id}><input type="checkbox" checked={true} onChange={() => toggle(item.id)}/><span className="fake-check" aria-hidden="true"/><span>{item.text}</span></label>)}
                    </div>}
                  </div>}
                </>
              : <p className="custom-list-empty">Add the first step to your list.</p>}
            <form className="add-item-form" onSubmit={event => addItem(event, list.id)}>
              <label className="sr-only" htmlFor={`new-item-${list.id}`}>Add a task to {list.title}</label>
              <input id={`new-item-${list.id}`} value={newItems[list.id] || ""} onChange={event => setNewItems({ ...newItems, [list.id]: event.target.value })} placeholder="Add a task…" maxLength="120"/>
              <button type="submit" disabled={!(newItems[list.id] || "").trim()} aria-label="Add task"><Icon name="plus" size={20} /></button>
            </form>
          </article>)}</div>}
    </section>

    {celebrate && <div className="celebration-toast" role="status" aria-live="polite">
      <span className="celebration-spark" aria-hidden="true"><Icon name="sparkle" size={24} /></span>
      <strong>You did it. Every step is checked off.</strong>
      <small>Take a breath and enjoy the progress.</small>
      <div className="celebration-confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ "--confetti-index": index, "--confetti-x": `${(index * 41 + 13) % 100}%` }}/>)}</div>
    </div>}
  </section>;
}
