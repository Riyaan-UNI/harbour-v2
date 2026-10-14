import { type CSSProperties } from 'react';
import { Mascot, type MascotKind } from '../ui';
import { publicUrl } from '../../lib/public-url';

/**
 * DashboardScene — the ambient backdrop behind `/app/dashboard`.
 *
 * Mirrors `PeopleScene` (itself a mirror of the AppHome scene): a harbour
 * concept-art wash at low opacity, a glass tint over it, and a few floating
 * elements above — mounted at `z-index: -1` inside the page's isolated stacking
 * context, so it can never escape the page or intercept a pointer.
 *
 * The element set is deliberately different from `PeopleScene`'s four mascots
 * (`octopus`, `jellyfish`, `turtle`, `starfish`): three mascots this page does
 * not share, plus three hand-drawn abstract shapes (a buoy, concentric rings,
 * a wave line) so the layer reads as Harbour's own artwork rather than a
 * repeated stock arrangement.
 *
 * Every element is pure decoration — `aria-hidden`, no focus, no pointer
 * events — and each carries its own `--chart-N` tint, so no two share a colour
 * and the layer re-themes with dark and light. Motion is transform-only, lives
 * in the stylesheet's single `no-preference` block, and is additionally parked
 * by the shell's calm mode, so reduced motion renders a still frame with
 * identical content and zero movement (docs/DASHBOARD_DESIGN_SPEC.md §6.4).
 */

type MascotDrifter = {
  /** Which creature to render. */
  kind: MascotKind;
  /** BEM-ish placement modifier → a fixed inset in the stylesheet. */
  spot: 'a' | 'b' | 'c';
  /** A tint token so no two drifters share a colour. */
  accent: string;
};

type ShapeDrifter = {
  /** Which abstract shape to draw. */
  shape: 'buoy' | 'rings' | 'wave';
  spot: 'd' | 'e' | 'f';
  accent: string;
};

const MASCOTS: readonly MascotDrifter[] = [
  { kind: 'seahorse', spot: 'a', accent: 'var(--chart-2)' },
  { kind: 'crab', spot: 'b', accent: 'var(--chart-4)' },
  { kind: 'pufferfish', spot: 'c', accent: 'var(--chart-5)' },
];

const SHAPES: readonly ShapeDrifter[] = [
  { shape: 'buoy', spot: 'd', accent: 'var(--chart-3)' },
  { shape: 'rings', spot: 'e', accent: 'var(--chart-1)' },
  { shape: 'wave', spot: 'f', accent: 'var(--chart-5)' },
];

/**
 * The abstract shapes — hand-drawn inline SVG in the `ChatToroid` /
 * `ScamXrayScene` family. `currentColor` throughout, so the drifter's
 * `--drift-accent` colours both stroke and fill with no second value, and a
 * single SVG per shape means there is no gradient id to collide.
 */
function Shape({ shape }: { shape: ShapeDrifter['shape'] }): JSX.Element {
  if (shape === 'buoy') {
    return (
      <svg viewBox="0 0 64 64" className="dash-drift__shapes" focusable="false">
        {/* Body, waterline band, mast and lamp. */}
        <circle
          cx="32"
          cy="36"
          r="17"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M17 36h30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M26 20h12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M32 20v-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="32" cy="9" r="3" fill="currentColor" />
      </svg>
    );
  }

  if (shape === 'rings') {
    return (
      <svg viewBox="0 0 64 64" className="dash-drift__shapes" focusable="false">
        {/* Concentric ripple rings, like a dropped pebble. */}
        <circle
          cx="32"
          cy="32"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle
          cx="32"
          cy="32"
          r="17"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          opacity="0.7"
        />
        <circle
          cx="32"
          cy="32"
          r="26"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.4"
        />
        <circle cx="32" cy="32" r="2.5" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 96 64" className="dash-drift__shapes" focusable="false">
      {/* A long swell — the Harbour wave, stretched wide. */}
      <path
        d="M4 44q14-14 28 0t28 0t28 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M4 28q14-10 28 0t28 0t28 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export function DashboardScene(): JSX.Element {
  return (
    <div className="dash-scene" aria-hidden="true">
      <img className="dash-scene__wash" src={publicUrl('/art/harbour-scene-1.svg')} alt="" />
      <div className="dash-scene__tint" />

      {MASCOTS.map((drifter) => (
        <span
          key={drifter.spot}
          className={`dash-drift dash-drift--${drifter.spot}`}
          style={{ '--drift-accent': drifter.accent } as CSSProperties}
        >
          <Mascot kind={drifter.kind} className="dash-drift__body" />
        </span>
      ))}

      {SHAPES.map((drifter) => (
        <span
          key={drifter.spot}
          className={`dash-drift dash-drift--${drifter.spot}`}
          style={{ '--drift-accent': drifter.accent } as CSSProperties}
        >
          <Shape shape={drifter.shape} />
        </span>
      ))}
    </div>
  );
}
