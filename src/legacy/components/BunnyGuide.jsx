import { useEffect, useRef, useState } from "react";
import { useLocation } from "../router.jsx";

export default function BunnyGuide({ compact = false }) {
  const { pathname } = useLocation();
  const [hidden, setHidden] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [phase, setPhase] = useState("rest");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const positionRef = useRef(position);
  const [facing, setFacing] = useState(1);
  const [carrot, setCarrot] = useState("none");
  const [guideStep, setGuideStep] = useState(() => localStorage.getItem("harbour-guide-complete") ? 3 : 0);
  const [magicOffer, setMagicOffer] = useState(false);
  const [magicActive, setMagicActive] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => { positionRef.current = position; }, [position]);

  useEffect(() => {
    if (pathname !== "/home" || guideStep < 3 || localStorage.getItem("harbour-magic-seen")) return undefined;
    const timer = window.setTimeout(() => setMagicOffer(true), 2400);
    return () => window.clearTimeout(timer);
  }, [pathname, guideStep]);
  useEffect(() => {
    if (!magicOffer) return;
    setPosition({ x: 0, y: 0 });
    setPhase("rest");
  }, [magicOffer]);

  useEffect(() => {
    if (!magicActive) return undefined;
    const svg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='40' viewBox='0 0 36 40'%3E%3Cpath fill='%23f8f1df' stroke='%23112f2b' stroke-width='2' d='M9 18C3 8 8 1 12 4l5 11 2-12c1-4 7-3 7 1l-1 14c9 2 11 12 5 17-8 6-22 2-23-7z'/%3E%3Ccircle cx='14' cy='25' r='1.6' fill='%23112f2b'/%3E%3Ccircle cx='25' cy='25' r='1.6' fill='%23112f2b'/%3E%3C/svg%3E";
    document.documentElement.style.setProperty("--magic-cursor", `url("${svg}") 12 12, auto`);
    document.documentElement.classList.add("magic-cursor");
    const timer = window.setTimeout(() => setMagicActive(false), 18000);
    return () => { window.clearTimeout(timer); document.documentElement.style.removeProperty("--magic-cursor"); document.documentElement.classList.remove("magic-cursor"); };
  }, [magicActive]);

  useEffect(() => {
    if (paused || reduced || hidden || magicOffer) { setPhase("rest"); return undefined; }
    let disposed = false;
    const timers = [];
    const later = (fn, delay) => timers.push(window.setTimeout(() => !disposed && fn(), delay));
    const scheduleHop = () => {
      const mobile = window.matchMedia("(max-width: 650px)").matches;
      later(() => {
        const current = positionRef.current;
        const rangeX = compact ? Math.max(65, window.innerWidth - (mobile ? 120 : 290)) : Math.max(55, window.innerWidth - (mobile ? 110 : 125));
        const rangeY = Math.max(45, window.innerHeight - (mobile ? 185 : 220));
        let x = compact ? -Math.random() * rangeX : Math.random() * rangeX;
        if (Math.abs(x - current.x) < (mobile ? 28 : 70)) x = compact ? -rangeX * .88 : rangeX * .88;
        const y = -(12 + Math.random() * rangeY);
        const seekingCarrot = Math.random() < .24;
        if (seekingCarrot) setCarrot("noticed");
        setFacing(x >= current.x ? 1 : -1);
        setPhase("crouch");
        later(() => { setPosition({ x, y }); setPhase("air"); }, 150);
        later(() => setPhase("land"), mobile ? 790 : 850);
        later(() => {
          setPhase("rest");
          if (seekingCarrot) { setCarrot("held"); later(() => setCarrot("none"), 1700); }
          scheduleHop();
        }, mobile ? 1100 : 1180);
      }, mobile ? 3000 + Math.random() * 3000 : 1500 + Math.random() * 2600);
    };
    scheduleHop();
    return () => { disposed = true; timers.forEach(window.clearTimeout); };
  }, [paused, reduced, hidden, compact, magicOffer]);

  if (hidden) return <button className="bunny-return" onClick={() => setHidden(false)}>Show guide</button>;
  const style = { "--bunny-x": `${position.x}px`, "--bunny-y": `${position.y}px`, "--bunny-facing": facing };
  const guideText = guideStep === 0 ? "Hi, I’m Hops. I’ll help you find your way around Harbour." : guideStep === 1 ? "Start with Get started to make a local profile, or Log in if you’ve been here before." : "Scroll to explore the tools. You can return to your Harbour whenever you like.";
  function advanceGuide() {
    if (guideStep >= 2) { setGuideStep(3); localStorage.setItem("harbour-guide-complete", "yes"); }
    else setGuideStep(guideStep + 1);
  }
  function showMagic() { setMagicOffer(false); localStorage.setItem("harbour-magic-seen", "yes"); setMagicActive(true); }
  return <div className={`bunny-guide ${paused || reduced ? "paused" : ""} ${compact ? "compact" : ""}`} aria-label="Harbour bunny guide">
    <div className={`bunny-roamer phase-${phase}`} style={style}>
      <div className={`bunny ${magicOffer ? "wizard" : ""}`} aria-hidden="true"><span className="magician-hat"/><span className="ear e1"/><span className="ear e2"/><span className="head"><i/><b/><em/></span><span className="body"/><span className="front-paw"/><span className="back-paw"/><span className="tail"/><span className={`bunny-carrot ${carrot}`}><i/><b/></span></div>
    </div>
    <div className="hint">{magicActive ? "Magic cursor for 18 seconds. Make a little mischief." : magicOffer ? <>Want to see magic? <button className="hint-action" onClick={showMagic}>Yes, show me</button><button className="hint-action quiet" onClick={() => { setMagicOffer(false); localStorage.setItem("harbour-magic-seen", "yes"); }}>Maybe later</button></> : guideStep < 3 ? <>{guideText}<button className="hint-action" onClick={advanceGuide}>{guideStep === 2 ? "Got it" : "Next"}</button></> : carrot === "held" ? "Found a snack. Back to exploring." : compact ? "Need a hand?" : "Psst — everything here is safe to try."}</div>
    <div className="bunny-controls"><button onClick={() => setPaused(!paused)} disabled={reduced}>{reduced ? "Still mode" : paused ? "Play" : "Pause"}</button><button onClick={() => setHidden(true)}>Dismiss</button></div>
  </div>;
}
