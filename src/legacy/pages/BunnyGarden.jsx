import { useEffect, useState } from "react";
import { Link } from "../router.jsx";
import { Icon } from "../components/Icons.jsx";
const carrots = Array.from({ length: 16 }, (_, i) => ({ left: `${5 + (i % 8) * 12.7}%`, top: `${49 + Math.floor(i / 8) * 20}%`, delay: `${(i % 7) * 0.2}s` }));
export default function BunnyGarden() {
  const [position, setPosition] = useState({ x: 20, y: 60 }); const [hopping, setHopping] = useState(false); const [magic, setMagic] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    // The idle hop stops entirely when reduced motion is requested.
    if (reduced) { setHopping(false); return undefined; }
    const hop = () => { setHopping(true); setPosition({ x: 8 + Math.random() * 82, y: 34 + Math.random() * 44 }); window.setTimeout(() => setHopping(false), 520); };
    const timer = window.setInterval(hop, 2200 + Math.random() * 1000);
    return () => window.clearInterval(timer);
  }, [reduced]);
  useEffect(() => { if (!magic) return; document.body.classList.add("bunny-cursor-active"); const timer = window.setTimeout(() => setMagic(false), 18000); return () => { window.clearTimeout(timer); document.body.classList.remove("bunny-cursor-active"); }; }, [magic]);
  return <section className="page bunny-garden-page">
    <div className="garden-heading">
      <div><span className="eyebrow">A LITTLE BREATHER · HARBOUR GARDEN</span><h1>Welcome to<br/><em>Bunny’s garden.</em></h1><p>Take a pause. Our resident gardener is tending the carrot patch.</p></div>
      <Link to="/dashboard">Back to dashboard ↗</Link>
    </div>
    <div className="garden-stage" aria-label="An animated bunny hops around a tidy carrot garden">
      <div className="garden-sky"><span className="garden-sun"/><span className="garden-cloud cloud-one"/><span className="garden-cloud cloud-two"/><div className="garden-hill hill-far"/><div className="garden-hill hill-near"/></div>
      <div className="garden-sign">HARBOUR<br/><b>CARROT PATCH</b></div>
      <div className="burrow burrow-left"><span/><i/><i/></div>
      <div className="burrow burrow-right"><span/><i/><i/></div>
      <div className="carrot-rows">{carrots.map((carrot, i) => <div className="garden-carrot" key={i} style={{ left: carrot.left, top: carrot.top, animationDelay: carrot.delay }}><i/><span/></div>)}</div>
      <div className={`garden-bunny ${hopping ? "hop" : ""}`} style={{ left: `${position.x}%`, top: `${position.y}%` }} aria-hidden="true"><span className="bunny-shadow"/><span className="bunny-body"/><span className="bunny-head"/><span className="bunny-ear ear-a"/><span className="bunny-ear ear-b"/><span className="bunny-face"/><span className="bunny-tail"/></div>
      <div className="garden-ground-label">GROW A LITTLE AT A TIME <Icon name="sparkle" size={16} /> HARBOUR GARDEN</div>
    </div>
    <div className="garden-actions">
      <div><span className="eyebrow">A FRIENDLY HELLO</span><h2>Want to see a little magic?</h2><p>{magic ? "Bunny cursor is on. It will return automatically in 18 seconds, or take it back now." : "Make your cursor a tiny bunny for 18 seconds."}</p></div>
      {magic
        ? <button className="magic-button magic-stop" onClick={() => setMagic(false)}>Take it back! <Icon name="external" size={18} /></button>
        : <button className="magic-button" onClick={() => setMagic(true)}>Yes, show me <Icon name="sparkle" size={18} /></button>}
    </div>
    <p className="garden-footnote">{reduced ? "Reduced motion is on, so the bunny stays still. The garden still works." : "The bunny wanders around this little playground while you explore. Reduced motion preferences are respected by the garden animations."}</p>
  </section>;
}
