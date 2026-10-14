import { useEffect, useRef, useState } from "react";
import { useNavigate } from "../router.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import PageHeading from "../components/PageHeading.jsx";
import CountrySelect from "../components/CountrySelect.jsx";
import UniversityPicker from "../components/UniversityPicker.jsx";
import { Icon } from "../components/Icons.jsx";
import { HarbourMark } from "../../components/ui/harbour-mark";
import { UNIVERSITY_ART_BY_ID } from "../../components/ui/university-logos";
import { universityByName } from "../data/hkUniversities.js";
import { publicUrl } from "../../lib/public-url.ts";

const mascots = [
  { id: "otter", name: "Otter", src: publicUrl("/art/mascot-otter.webp") },
  { id: "crane", name: "Crane", src: publicUrl("/art/mascot-crane.webp") },
  { id: "turtle", name: "Turtle", src: publicUrl("/art/mascot-turtle.webp") },
  { id: "fox", name: "Fox", src: publicUrl("/art/mascot-fox.webp") },
];

const steps = [
  { title: "What should we call you?", description: "Choose a name that feels comfortable. It does not have to be your legal name." },
  { title: "Where are you from?", description: "We’ll use your home region to bring relevant information closer." },
  { title: "Where do you study?", description: "This is optional. Pick a Harbour companion too, or keep the one we chose." },
];

function randomMascot(exclude) {
  const choices = mascots.filter(item => item.id !== exclude);
  return choices[Math.floor(Math.random() * choices.length)];
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [university, setUniversity] = useState("");
  const [mascot, setMascot] = useState(() => mascots[Math.floor(Math.random() * mascots.length)]);
  const [error, setError] = useState("");
  const headingRef = useRef(null);
  const nameInputRef = useRef(null);
  const { profiles, saveProfile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 0) nameInputRef.current?.focus();
    else headingRef.current?.focus();
  }, [step]);

  function advance(event) {
    event.preventDefault();
    setError("");
    if (step === 0) {
      const nickname = name.trim();
      if (nickname.length < 2 || nickname.length > 20) {
        setError("Use a name between 2 and 20 characters.");
        return;
      }
      if (profiles.some(profile => profile.name?.toLocaleLowerCase() === nickname.toLocaleLowerCase())) {
        setError("That name is already used by a profile on this device. Try another.");
        return;
      }
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!country) {
        setError("Choose a country or region to continue.");
        return;
      }
      setStep(2);
      return;
    }

    const profile = {
      name: name.trim(),
      nickname: name.trim(),
      country,
      countryCode: country,
      university,
      universityId: university || null,
      socials: {},
      mascotId: mascot.id,
      avatar: mascot.src,
    };
    const persisted = saveProfile(profile);
    navigate("/arrival", { state: { storageWarning: persisted ? "" : "This browser could not save your profile. It will be available only until this tab is closed." } });
  }

  return <div className="onboarding-entry signup-entry">
    <header className="entry-top">
      <button type="button" className="landing-brand signup-brand" onClick={() => navigate("/")} aria-label="Harbour home">
        <HarbourMark className="signup-brand-mark" />
        <span>Harbour<span className="brand-period">.</span><small>HONG KONG, MADE CLOSER</small></span>
      </button>
      <div className="signup-returning"><span>Already have a profile?</span><button type="button" className="login-link" onClick={() => navigate("/login")}>Log in <Icon name="chevronRight" size={16}/></button></div>
    </header>

    <section className="signup-layout" aria-labelledby="signup-title">
      <div className="signup-illustration" aria-label={`${mascot.name}, your Harbour companion`}>
        <div className="signup-art-glow" />
        <div className="signup-art-torus signup-art-torus--one" aria-hidden="true"/>
        <div className="signup-art-torus signup-art-torus--two" aria-hidden="true"/>
        <div className="signup-art-blob signup-art-blob--teal" aria-hidden="true"/>
        <div className="signup-art-blob signup-art-blob--gold" aria-hidden="true"/>
        {(() => {
          // Step 3 picks the university. Showing its concept art in the
          // illustration is the moment the page acknowledges the choice — the
          // mascot stands aside for the institution's coloured composition.
          const chosen = step === 2 && university ? universityByName(university) : null;
          const artSrc = chosen ? UNIVERSITY_ART_BY_ID[chosen.id] : null;
          return artSrc
            ? <img className="signup-art" src={artSrc} alt="" aria-hidden="true" />
            : <img src={mascot.src} alt="" className="signup-mascot" />;
        })()}
        <div className="signup-art-caption"><span>YOUR FIRST WEEKS</span><strong>A little company<br/>for the new places.</strong></div>
      </div>

      <div className="signup-form-column">
        <div className="signup-progress" aria-label={`Step ${step + 1} of 3`}>
          <span>YOUR PERSONAL STARTING POINT</span><span>0{step + 1} <i>/ 03</i></span>
          <div className="signup-progress-track" aria-hidden="true"><span style={{ width: `${((step + 1) / 3) * 100}%` }}/></div>
        </div>
        <PageHeading
          eyebrow={`STEP ${step + 1} OF 3`}
          title={<span id="signup-title" ref={headingRef} tabIndex={-1}>{steps[step].title}</span>}
          description={steps[step].description}
        />
        <form className="form-card signup-form" onSubmit={advance} noValidate>
          <div className="signup-step-announcement" aria-live="polite" aria-atomic="true">Step {step + 1} of 3. {steps[step].title}</div>
          {step === 0 && <label htmlFor="signup-nickname">Your preferred name
            <input ref={nameInputRef} id="signup-nickname" value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Alex" autoComplete="given-name" maxLength={20} required aria-describedby="nickname-help" />
            <small id="nickname-help">2–20 characters. Your profile stays on this device.</small>
          </label>}
          {step === 1 && <label htmlFor="signup-country">Home country or region
            <CountrySelect id="signup-country" value={country} onChange={event => setCountry(event.target.value)} required />
          </label>}
          {step === 2 && <>
            <label>University <span className="optional">OPTIONAL</span>
              <UniversityPicker value={university} onChange={setUniversity}/>
            </label>
            <div className="signup-mascot-choice">
              <div className="signup-mascot-preview"><img src={mascot.src} alt=""/><span><small>YOUR COMPANION</small><strong>{mascot.name}</strong></span></div>
              <button type="button" className="quiet-button signup-shuffle" onClick={() => setMascot(current => randomMascot(current.id))}>
                <Icon name="swap" size={16}/> Shuffle mascot
              </button>
            </div>
            <div className="signup-university-options"><button type="button" className="signup-skip" onClick={() => setUniversity("Other / not enrolled yet")}>Other / not enrolled yet</button><button type="button" className="signup-skip" onClick={() => setUniversity("")}>I’ll add my university later</button></div>
          </>}

          {error && <p className="signup-error" role="alert">{error}</p>}
          <div className="signup-controls">
            {step > 0 && <button type="button" className="quiet-button" onClick={() => { setError(""); setStep(value => value - 1); }}>Back</button>}
            <button type="submit" className="login-submit signup-next">{step === 2 ? "Enter Harbour" : "Next"}<Icon name="chevronRight" size={18}/></button>
          </div>
          <small className="privacy-note">No account or password. Your profile is saved only in this browser.</small>
        </form>
      </div>
    </section>
    <footer className="entry-disclaimer">A LOCAL PROFILE ONLY · NO ACCOUNT OR PASSWORD REQUIRED</footer>
  </div>;
}
