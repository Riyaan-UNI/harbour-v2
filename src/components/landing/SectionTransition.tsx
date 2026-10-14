type TransitionScene = 'arrival' | 'safety' | 'words' | 'community';

const SCENES: readonly TransitionScene[] = [
  'arrival', 'safety', 'words', 'community', 'safety', 'words', 'arrival', 'community',
];

/** A small illustrated tide-line between chapters; decorative and non-blocking. */
export function SectionTransition({ index }: { index: number }): JSX.Element {
  const scene = SCENES[index % SCENES.length] ?? 'arrival';
  return (
    <div className={`section-transition section-transition--${scene}`} aria-hidden="true">
      <svg className="section-transition__art" viewBox="0 0 720 112" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path className="section-transition__tide" d="M12 76C104 20 165 104 260 62C350 22 407 92 492 60C575 28 632 71 708 38" />
        {scene === 'arrival' && <g className="section-transition__motif section-transition__motif--one">
          <path d="M135 19c-14 0-25 11-25 25 0 18 25 42 25 42s25-24 25-42c0-14-11-25-25-25Z" />
          <circle cx="135" cy="44" r="8" />
          <path d="M98 93h74m-61-8 12-12m25 12 13-13" />
        </g>}
        {scene === 'safety' && <g className="section-transition__motif section-transition__motif--one">
          <path d="m135 18 29 11v22c0 19-12 33-29 42-17-9-29-23-29-42V29l29-11Z" />
          <path d="m121 51 10 10 20-22" />
        </g>}
        {scene === 'words' && <g className="section-transition__motif section-transition__motif--one">
          <path d="M108 26h54a17 17 0 0 1 17 17v17a17 17 0 0 1-17 17h-25l-18 14V77a17 17 0 0 1-11-16V43a17 17 0 0 1 17-17Z" />
          <path d="M124 47h31m-31 10h20" />
        </g>}
        {scene === 'community' && <g className="section-transition__motif section-transition__motif--one">
          <circle cx="124" cy="37" r="13" />
          <circle cx="153" cy="37" r="13" />
          <path d="M98 83c1-19 10-29 26-29s25 10 26 29m-4-17c3-8 9-12 18-12 14 0 22 10 23 29" />
          <path d="m138 15 4-8 4 8 8 4-8 4-4 8-4-8-8-4 8-4Z" />
        </g>}
        <g className="section-transition__motif section-transition__motif--two">
          <circle cx="366" cy="50" r="26" />
          <path d="M354 50h24m-12-12v24" />
          <path d="M333 86c11-8 22-8 33 0s22 8 33 0" />
        </g>
        <g className="section-transition__motif section-transition__motif--three">
          <path d="M566 30h38a15 15 0 0 1 15 15v15a15 15 0 0 1-15 15h-17l-15 12v-12a15 15 0 0 1-14-15V45a15 15 0 0 1 8-13Z" />
          <path d="M566 50h29m-29 9h19" />
        </g>
      </svg>
      <span className="section-transition__glow section-transition__glow--one" />
      <span className="section-transition__glow section-transition__glow--two" />
    </div>
  );
}
