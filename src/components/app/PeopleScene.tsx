import { Mascot, type MascotKind } from '../ui';

/**
 * PeopleScene — the "calm & alive" backdrop behind `/app/people`.
 *
 * Mirrors the AppHome scene: a harbour concept-art SVG at low opacity with a
 * glass tint over it, mounted at `z-index: -1` inside the page's isolated
 * stacking context so it can never escape or intercept a pointer.
 *
 * On top of the scene a few companions drift — the mascots of people who are
 * on this page, at low opacity, so the directory feels inhabited rather than
 * empty. They are pure decoration: `aria-hidden`, no focus, no pointer
 * events, and contained by the scene's `overflow: hidden`, so they can never
 * add a scrollbar. All motion is transform-only and stops entirely under
 * `prefers-reduced-motion` (the drift is inside a `no-preference` block and
 * the scene itself is a static framing either way).
 */

type Drifter = {
  kind: MascotKind;
  /** BEM-ish placement modifier → a fixed corner/inset in the stylesheet. */
  spot: 'a' | 'b' | 'c' | 'd';
  /** A tint token so no two drifters share a colour. */
  accent: string;
};

const DRIFTERS: readonly Drifter[] = [
  { kind: 'octopus', spot: 'a', accent: 'var(--chart-3)' },
  { kind: 'jellyfish', spot: 'b', accent: 'var(--chart-5)' },
  { kind: 'turtle', spot: 'c', accent: 'var(--chart-2)' },
  { kind: 'starfish', spot: 'd', accent: 'var(--chart-4)' },
];

export function PeopleScene(): JSX.Element {
  return (
    <div className="app-people__scene" aria-hidden="true">
      <img src="/art/harbour-scene-1.svg" alt="" />
      <div className="app-people__scene-tint" />
      {DRIFTERS.map((drifter) => (
        <span
          key={drifter.spot}
          className={`app-people-drifter app-people-drifter--${drifter.spot}`}
          style={{ color: drifter.accent }}
        >
          <Mascot kind={drifter.kind} className="app-people-drifter__body" />
        </span>
      ))}
    </div>
  );
}
