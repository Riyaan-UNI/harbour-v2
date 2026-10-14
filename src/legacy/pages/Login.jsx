import { Link, useLocation, useNavigate } from "../router.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { countryName } from "../lib/countries.js";
import { universityByName } from "../data/hkUniversities.js";
import { Icon } from "../components/Icons.jsx";
import CountryFlag from "../components/CountryFlag.jsx";
import { HarbourMark } from "../../components/ui/harbour-mark";
import { UniversityLogo } from "../../components/ui/university-logo";
import { UNIVERSITY_ART_BY_ID } from "../../components/ui/university-logos";

/**
 * What sits under a saved profile's name: the flag and the country it belongs
 * to, then the university's name when it is one the manifest does not have a
 * logo for (the picker's "Other / not enrolled yet"). A university with a logo
 * shows the logo at the end of the row instead, so its name would be a repeat.
 */
function profileMeta(profile) {
  const country = countryName(profile.country);
  const hasCountry = Boolean(country) && country !== "Not added";
  const university = profile.university;
  const hasLogo = Boolean(universityByName(university));
  const parts = [];

  if (hasCountry) parts.push(<span className="saved-profile-country" key="country"><CountryFlag code={profile.country}/>{country}</span>);
  if (university && !hasLogo) parts.push(<span key="university">{university}</span>);

  if (!parts.length) return <small className="saved-profile-meta"><span>Your Harbour profile</span></small>;

  return <small className="saved-profile-meta">{parts.map((part, index) => index === 0 ? part : [<span className="saved-profile-sep" aria-hidden="true" key={`sep-${index}`}>·</span>, part])}</small>;
}

/**
 * The art stage on the left shows the first saved profile's university as a
 * decorative concept-art composition — orbiting rings, drifting blobs, the
 * institution's mark on a white bed. When there are no profiles yet, or the
 * first profile picked "Other / not enrolled yet", it falls back to the
 * harbour mascot so the stage never shows a missing-image gap.
 */
function firstProfileArtSrc(profiles) {
  const profile = profiles[0];
  if (!profile) return null;
  const university = universityByName(profile.university);
  if (!university) return null;
  return UNIVERSITY_ART_BY_ID[university.id] ?? null;
}

export default function Login() {
  const { profiles, selectProfile, removeProfile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from || "/home";

  function enter(profile) {
    if (selectProfile(profile.id)) navigate(returnTo, { replace: true });
  }

  function remove(profile) {
    if (window.confirm(`Remove ${profile.name}'s profile from this device?`)) {
      removeProfile(profile.id);
    }
  }

  return <section className="login-page login-page--harbour">
    <header className="login-topbar">
      <button type="button" className="landing-brand login-brand" onClick={() => navigate("/")} aria-label="Harbour home"><HarbourMark className="login-brand-mark"/><span>Harbour<span className="brand-period">.</span></span></button>
      <span className="login-topline">A LOCAL PROFILE · JUST FOR THIS DEVICE</span>
      <button type="button" className="login-back" onClick={() => navigate("/")}>Back to Harbour <span aria-hidden="true">↗</span></button>
    </header>
    <div className="login-composition">
      <div className="login-art-stage" aria-label="Harbour mascot welcoming you to Hong Kong">
        <div className="login-art-torus login-art-torus--one" aria-hidden="true"/>
        <div className="login-art-torus login-art-torus--two" aria-hidden="true"/>
        <div className="login-art-blob login-art-blob--teal" aria-hidden="true"/>
        <div className="login-art-blob login-art-blob--gold" aria-hidden="true"/>
        <span className="login-floating-note login-floating-note--top"><span>✦</span> YOUR NEXT CHAPTER</span>
        {(() => {
          const art = firstProfileArtSrc(profiles);
          return art
            ? <img className="login-floating-art" src={art} alt="" aria-hidden="true" />
            : <img className="login-floating-mascot" src={profiles[0]?.avatar || profiles[0]?.photo || "/art/mascot-crane.webp"} alt="" />;
        })()}
        <span className="login-floating-note login-floating-note--bottom"><span>⌂</span> Hong Kong, at your pace</span>
        <p className="login-art-caption">A new city is a lot to carry.<br/><strong>You don’t have to carry it alone.</strong></p>
      </div>
      <div className="login-panel">
      <div className="login-panel-content">
        <span className="landing-eyebrow">YOUR HONG KONG, AT YOUR PACE</span>
        <h1>{profiles.length ? <>Welcome back<span className="brand-period">.</span></> : <>A good place to begin<span className="brand-period">.</span></>}</h1>
        <p>{profiles.length ? "Choose the local profile you’d like to continue with." : "Create a local profile to keep your Harbour details and progress on this device."}</p>
        <div className="local-login-note">
          <span className="local-note-icon" aria-hidden="true"><Icon name={profiles.length ? "check" : "lock"} size={20}/></span>
          <span><strong>{profiles.length ? "Saved on this device" : "Local profile only"}</strong><small>Real accounts and passwords aren’t enabled. Your details stay in this browser.</small></span>
        </div>
        {profiles.length ? <div className="saved-profiles" aria-label="Saved Harbour profiles">
          {profiles.map(profile => {
            const university = universityByName(profile.university);
            return <article className="saved-profile-option" key={profile.id}>
              <button type="button" className="saved-profile-choice" onClick={() => enter(profile)}>
                <span className="saved-profile-photo">{profile.photo || profile.avatar ? <img src={profile.photo || profile.avatar} alt=""/> : profile.name?.[0]?.toUpperCase() || "S"}</span>
                <span className="saved-profile-copy"><strong>{profile.name}</strong>{profileMeta(profile)}</span>
                {university ? <UniversityLogo id={university.id} size="md" variant="art" className="saved-profile-university"/> : null}
                <Icon name="chevronRight" size={18}/>
              </button>
              <button type="button" className="saved-profile-remove" onClick={() => remove(profile)} aria-label={`Remove ${profile.name}'s profile from this device`}>Remove</button>
            </article>;
          })}
        </div> : <div className="no-profile"><span className="no-profile-mark">H</span><span><strong>No profile on this device yet</strong><small>It only takes a moment to create one.</small></span></div>}
        <Link className="login-submit login-create-link" to="/signup">{profiles.length ? "Create another profile" : "Create my profile"}<Icon name="chevronRight" size={18}/></Link>
        <p className="login-privacy">Profiles are local to this browser and can be removed from this screen.</p>
      </div>
      </div>
    </div>
    <footer className="login-footer"><span>YOUR DETAILS STAY ON THIS DEVICE</span><span>HONG KONG, MADE CLOSER</span></footer>
  </section>;
}
