// `gsap/CustomEase` ships a default export only — importing it as a named
// binding yields `undefined`, and because `CustomEase.create` runs at module
// scope that takes the whole bundle down rather than one component.
import CustomEase from 'gsap/CustomEase';
import { gsap } from 'gsap';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '../../lib/cn';
import { THEME_CHANGE_EVENT } from '../../theme/theme';

/**
 * WaveLine — Scene A, the hero variant. Spec §7.
 *
 * One SVG with a viewBox that matches its rendered size, `preserveAspectRatio:
 * none`, so it stretches to whatever box it is given. The stroke is 0.125rem with
 * `vector-effect: non-scaling-stroke`, so the line stays 2px however far the
 * viewBox is stretched — which is the whole reason for that attribute.
 *
 * The path is generated from measured dimensions. `pointCount` is one point per
 * ~12 rendered pixels, and `amplitudeBase` is 15.5 % of rendered height, so the
 * calm state looks consistent across viewport widths. Brick 3b added the
 * ResizeObserver and debounce that make this true.
 *
 * `y` is a base line plus the amplitude `A` times a sum of three sine waves
 * plus a little noise, and **`A` is the only animated value** — nothing else
 * about the path moves. The hero variant runs the settle once, when the parent
 * timeline reaches it, and never loops.
 *
 * Three things the component takes care of beyond the tween:
 *
 *   - **The ticker stops.** It is added to GSAP's ticker while the line is on
 *     screen and the tab is visible, and removed when either is false, so a
 *     scrolled-away hero costs nothing. `data-paused` says which state it is in.
 *   - **The colours are read from the tokens**, not baked in, and re-read on
 *     `harbour:themechange`, so the gradient follows the theme with the rest of
 *     the page.
 *   - **Reduced motion renders the calm state** (`A = 0.06`) with no tween at
 *     all, rather than a fast one.
 *
 * The easing is the spec's `cubic-bezier(0.22, 1, 0.36, 1)`, built with
 * CustomEase. GSAP ships every plugin free since 3.13, so the spec's own curve
 * is used rather than the nearest built-in.
 */

gsap.registerPlugin(CustomEase);

/** The spec's ease-out, as an SVG cubic path. */
const EASE_OUT = CustomEase.create('harbour-ease-out', 'M0,0 C0.22,1 0.36,1 1,1');

const CHAOTIC = 1;
const SETTLED = 0.06;
const SETTLE_SECONDS = 1.2;

/** One point every ~12 rendered pixels. */
const POINT_SPACING_PX = 12;
/** Amplitude at `A = 1` is 15.5 % of rendered height. */
const AMPLITUDE_RATIO = 0.155;
/** Minimum point count so the wave never looks coarse. */
const MIN_POINTS = 48;
/** Noise array is oversized so it never repeats within a single path. */
const NOISE_SIZE = 512;

/**
 * A fixed pseudo-random offset per point, so the noise is deterministic: the
 * first paint and every later frame agree, and a test can compare paths.
 */
const NOISE: readonly number[] = (() => {
  const values: number[] = [];
  let seed = 0x2f6e2b1;
  for (let index = 0; index < NOISE_SIZE; index += 1) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    values.push((seed / 4294967296) * 2 - 1);
  }
  return values;
})();

/** Three sine waves plus a little noise, normalised to roughly -1..1. */
function waveAt(index: number, pointCount: number): number {
  const t = index / (pointCount - 1);
  const sum =
    Math.sin(t * Math.PI * 2 * 1.7 + 0.4) +
    0.55 * Math.sin(t * Math.PI * 2 * 3.1 + 1.9) +
    0.3 * Math.sin(t * Math.PI * 2 * 5.3 + 3.2) +
    0.35 * (NOISE[index % NOISE.length] ?? 0);
  return sum / 1.9;
}

