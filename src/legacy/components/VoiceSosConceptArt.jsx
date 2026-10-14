/**
 * Voice SOS — distress-signal concept art (Slice 7).
 *
 * The visual language is distress signals: expanding ping rings, radar
 * sweeps, wave interference — plus a living canvas network background.
 * Every scene is decorative (aria-hidden or labelled) and every SVG
 * gradient id is namespaced per scene so multiple scenes can render on
 * the same page without document-level id collisions.
 */

import { useEffect, useRef } from "react";

/* --------------------------------------------------------- CANVAS NETWORK - */
/**
 * Drifting nodes connected by faint lines when within range — a network
 * waiting for a signal to travel through it. Pauses under reduced motion
 * (renders one static frame instead).
 */
export function BackgroundStack() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const NODE_COUNT = 70;
    const LINK_DIST = 130;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let dots = [];
    let raf = 0;

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      dots = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 0.8 + Math.random() * 1.6,
          hue:
            Math.random() < 0.55
              ? "185, 223, 225"
              : Math.random() < 0.6
                ? "241, 201, 111"
                : "127, 212, 198",
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw(t) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        if (!prefersReduced) {
          d.x += d.vx;
          d.y += d.vy;
          if (d.x < -10) d.x = w + 10;
          if (d.x > w + 10) d.x = -10;
          if (d.y < -10) d.y = h + 10;
          if (d.y > h + 10) d.y = -10;
        }

        const tw = 0.35 + 0.3 * Math.sin(t * 0.001 + d.phase);
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + d.hue + "," + tw.toFixed(3) + ")";
        ctx.fill();

        for (let j = i + 1; j < dots.length; j++) {
          const e = dots[j];
          const dx = d.x - e.x;
          const dy = d.y - e.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.16;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(e.x, e.y);
            ctx.strokeStyle = "rgba(185, 223, 225," + alpha.toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      if (!prefersReduced) raf = requestAnimationFrame(draw);
    }

    resize();
    seed();
    raf = requestAnimationFrame(draw);

    const onResize = () => {
      resize();
      seed();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="vos-bg-stack" aria-hidden="true">
      <div className="vos-bg-base" />
      <canvas ref={canvasRef} className="vos-bg-canvas" />
      <div className="vos-bg-blob vos-bg-blob--teal" />
      <div className="vos-bg-blob vos-bg-blob--gold" />
      <div className="vos-bg-blob vos-bg-blob--coral" />
      <div className="vos-bg-grid" />
      <div className="vos-bg-vignette" />
    </div>
  );
}

/* ----------------------------------------------------------- SIGNAL ORIGIN - */
/** Hero distress-signal origin: rings expanding outward from a pulsing core. */
export function SignalOrigin() {
  return (
    <div className="vos-signal-origin" aria-hidden="true">
      <div className="vos-signal-wave" />
      <div className="vos-signal-wave vos-signal-wave--2" />
      <div className="vos-signal-wave vos-signal-wave--3" />
      <div className="vos-signal-core" />
    </div>
  );
}

