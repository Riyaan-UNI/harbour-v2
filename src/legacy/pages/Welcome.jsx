import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useNavigate } from "../router.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import { Icon } from "../components/Icons.jsx";
import { HarbourMark } from "../../components/ui/harbour-mark";
import { useDialogAccessibility } from "../hooks/useDialogAccessibility.js";
import "../prototype-landing.css";

const LandInScene = lazy(() => import("../components/LandInScene.jsx"));

function ActionButton({ children, tone = "primary", onClick }) {
  return <button type="button" className={`btn btn-${tone}`} onClick={onClick}><span>{children}</span><Icon name="external" size={16} className="btn-arrow" /></button>;
}

function LandingHeader({ navigate, hasProfile, darkMode, onToggleTheme }) {
  const [menu, setMenu] = useState(false);
  const scrollTo = (id) => { setMenu(false); document.querySelector(id)?.scrollIntoView({ behavior: "smooth" }); };
  return <header className="site-header">
    <button type="button" className="brand" onClick={() => scrollTo("#top")} aria-label="Harbour home"><span className="brand-mark"><HarbourMark /></span><span>Harbour</span></button>
    <nav className={menu ? "open" : ""} aria-label="Landing page navigation">
      <button type="button" onClick={() => scrollTo("#why")}>Why Harbour</button><button type="button" onClick={() => scrollTo("#tools")}>Your tools</button><button type="button" onClick={() => scrollTo("#how")}>How it works</button>
      <div className="mobile-nav-actions"><button type="button" onClick={() => navigate("/login")}>Log in</button><button type="button" onClick={() => navigate(hasProfile ? "/dashboard" : "/onboarding")}>{hasProfile ? "Open Harbour" : "Sign up"}</button></div>
    </nav>
    <div className="header-actions">
      <button className="landing-theme-toggle" type="button" role="switch" aria-checked={darkMode} aria-label="Dark appearance" onClick={onToggleTheme}>
        <Icon name={darkMode ? "moon" : "sun"} size={17} />
        <span className="landing-theme-track" aria-hidden="true"><span /></span>
        <span className="landing-theme-label">{darkMode ? "Dark" : "Light"}</span>
      </button>
      <ActionButton tone="secondary" onClick={() => navigate("/login")}>Log in</ActionButton>
      <ActionButton onClick={() => navigate(hasProfile ? "/dashboard" : "/onboarding")}>{hasProfile ? "My Harbour" : "Sign up"}</ActionButton>
    </div>
    <button type="button" className="menu-button icon-btn" aria-label="Toggle navigation" aria-expanded={menu} onClick={() => setMenu(!menu)}><span/><span/></button>
  </header>;
}

