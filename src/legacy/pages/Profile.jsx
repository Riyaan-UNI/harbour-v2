import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "../router.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import CountrySelect from "../components/CountrySelect.jsx";
import UniversityPicker from "../components/UniversityPicker.jsx";
import Button from "../components/Button.jsx";
import { Icon } from "../components/Icons.jsx";
import { toast } from "../components/Toast.jsx";
import { countryName } from "../lib/countries.js";
import { Mascot, UniversityLogo } from "../../components/ui/index.ts";
import { SAMPLE_PEOPLE } from "../../lib/sample-people.ts";
// The directory now comes from the one shared roster, so a sample person's
// mascot is the same creature here as it is on /app/people.
const directory = SAMPLE_PEOPLE;
function readFriends() { try { return JSON.parse(localStorage.getItem("harbour-friends") || "[]"); } catch { return []; } }
export default function Profile() {
  const { userId } = useParams(); const { profile, saveProfile, clearProfile } = useProfile(); const navigate = useNavigate(); const inputRef = useRef(null);
  const person = userId ? directory.find(item => item.id === userId) : profile;
  const [editing, setEditing] = useState(false); const [name, setName] = useState(profile?.name || ""); const [country, setCountry] = useState(profile?.country || "OTHER"); const [university, setUniversity] = useState(profile?.university || ""); const [socials, setSocials] = useState(profile?.socials || {}); const [photo, setPhoto] = useState(profile?.photo || ""); const [friends, setFriends] = useState(readFriends);
  if (userId && !person) return <section className="page"><h1>Profile not found.</h1><Link to="/people">Back to people</Link></section>;
  if (!userId && !profile) return <section className="page"><div className="empty-profile"><span className="eyebrow">YOUR HARBOUR PROFILE</span><h1>Start with a few details.</h1><p>Your profile is saved only in this browser.</p><Link className="button" to="/onboarding">Create a profile <Icon name="chevronRight" size={18} /></Link></div></section>;
  const isFriend = userId && friends.includes(userId);
  function toggleFriend() { const next = isFriend ? friends.filter(id => id !== userId) : [...friends, userId]; setFriends(next); localStorage.setItem("harbour-friends", JSON.stringify(next)); toast(isFriend ? `${person.name} removed from friends.` : `${person.name} added to friends.`, { tone: isFriend ? "default" : "success" }); }
  function handlePhoto(event) { const file = event.target.files?.[0]; if (!file) return; if (!file.type.startsWith("image/")) return; if (file.size > 1_500_000) { toast("Choose an image under 1.5 MB.", { tone: "warning" }); return; } const reader = new FileReader(); reader.onload = () => { const nextPhoto = String(reader.result); setPhoto(nextPhoto); saveProfile({ ...profile, photo: nextPhoto }); toast("Profile photo updated.", { tone: "success" }); }; reader.readAsDataURL(file); }
  function save(event) { event.preventDefault(); saveProfile({ ...profile, name: name.trim() || "Student", country, university: university.trim(), socials, photo }); setEditing(false); toast("Profile saved on this device.", { tone: "success" }); }
  function logout() { clearProfile(); navigate("/login", { replace: true }); }
  if (userId) return <section className="page profile-page figma-toolpage"><div className="profile-topline"><Link to="/people">← People directory</Link><span className="demo-badge">SAMPLE PROFILE</span></div><article className="public-profile-card"><div className="public-avatar"><span className="public-avatar__plate"><Mascot kind={person.mascot} className="profile-mascot" style={{ color: person.accent }} title={`${person.name}’s mascot`} /></span></div><div className="public-profile-copy"><span className="eyebrow">HARBOUR COMMUNITY</span><h1>{person.name}</h1><p>{person.note}</p><div className="profile-facts"><span className="profile-uni"><UniversityLogo id={person.universityId} size="sm" variant="art" />{person.university}</span><span>From {person.country}</span></div></div><button className={`friend-action ${isFriend ? "is-friend" : ""}`} onClick={toggleFriend} aria-pressed={isFriend}><Icon name={isFriend ? "check" : "plus"} size={16} />{isFriend ? "Added to friends" : "Add friend"}</button></article><p className="local-demo-note">This is a sample profile. Friend connections are saved locally for this demo.</p></section>;
  return <section className="page profile-page figma-toolpage">
    <div className="profile-topline"><span className="eyebrow">YOUR SPACE · PROFILE</span><Link to="/dashboard">Dashboard ↗</Link></div>
    <div className="profile-layout">
      <aside className="profile-identity">
        <div className="profile-photo-wrap">{photo || profile?.avatar ? <img src={photo || profile.avatar} alt={`${profile.name} profile`}/> : <span>{profile?.name?.[0]?.toUpperCase() || "S"}</span>}</div>
        <h1>{profile?.name || "Your profile"}</h1>
        <p>{profile?.university || "Make your Harbour profile yours."}</p>
        <button type="button" className="button secondary" onClick={() => inputRef.current?.click()} icon="user">{photo ? "Change photo" : "Add profile photo"}</button>
        <input ref={inputRef} className="visually-hidden" type="file" accept="image/*" onChange={handlePhoto} aria-label="Upload a profile photo"/>
        <small>Image stays on this device · max 1.5 MB</small>
        <button className="logout-button" onClick={logout}>Log out · keep this profile here <Icon name="external" size={16} /></button>
      </aside>

      <div className="profile-details">
        <div className="panel-heading"><span><small>ABOUT YOU</small><h2>Your details</h2></span><button type="button" className="quiet-button" onClick={() => setEditing(!editing)}>{editing ? "Cancel" : "Edit profile"}</button></div>
        {editing
          ? <form className="profile-form" onSubmit={save}>
              <label>Display name<input value={name} onChange={e => setName(e.target.value)} required maxLength="50" autoComplete="given-name"/></label>
              <label>Home country or region<CountrySelect value={country} onChange={e => setCountry(e.target.value)} required/></label>
              <label>University<UniversityPicker value={university} onChange={setUniversity}/></label>
              <div className="social-fields"><h3>Social usernames <small>OPTIONAL</small></h3><p>Add only the accounts you’d like to share with friends.</p>{["Instagram", "LinkedIn", "TikTok", "X"].map(label => <label key={label}>{label}<input value={socials[label.toLowerCase()] || ""} onChange={e => setSocials({ ...socials, [label.toLowerCase()]: e.target.value.replace(/^@/, "") })} placeholder="username" maxLength="40" autoComplete="off"/></label>)}</div>
              <Button type="submit" icon="check">Save changes</Button>
            </form>
          : <>
              <div className="detail-row"><span>HOME REGION</span><strong>{countryName(profile?.country)}</strong></div>
              <div className="detail-row"><span>UNIVERSITY</span><strong>{profile?.university || "Not added"}</strong></div>
              <div className="social-preview"><span className="eyebrow">SOCIAL LINKS</span>{Object.entries(profile?.socials || {}).filter(([, value]) => value).length ? Object.entries(profile.socials).filter(([, value]) => value).map(([platform, value]) => <div key={platform}><span>{platform}</span><strong>@{value}</strong></div>) : <p>No social usernames shared yet. <button type="button" onClick={() => setEditing(true)}>Add some ↗</button></p>}</div>
            </>}
        <div className="profile-friends">
          <div className="panel-heading"><span><small>YOUR COMMUNITY</small><h2>Friends</h2></span><Link to="/people">Find people ↗</Link></div>
          {friends.length ? friends.map(id => { const friend = directory.find(item => item.id === id); return friend ? <Link className="profile-friend-row" key={id} to={`/profile/${id}`}><span><Mascot kind={friend.mascot} className="profile-friend-mascot" style={{ color: friend.accent }} /></span><strong>{friend.name}</strong><small>{friend.university}</small><b>↗</b></Link> : null; }) : <p>Your friend list is empty. Search the demo directory to find people.</p>}
        </div>
      </div>
    </div>
    <p className="local-demo-note">Local profile only. Harbour does not create an account or store profile changes on a server.</p>
  </section>;
}