/* ------------------------------------------------------------- SCENE: SIGNAL - */
function SignalScene() {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Concept art: expanding signal rings from a source point"
    >
      <defs>
        <radialGradient id="sig-src-bg" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0" stopColor="#072a2c" />
          <stop offset="1" stopColor="#03141a" />
        </radialGradient>
        <radialGradient id="sig-core-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe9b0" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#f1c96f" stopOpacity="0.35" />
          <stop offset="1" stopColor="#f1c96f" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="300" fill="url(#sig-src-bg)" />

      <g transform="translate(200 150)">
        <circle className="vos-ping-ring" r="130" fill="none" stroke="#f1c96f" strokeOpacity="0.5" strokeWidth="1.5" />
        <circle className="vos-ping-ring vos-ping-ring--2" r="130" fill="none" stroke="#7fd4c6" strokeOpacity="0.45" strokeWidth="1.5" />
        <circle className="vos-ping-ring vos-ping-ring--3" r="130" fill="none" stroke="#ff9b82" strokeOpacity="0.35" strokeWidth="1.5" />
      </g>

      <circle cx="200" cy="150" r="42" fill="url(#sig-core-glow)" />
      <circle className="vos-distress-blink" cx="200" cy="150" r="6" fill="#fff6e0" />

      <path className="vos-dash-flow" d="M200 150 Q 120 60 40 90" stroke="#f1c96f" strokeWidth="1.75" strokeLinecap="round" fill="none" strokeOpacity="0.7" />
      <path className="vos-dash-flow" d="M200 150 Q 285 60 365 95" stroke="#f1c96f" strokeWidth="1.75" strokeLinecap="round" fill="none" strokeOpacity="0.7" style={{ animationDelay: "-1.5s" }} />
      <path className="vos-dash-flow" d="M200 150 Q 90 220 45 250" stroke="#7fd4c6" strokeWidth="1.75" strokeLinecap="round" fill="none" strokeOpacity="0.6" style={{ animationDelay: "-0.75s" }} />
      <path className="vos-dash-flow" d="M200 150 Q 310 225 358 252" stroke="#7fd4c6" strokeWidth="1.75" strokeLinecap="round" fill="none" strokeOpacity="0.6" style={{ animationDelay: "-2.25s" }} />

      <circle className="vos-node-twinkle" cx="40" cy="90" r="3.5" fill="#f1c96f" />
      <circle className="vos-node-twinkle vos-node-twinkle--2" cx="365" cy="95" r="3.5" fill="#f1c96f" />
      <circle className="vos-node-twinkle vos-node-twinkle--3" cx="45" cy="250" r="3" fill="#7fd4c6" />
      <circle className="vos-node-twinkle vos-node-twinkle--2" cx="358" cy="252" r="3" fill="#7fd4c6" />

      <g fill="#eaf6f4">
        <circle className="vos-node-twinkle vos-node-twinkle--3" cx="80" cy="40" r="1.2" opacity="0.7" />
        <circle className="vos-node-twinkle" cx="320" cy="40" r="1" opacity="0.6" />
        <circle className="vos-node-twinkle vos-node-twinkle--2" cx="150" cy="270" r="1.1" opacity="0.5" />
        <circle className="vos-node-twinkle" cx="270" cy="270" r="1" opacity="0.65" />
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------- SCENE: RADAR - */
function RadarScene() {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Concept art: radar sweep scanning for a signal"
    >
      <defs>
        <radialGradient id="radar-bg" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0" stopColor="#052225" />
          <stop offset="1" stopColor="#020e12" />
        </radialGradient>
        <linearGradient id="radar-beam-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7fd4c6" stopOpacity="0.5" />
          <stop offset="1" stopColor="#7fd4c6" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="400" height="300" fill="url(#radar-bg)" />

      <g fill="none" stroke="#7fd4c6" strokeOpacity="0.16" strokeWidth="1">
        <circle cx="200" cy="150" r="40" />
        <circle cx="200" cy="150" r="70" />
        <circle cx="200" cy="150" r="100" />
        <circle cx="200" cy="150" r="130" />
      </g>

      <g stroke="#7fd4c6" strokeOpacity="0.12" strokeWidth="1">
        <line x1="200" y1="20" x2="200" y2="280" />
        <line x1="70" y1="150" x2="330" y2="150" />
      </g>

      <g className="vos-radar-sweep">
        <path d="M200 150 L200 20 A130 130 0 0 1 292 33 Z" fill="url(#radar-beam-grad)" opacity="0.55" />
        <line x1="200" y1="150" x2="200" y2="20" stroke="#7fd4c6" strokeWidth="1.5" strokeOpacity="0.8" />
      </g>

      <circle className="vos-node-twinkle" cx="250" cy="90" r="4" fill="#f1c96f" />
      <circle className="vos-node-twinkle vos-node-twinkle--2" cx="140" cy="190" r="3.5" fill="#f1c96f" />
      <circle className="vos-node-twinkle vos-node-twinkle--3" cx="285" cy="200" r="3" fill="#ff9b82" />
      <circle className="vos-node-twinkle" cx="110" cy="105" r="3" fill="#7fd4c6" />

      <circle cx="200" cy="150" r="5" fill="#7fd4c6" />
      <circle cx="200" cy="150" r="10" fill="none" stroke="#7fd4c6" strokeWidth="1.5" strokeOpacity="0.6" />

      <circle className="vos-dash-flow" cx="200" cy="150" r="130" fill="none" stroke="#7fd4c6" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 9" />
    </svg>
  );
}