export default function Welcome({ darkMode, onToggleTheme }) {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [notesOpen, setNotesOpen] = useState(false);
  const notesDialogRef = useRef(null);
  const notesCloseRef = useRef(null);
  useDialogAccessibility({ open: notesOpen, dialogRef: notesDialogRef, initialFocusRef: notesCloseRef, onClose: () => setNotesOpen(false) });

  useEffect(() => {
    const targets = document.querySelectorAll(".figma-shell .reveal");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) { targets.forEach(target => target.classList.add("visible")); return undefined; }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
    targets.forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return <div className="figma-shell"><main className="landing" id="top">
    <LandingHeader navigate={navigate} hasProfile={!!profile} darkMode={darkMode} onToggleTheme={onToggleTheme}/>
    <section className="hero">
      <div className="hero-copy reveal"><span className="tag">Made for new arrivals in Hong Kong</span><h1>Find your feet.<br/>Feel at home.</h1><p>One calm place for the practical, confusing and completely new parts of student life.</p>{profile && <button type="button" className="returning-profile-prompt" onClick={() => navigate("/login")}><span className="returning-profile-avatar">{profile.photo || profile.avatar ? <img src={profile.photo || profile.avatar} alt=""/> : profile.name?.[0]?.toUpperCase()}</span><span><strong>Welcome back, {profile.name}.</strong><small>Your profile is saved on this device. Continue where you left off ↗</small></span></button>}
        <div className="button-row"><ActionButton onClick={() => navigate(profile ? "/home" : "/onboarding")}>{profile ? "Open my Harbour" : "Start my Harbour"}</ActionButton></div>
        <button type="button" className="prototype-link" onClick={() => navigate("/login")}><span>I’ve been here before</span><span>Continue with the profile saved in this browser</span></button>
      </div>
      <div className="harbour-scene" role="img" aria-label="A boat sails toward the LandIn island at sunset"><Suspense fallback={<div className="landin-loading" aria-label="Loading the island scene"/>}><LandInScene mode="arrival"/></Suspense><div className="scene-label">LANDIN<br/><small>22° 17′ N · HONG KONG</small></div></div>
      <div className="hero-side-note">Scroll to explore <span>↓</span></div>
    </section>

    <section className="statement reveal" id="why"><p className="eyebrow">A softer landing</p><h2>Moving countries is a lot.<br/>Your support tools shouldn’t be.</h2>
      <div className="statement-grid"><p className="lead">Harbour helps non-local students make sense of everyday life in Hong Kong — without judgement, jargon, or pressure.</p><div className="stat"><strong>4</strong><span>practical tools<br/>in one calm space</span></div><div className="quote">“Like having a local friend who never makes you feel silly for asking.”<small>— A little Harbour encouragement</small></div></div>
    </section>

    <section className="feature-grid" id="tools">
      <article className="feature feature-scam reveal"><div><span className="tag light">01 · SAFETY</span><h2>See through the message.</h2><p>Paste suspicious text and get a plain-language risk read, warning signs, and sensible next steps.</p><ActionButton tone="secondary" onClick={() => navigate("/shield")}>Try Scam X-ray</ActionButton></div><div className="message-demo"><span>Unknown sender</span><p>Your parcel is held. Pay HK$12 now to avoid return…</p><div className="risk-meter"><i/><i/><i/><i/><i/></div><strong>High risk pattern</strong></div></article>
      <article className="feature feature-check reveal"><div className="check-preview">{["Get an Octopus card", "Register student ID", "Find a nearby clinic"].map((text, index) => <div key={text}><span className={index < 2 ? "done" : ""}>{index < 2 ? <Icon name="check" size={14} /> : null}</span>{text}</div>)}</div><div><span className="tag">02 · SETTLING IN</span><h2>One small thing at a time.</h2><p>A friendly checklist that remembers your progress and your own lists on this device.</p><ActionButton tone="secondary" onClick={() => navigate("/checklist")}>See my checklist</ActionButton></div></article>
      <article className="feature feature-translate reveal"><span className="tag light">03 · LANGUAGE</span><h2>Not just words.<br/>The right way to say them.</h2><div className="translation-pair"><span>“Please, no coriander.”</span><strong>唔該，走芫茜。</strong><small>m̀h gōi, jáu yùhn sāi</small></div><ActionButton tone="secondary" onClick={() => navigate("/translate")}>Open Cantonese helper</ActionButton></article>
      <article className="feature feature-photo reveal">
        <img className="feature-photo-art" src="/hong-kong-harbour.png" alt="Hong Kong’s Central skyline and the Star Ferry crossing Victoria Harbour" />
        <div className="photo-caption"><span>A city to learn,<br/>a place to belong.</span><small>Harbour · Hong Kong</small></div>
      </article>
    </section>

    <section className="how" id="how"><div className="section-heading"><p className="eyebrow">How it works</p><h2>Your calm corner,<br/>in three steps.</h2></div><div className="steps"><div className="step"><span>01</span><div><h3>Tell us the basics</h3></div><p>A preferred name and home region helps us shape your local guide.</p></div><div className="step"><span>02</span><div><h3>Pick what you need</h3></div><p>Go straight to a tool. No forced path, no endless setup.</p></div><div className="step"><span>03</span><div><h3>Keep it on your device</h3></div><p>Your profile and progress stay here in this browser.</p></div></div><div className="motion-note"><span>Motion principle</span>Smooth reveals and a calm pace. Reduced-motion mode keeps every part easy to use.</div></section>

    <section className="closing"><div className="carrot c1"/><div className="carrot c2"/><p className="eyebrow">Ready when you are</p><h2>Let’s make Hong Kong<br/>feel a little more like yours.</h2><ActionButton tone="coral" onClick={() => navigate(profile ? "/dashboard" : "/onboarding")}>{profile ? "Open my Harbour" : "Create my local profile"}</ActionButton></section>
    <footer><button type="button" className="brand footer-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span className="brand-mark"><HarbourMark /></span><span>Harbour</span></button><p>A student companion prototype. Not an emergency, financial, or verification service.</p><div><button type="button" onClick={() => setNotesOpen(true)}>Prototype notes</button><button type="button" onClick={() => setNotesOpen(true)}>Privacy</button></div></footer>
  </main>{notesOpen && <div className="prototype-modal-overlay" role="presentation" onClick={() => setNotesOpen(false)}><section className="prototype-modal" ref={notesDialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="prototype-modal-title" onClick={event => event.stopPropagation()}><button type="button" ref={notesCloseRef} className="prototype-modal-close" onClick={() => setNotesOpen(false)} aria-label="Close prototype notes">×</button><p className="eyebrow">A QUICK MAP</p><h2 id="prototype-modal-title">Your Harbour, at a glance.</h2><p>Choose a tool when it helps. Your local profile and checklist stay in this browser. Some community features are sample experiences.</p><div className="wireflow"><span>Landing</span><span>→</span><span>Local profile</span><span>→</span><span>Harbour dashboard</span><span>→</span><span>Tools and lists</span></div><button type="button" className="btn btn-primary" onClick={() => { setNotesOpen(false); navigate(profile ? "/dashboard" : "/onboarding"); }}>Continue <span className="btn-arrow">↗</span></button></section></div>}</div>;
}