/** The whole path at one amplitude. `A` is the only thing that changes. */
function pathAt(
  amplitude: number,
  dims: { width: number; height: number; pointCount: number },
): string {
  const { width, height, pointCount } = dims;
  const amplitudeBase = height * AMPLITUDE_RATIO;
  const baseY = height / 2;
  const parts: string[] = [];
  for (let index = 0; index < pointCount; index += 1) {
    const x = (index / (pointCount - 1)) * width;
    const y = baseY + amplitude * amplitudeBase * waveAt(index, pointCount);
    parts.push(`${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return parts.join(' ');
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export type WaveLineHandle = {
  /** Triggers the settle animation. Idempotent. */
  settle: () => void;
};

export type WaveLineProps = {
  className?: string;
};

export const WaveLine = forwardRef<WaveLineHandle, WaveLineProps>(
  function WaveLine({ className }, forwardedRef): JSX.Element {
    const svgRef = useRef<SVGSVGElement>(null);
    const crispRef = useRef<SVGPathElement>(null);
    const glowRef = useRef<SVGPathElement>(null);

    // `useId` returns a value with colons in it, which is not usable inside a
    // `url(#…)` reference. Strip them.
    const gradientId = `wave-${useId().replace(/:/g, '')}`;

    const [dims, setDims] = useState({
      width: 1200,
      height: 400,
      pointCount: 96,
    });
    const [reduceMotion, setReduceMotion] = useState(
      () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    );
    const [paused, setPaused] = useState(false);
    const [colours, setColours] = useState({ from: '', to: '' });

    const amplitude = useRef(reduceMotion ? SETTLED : CHAOTIC);
    const drawn = useRef(-1);
    const settled = useRef(false);
    const resizeTimer = useRef<number | null>(null);

    // The first paint uses the same path the ticker would draw, so there is no
    // frame of empty SVG. React never rewrites `d` afterwards — the value below
    // never changes between renders — so the imperative updates survive.
    const initialPath = useMemo(
      () => pathAt(reduceMotion ? SETTLED : CHAOTIC, dims),
      [reduceMotion, dims],
    );

    /** Repaints from the current amplitude, and skips frames where it has not moved. */
    const draw = useCallback(() => {
      const crisp = crispRef.current;
      const glow = glowRef.current;
      if (!crisp || !glow) return;

      const value = amplitude.current;
      if (value === drawn.current) return;
      drawn.current = value;

      const d = pathAt(value, dims);
      crisp.setAttribute('d', d);
      glow.setAttribute('d', d);
      svgRef.current?.setAttribute('data-amplitude', value.toFixed(3));
      svgRef.current?.setAttribute('data-points', String(dims.pointCount));
    }, [dims]);

    /** The settle. Runs once, on the first call. */
    const settle = useCallback(() => {
      if (settled.current) return;
      settled.current = true;

      if (reduceMotion) {
        amplitude.current = SETTLED;
        drawn.current = -1;
        draw();
        return;
      }

      gsap.to(amplitude, {
        current: SETTLED,
        duration: SETTLE_SECONDS,
        ease: EASE_OUT,
        onUpdate: draw,
        onComplete: draw,
      });
    }, [draw, reduceMotion]);

    useImperativeHandle(
      forwardedRef,
      () => ({
        settle,
      }),
      [settle],
    );

    // Brick 3b: measure the rendered box and derive geometry from it.
    useEffect(() => {
      const svg = svgRef.current;
      if (!svg) return;

      const observer = new ResizeObserver((entries) => {
        const rect = entries[0]?.contentRect;
        if (!rect) return;

        if (resizeTimer.current) window.clearTimeout(resizeTimer.current);
        resizeTimer.current = window.setTimeout(() => {
          const width = Math.max(1, Math.round(rect.width));
          const height = Math.max(1, Math.round(rect.height));
          const pointCount = Math.max(MIN_POINTS, Math.ceil(width / POINT_SPACING_PX));
          setDims({ width, height, pointCount });
        }, 100);
      });

      observer.observe(svg);
      return () => {
        observer.disconnect();
        if (resizeTimer.current) window.clearTimeout(resizeTimer.current);
      };
    }, []);

    // Colours from the tokens, re-read whenever the theme changes.
    useEffect(() => {
      const read = (): void => {
        const styles = getComputedStyle(document.documentElement);
        setColours({
          from: styles.getPropertyValue('--accent-text').trim(),
          to: styles.getPropertyValue('--gold-text').trim(),
        });
      };

      read();
      window.addEventListener(THEME_CHANGE_EVENT, read);
      return () => {
        window.removeEventListener(THEME_CHANGE_EVENT, read);
      };
    }, []);

    // Track the OS preference, so turning reduced motion on mid-session lands on
    // the calm state rather than leaving a half-finished tween.
    useEffect(() => {
      const query = window.matchMedia(REDUCED_MOTION_QUERY);
      const update = (): void => {
        setReduceMotion(query.matches);
      };
      query.addEventListener('change', update);
      return () => {
        query.removeEventListener('change', update);
      };
    }, []);

    useEffect(() => {
      if (!reduceMotion) return;
      amplitude.current = SETTLED;
      drawn.current = -1;
      draw();
    }, [reduceMotion, draw]);

    // Offscreen or hidden: stop the ticker and mark the state.
    // Brick 3b: the settle is no longer triggered here; it is called by the
    // parent timeline instead.
    useEffect(() => {
      const svg = svgRef.current;
      if (!svg) return;

      let offscreen = false;
      let hidden = document.visibilityState === 'hidden';

      const update = (): void => {
        setPaused(offscreen || hidden);
      };

      const observer = new IntersectionObserver(
        (entries) => {
          offscreen = !(entries[0]?.isIntersecting ?? false);
          update();
        },
        { threshold: 0.01 },
      );
      observer.observe(svg);

      const onVisibilityChange = (): void => {
        hidden = document.visibilityState === 'hidden';
        update();
      };
      document.addEventListener('visibilitychange', onVisibilityChange);
      update();

      return () => {
        observer.disconnect();
        document.removeEventListener('visibilitychange', onVisibilityChange);
      };
    }, []);

    // The ticker. Removed entirely while paused, which is what "pause the ticker
    // when offscreen" means for a ticker shared with the rest of the page.
    useEffect(() => {
      if (paused) return undefined;
      gsap.ticker.add(draw);
      return () => {
        gsap.ticker.remove(draw);
      };
    }, [paused, draw]);

    // A final paint once the refs exist, and whenever dimensions change.
    useEffect(() => {
      drawn.current = -1;
      draw();
    }, [draw]);

    return (
      <svg
        ref={svgRef}
        className={cn('wave-line', className)}
        viewBox={`0 0 ${dims.width} ${dims.height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
        data-paused={paused ? 'true' : 'false'}
        data-reduced-motion={reduceMotion ? 'true' : 'false'}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={colours.from} />
            <stop offset="100%" stopColor={colours.to} />
          </linearGradient>
        </defs>

        {/* The soft glow copy, behind the crisp line. */}
        <path
          ref={glowRef}
          className="wave-line__glow"
          d={initialPath}
          stroke={`url(#${gradientId})`}
          vectorEffect="non-scaling-stroke"
        />
        <path
          ref={crispRef}
          className="wave-line__line"
          d={initialPath}
          stroke={`url(#${gradientId})`}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  },
);
