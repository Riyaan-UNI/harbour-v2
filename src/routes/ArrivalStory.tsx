import { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { HarbourMark } from '../components/ui/harbour-mark';
import { FiberWarp } from '../components/arrival/FiberWarp';
import { ARRIVAL_DESTINATION, TERMINAL_LINES } from '../components/arrival/arrivalTransition';
import { publicUrl } from '../lib/public-url';

const scenes = [
  { src: publicUrl('/art/arrival-storm.webp'), alt: 'A small boat heads into a dark, windy sea.' },
  { src: publicUrl('/art/arrival-horizon.webp'), alt: 'Hong Kong appears beyond the waves as the storm begins to clear.' },
  { src: publicUrl('/art/arrival-dock.webp'), alt: 'A calm Hong Kong harbor and lantern-lit landing dock at sunrise.' },
];

const captions = [
  'Every new beginning has its weather.',
  'The waves rise. Still, you keep moving.',
  'Then, a light appears beyond the storm.',
];

const ending = 'You took the first step. Leaving what’s familiar and beginning again in Hong Kong takes courage. We’ve got your back from here.';

export default function ArrivalStory({ storageWarning = '' }: { storageWarning?: string }): JSX.Element {
  const navigate = useNavigate();
  const sceneRefs = useRef<(HTMLImageElement | null)[]>([]);
  const shipRef = useRef<HTMLImageElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const [beat, setBeat] = useState(0);
  const [finished, setFinished] = useState(false);
  const reducedMotion = useRef(false);
  const transitionRef = useRef<HTMLDivElement>(null);
  const [transitioning, setTransitioning] = useState(false);

  useLayoutEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion.current) {
      setBeat(3);
      setFinished(true);
      return undefined;
    }

    const [storm, horizon, dock] = sceneRefs.current;
    if (!storm || !horizon || !dock || !shipRef.current) return undefined;
    gsap.set([storm, horizon, dock], { autoAlpha: 0, scale: 1.04 });
    gsap.set(storm, { autoAlpha: 1, scale: 1 });
    gsap.set(shipRef.current, { autoAlpha: 1, xPercent: -18, y: 0, rotation: -3, scale: 1 });

    const timeline = gsap.timeline({
      onComplete: () => {
        setBeat(3);
        setFinished(true);
      },
    });
    timeline
      .to(shipRef.current, { xPercent: 0, y: -16, rotation: 5, duration: 1.8, ease: 'sine.inOut' })
      .call(() => setBeat(1))
      .to(storm, { autoAlpha: 0, duration: 0.65, ease: 'power1.inOut' }, '-=0.25')
      .to(horizon, { autoAlpha: 1, scale: 1, duration: 0.75, ease: 'power1.inOut' }, '<')
      .to(shipRef.current, { xPercent: 25, y: -5, rotation: -2, duration: 1.8, ease: 'sine.inOut' })
      .call(() => setBeat(2))
      .to(horizon, { autoAlpha: 0, duration: 0.65, ease: 'power1.inOut' }, '-=0.2')
      .to(dock, { autoAlpha: 1, scale: 1, duration: 0.85, ease: 'power1.inOut' }, '<')
      .to(shipRef.current, { xPercent: 40, y: 12, rotation: 0, scale: 0.9, duration: 1.8, ease: 'power2.out' })
      .to(shipRef.current, { y: 5, duration: 0.6, repeat: 1, yoyo: true, ease: 'sine.inOut' })
      .to(copyRef.current, { autoAlpha: 0.35, duration: 0.3 }, '-=0.5')
      .call(() => setBeat(3))
      .to(copyRef.current, { autoAlpha: 1, duration: 0.45 });

    return () => {
      timeline.kill();
    };
  }, []);

  useLayoutEffect(() => {
    if (!transitioning || !transitionRef.current) return undefined;
    const overlay = transitionRef.current;
    const blackout = overlay.querySelector('.arrival-transition-blackout');
    const warp = overlay.querySelector('.fiber-warp');
    const terminal = overlay.querySelector('.arrival-transition-terminal');
    const ripple = overlay.querySelector('.arrival-transition-ripple');
    const terminalLines = overlay.querySelectorAll('.arrival-terminal-line');
    const cursor = overlay.querySelector('.arrival-terminal-cursor');
    const timeline = gsap.timeline({
      onComplete: () => navigate(ARRIVAL_DESTINATION, { replace: true }),
    });
    timeline
      .to(blackout, { autoAlpha: 1, duration: 0.4, ease: 'power2.inOut' })
      .to(warp, { autoAlpha: 1, duration: 0.18 })
      .to({}, { duration: 2.45 })
      .to(warp, { autoAlpha: 0.72, duration: 0.55, ease: 'power2.out' })
      .to(terminal, { autoAlpha: 1, duration: 0.28 }, '<')
      .fromTo(terminalLines, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.82, stagger: 0.7, ease: 'steps(22)' })
      .fromTo(cursor, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12 }, '-=0.1')
      .to(terminal, { autoAlpha: 0, duration: 0.2 }, '+=0.7')
      .set(ripple, { autoAlpha: 1 })
      .fromTo(ripple, { scale: 0.01 }, { scale: 2.8, duration: 0.72, ease: 'power2.in' })
      .to(ripple, { autoAlpha: 0, duration: 0.22 });
    return () => { timeline.kill(); };
  }, [transitioning, navigate]);

  useLayoutEffect(() => {
    if (finished) continueRef.current?.focus();
  }, [finished]);

  function continueToHarbour() {
    if (reducedMotion.current) {
      navigate(ARRIVAL_DESTINATION, { replace: true });
      return;
    }
    setTransitioning(true);
  }

  return (
    <main className={`arrival-story${reducedMotion.current ? ' arrival-story--still' : ''}`} aria-labelledby="arrival-story-title">
      <div className="arrival-story-scenes" aria-hidden="true">
        {scenes.map((scene, index) => <img
          key={scene.src}
          ref={element => { sceneRefs.current[index] = element; }}
          className={`arrival-story-scene arrival-story-scene--${index}`}
          src={scene.src}
          alt=""
          draggable="false"
        />)}
        <span className="arrival-story-weather" />
        <img ref={shipRef} className="arrival-story-ship" src={publicUrl('/art/arrival-ship.webp')} alt="" draggable="false" />
        <span className="arrival-story-vignette" />
      </div>

      <header className="arrival-story-header">
        <HarbourMark className="arrival-story-logo" />
        <span>HARBOUR · A PLACE TO BEGIN</span>
        {!finished && <button type="button" className="arrival-story-skip" onClick={continueToHarbour}>Skip story <span aria-hidden="true">↗</span></button>}
      </header>

      <section className="arrival-story-copy" aria-live="polite" aria-atomic="true">
        <span className="arrival-story-eyebrow">{beat < 3 ? `THE CROSSING · 0${beat + 1}` : 'YOU’RE HERE · HONG KONG'}</span>
        <h1 id="arrival-story-title" className="sr-only">Your arrival in Hong Kong</h1>
        <p ref={copyRef} className="arrival-story-caption">{beat < 3 ? captions[beat] : ending}</p>
        {beat === 3 && <div className="arrival-story-flag"><img src={publicUrl('/flags/hk.svg')} alt="Hong Kong flag"/><span>Hong Kong</span></div>}
        {storageWarning && <p className="arrival-story-storage" role="status">{storageWarning}</p>}
        {finished && <button ref={continueRef} type="button" className="arrival-story-continue" onClick={continueToHarbour}>Continue to Harbour <span aria-hidden="true">→</span></button>}
      </section>
      <div className="arrival-story-progress" aria-hidden="true"><span style={{ width: `${finished ? 100 : beat === 0 ? 16 : beat === 1 ? 48 : 78}%` }} /></div>
      {transitioning && <div ref={transitionRef} className="arrival-transition" aria-hidden="true">
        <div className="arrival-transition-blackout" />
        <div className="arrival-transition-warp">
          <FiberWarp />
          <div className="arrival-transition-terminal">
            {TERMINAL_LINES.map(line => <p className="arrival-terminal-line" key={line}>{line}</p>)}
            <span className="arrival-terminal-cursor" aria-hidden="true" />
          </div>
        </div>
        <div className="arrival-transition-ripple" />
      </div>}
    </main>
  );
}
