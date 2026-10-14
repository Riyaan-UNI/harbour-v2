/**
 * ChatConstellation — the empty-state centrepiece for the chat page.
 *
 * A field of harbour lights: hand-placed dots joined by faint hairlines, three
 * of them carrying a warm halo, over a shallow horizon arc. It stands in for
 * "you are not the first to arrive" and gives the empty state something to
 * look at besides suggestions.
 *
 * Dots pulse their opacity on staggered delays and the whole field drifts a
 * couple of units vertically. Both are transform/opacity only (the drift is a
 * transform, not a stroke-dashoffset paint). Under reduced motion the field
 * holds its rest frame: every dot at 0.8 opacity, no drift.
 *
 * Gradient ids are namespaced to this component. All decoration is aria-hidden.
 */
export function ChatConstellation(): JSX.Element {
  /* dot: x, y, r, tone ("warm" | "cool"). Order matters only for the stagger. */
  const dots: Array<[number, number, number, 'warm' | 'cool']> = [
    [52, 96, 3.2, 'warm'],
    [96, 62, 2.1, 'cool'],
    [128, 108, 1.8, 'cool'],
    [166, 74, 3.4, 'warm'],
    [198, 116, 2.0, 'cool'],
    [232, 58, 1.9, 'cool'],
    [262, 100, 3.0, 'warm'],
    [296, 70, 2.2, 'cool'],
    [318, 118, 1.7, 'cool'],
    [84, 140, 1.9, 'cool'],
    [214, 146, 1.8, 'cool'],
    [278, 148, 2.0, 'cool'],
  ];

  /* lines: index pairs into `dots`, so the mesh follows the dots if they move. */
  const lines: Array<[number, number]> = [
    [0, 1],
    [1, 3],
    [3, 4],
    [4, 6],
    [6, 7],
    [3, 5],
    [5, 7],
    [0, 9],
    [4, 10],
    [6, 11],
  ];

  return (
    <div className="chat-constellation" aria-hidden="true">
      <svg viewBox="0 0 360 220" className="chat-constellation__svg">
        <defs>
          <linearGradient
            id="chat-constellation-dots"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="var(--chart-1)" />
            <stop offset="60%" stopColor="var(--chart-2)" />
            <stop offset="100%" stopColor="var(--arrival-highlight)" />
          </linearGradient>
          <linearGradient
            id="chat-constellation-lines"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              stopColor="var(--arrival-action)"
              stopOpacity="0.6"
            />
            <stop
              offset="100%"
              stopColor="var(--chart-3)"
              stopOpacity="0.35"
            />
          </linearGradient>
        </defs>

        <g className="chat-constellation__field">
          {/* The mesh */}
          <g
            stroke="url(#chat-constellation-lines)"
            strokeWidth="0.0625rem"
            vectorEffect="non-scaling-stroke"
            opacity="0.18"
          >
            {lines.map(([a, b]) => {
              const from = dots[a];
              const to = dots[b];
              if (!from || !to) return null;
              return (
                <line
                  key={`${a}-${b}`}
                  x1={from[0]}
                  y1={from[1]}
                  x2={to[0]}
                  y2={to[1]}
                />
              );
            })}
          </g>

          {/* Warm halos behind the three anchor lights */}
          {dots
            .filter(([, , , tone]) => tone === 'warm')
            .map(([x, y, r]) => (
              <circle
                key={`halo-${x}-${y}`}
                cx={x}
                cy={y}
                r={r * 3}
                fill="var(--arrival-highlight)"
                opacity="0.12"
              />
            ))}

          {/* The lights */}
          {dots.map(([x, y, r, tone], index) => (
            <circle
              key={`dot-${x}-${y}`}
              className="chat-constellation__dot"
              style={{ animationDelay: `${index * -0.4}s` }}
              cx={x}
              cy={y}
              r={r}
              fill={
                tone === 'warm'
                  ? 'var(--arrival-highlight)'
                  : 'url(#chat-constellation-dots)'
              }
            />
          ))}

          {/* Horizon arc */}
          <path
            d="M20 186 Q180 150 340 186"
            fill="none"
            stroke="var(--arrival-art-frame)"
            strokeWidth="0.125rem"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>
    </div>
  );
}
