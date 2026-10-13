import { lazy, Suspense } from "react";
import { Link, useNavigate } from "../router.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { countryName } from "../lib/countries.js";
import { Icon } from "../components/Icons.jsx";
const LandInScene = lazy(() => import("../components/LandInScene.jsx"));

export default function Login() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  function enter() {
    if (!profile) {
      navigate("/onboarding");
      return;
    }
    navigate("/home");
  }
  return <section className="login-page">
    <div className="login-visual">
      <button className="landing-brand login-brand" onClick={() => navigate("/")}><span className="landing-brand-mark"><img src="/harbour-mark.svg" alt=""/></span><span>harbour<span className="brand-period">.</span><small>HONG KONG, MADE CLOSER</small></span></button>
      <div className="login-visual-art">
        <Suspense fallback={<div className="landin-loading" aria-label="Loading the island scene"/>}><LandInScene mode="login"/></Suspense>
      </div>
      <div className="login-visual-caption"><span>HARBOUR · A PLACE TO BEGIN AGAIN</span><span>22° 17′ N&nbsp; 114° 10′ E</span></div>
    </div>
    <div className="login-panel">
      <button className="login-back" onClick={() => navigate("/")}>← <span>Back to Harbour</span></button>
      <div className="login-panel-content">
        <span className="landing-eyebrow">YOUR HONG KONG, AT YOUR PACE</span>
        <h1>{profile ? <>Welcome<br/>back<span className="brand-period">.</span></> : <>A good place<br/>to begin<span className="brand-period">.</span></>}</h1>
        <p>{profile ? `We found your Harbour profile on this device, ${profile.name}. Would you like to sign in again and continue where you left off?` : "Create a local profile to keep your Harbour details and progress on this device."}</p>
        <div className="local-login-note">
          <span className="local-note-icon" aria-hidden="true"><Icon name={profile ? "check" : "lock"} size={20} /></span>
          <span><strong>{profile ? "Welcome back to your Harbour" : "Local demo access"}</strong><small>{profile ? "This is the profile already saved in this browser." : "Account sign-in isn’t enabled yet. Your details stay on this device."}</small></span>
        </div>
        {profile
          ? <div className="saved-profile">
              <span className="saved-profile-photo">{profile.photo ? <img src={profile.photo} alt=""/> : profile.name?.[0]?.toUpperCase() || "S"}</span>
              <span><strong>{profile.name}</strong><small>{[profile.university, countryName(profile.country)].filter(value => value && value !== "Not added").join(" · ") || "Your Harbour profile is saved here"}</small></span>
              <span className="saved-state">SAVED</span>
            </div>
          : <div className="no-profile"><span className="no-profile-mark">H</span><span><strong>No profile on this device yet</strong><small>It only takes a moment to create one.</small></span></div>}
        <button className="login-submit" onClick={enter}>{profile ? `Continue as ${profile.name}` : "Create my profile"}<Icon name="chevronRight" size={18} /></button>
        <div className="login-switch">{profile ? <>Want to start fresh? <Link to="/onboarding">Create another local profile <Icon name="external" size={14} /></Link></> : <>New to Harbour? <Link to="/onboarding">Create your profile <Icon name="external" size={14} /></Link></>}</div>
      </div>
      <footer className="login-footer"><span>YOUR DETAILS STAY ON THIS DEVICE</span><button onClick={() => navigate("/")}>HARBOUR HOME ↗</button></footer>
    </div>
  </section>;
}