/* ------------------------------------------------------ SCENE: INTERFERENCE - */
function InterferenceScene() {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Concept art: two wave sources meeting as one connection"
    >
      <defs>
        <radialGradient id="wave-src-bg" cx="0.5" cy="0.55" r="0.75">
          <stop offset="0" stopColor="#072022" />
          <stop offset="1" stopColor="#020c10" />
        </radialGradient>
        <radialGradient id="interf-node-a" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe9b0" stopOpacity="0.9" />
          <stop offset="1" stopColor="#f1c96f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="interf-node-b" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#a5e6dc" stopOpacity="0.9" />
          <stop offset="1" stopColor="#4fb9a6" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="300" fill="url(#wave-src-bg)" />

      <g fill="none" stroke="#f1c96f" strokeWidth="1.5" strokeOpacity="0.4">
        <path className="vos-wave-curve" d="M110 150 Q 160 60 200 150 T 290 150" />
        <path className="vos-wave-curve" d="M110 150 Q 160 100 200 150 T 290 150" strokeOpacity="0.28" />
        <path className="vos-wave-curve" d="M110 150 Q 160 200 200 150 T 290 150" strokeOpacity="0.22" />
      </g>

      <g fill="none" stroke="#7fd4c6" strokeWidth="1.5" strokeOpacity="0.4">
        <path className="vos-wave-curve vos-wave-curve--b" d="M290 150 Q 240 60 200 150 T 110 150" />
        <path className="vos-wave-curve vos-wave-curve--b" d="M290 150 Q 240 100 200 150 T 110 150" strokeOpacity="0.28" />
        <path className="vos-wave-curve vos-wave-curve--b" d="M290 150 Q 240 200 200 150 T 110 150" strokeOpacity="0.22" />
      </g>

      <circle cx="110" cy="150" r="30" fill="url(#interf-node-a)" />
      <circle cx="110" cy="150" r="5" fill="#fff6e0" />
      <circle cx="290" cy="150" r="30" fill="url(#interf-node-b)" />
      <circle cx="290" cy="150" r="5" fill="#eaf6f4" />

      <circle className="vos-distress-blink" cx="200" cy="150" r="16" fill="none" stroke="#ffe9b0" strokeWidth="1.5" strokeOpacity="0.8" />
      <circle className="vos-distress-blink" cx="200" cy="150" r="4" fill="#fff6e0" style={{ animationDelay: "-0.8s" }} />

      <g stroke="#eaf6f4" strokeOpacity="0.05" strokeWidth="1">
        <line x1="40" y1="0" x2="40" y2="300" />
        <line x1="80" y1="0" x2="80" y2="300" />
        <line x1="120" y1="0" x2="120" y2="300" />
        <line x1="160" y1="0" x2="160" y2="300" />
        <line x1="240" y1="0" x2="240" y2="300" />
        <line x1="280" y1="0" x2="280" y2="300" />
        <line x1="320" y1="0" x2="320" y2="300" />
        <line x1="360" y1="0" x2="360" y2="300" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ STRIP - */
export function ConceptArtStrip() {
  return (
    <div className="vos-scene-grid">
      <article className="vos-scene vos-scene--signal">
        <div className="vos-scene__art" aria-hidden="true"><SignalScene /></div>
        <div className="vos-scene__body">
          <span className="vos-scene__tag">Concept 01</span>
          <h3 className="vos-scene__title">The Signal</h3>
          <p className="vos-scene__note">A pulse that travels farther than voice. Rings expand until someone hears them.</p>
        </div>
      </article>

      <article className="vos-scene vos-scene--radar">
        <div className="vos-scene__art" aria-hidden="true"><RadarScene /></div>
        <div className="vos-scene__body">
          <span className="vos-scene__tag">Concept 02</span>
          <h3 className="vos-scene__title">The Sweep</h3>
          <p className="vos-scene__note">Someone is always scanning. Your signal is found, not lost in the noise.</p>
        </div>
      </article>

      <article className="vos-scene vos-scene--interference">
        <div className="vos-scene__art" aria-hidden="true"><InterferenceScene /></div>
        <div className="vos-scene__body">
          <span className="vos-scene__tag">Concept 03</span>
          <h3 className="vos-scene__title">The Meeting</h3>
          <p className="vos-scene__note">Two waves find one point. That is all a connection is — interrupted silence.</p>
        </div>
      </article>
    </div>
  );
}
