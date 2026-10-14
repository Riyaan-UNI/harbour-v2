/**
 * ChatTideWave — the frame's base line for the chat page.
 *
 * One long, low-amplitude wave with a soft glow copy behind it, echoing the
 * landing page's WaveLine. It sits along the bottom of the chat frame so the
 * conversation reads as sitting on a harbour rather than floating in a void.
 *
 * The group drifts a couple of percent horizontally and the glow copy breathes
 * its opacity. Transform/opacity only. Reduced motion holds the rest frame:
 * no drift, a fixed glow opacity.
 *
 * Gradient ids are namespaced to this component. All decoration is aria-hidden.
 */
export function ChatTideWave(): JSX.Element {
  /* A 13-point sine-ish line. The viewBox is shallow (1200 x 40) so the wave
     reads as a line rather than a filled band at any band height it is given. */
  const wave =
    'M0 22 C60 10 120 10 180 22 C240 34 300 34 360 22 ' +
    'C420 10 480 10 540 22 C600 34 660 34 720 22 ' +
    'C780 10 840 10 900 22 C960 34 1020 34 1080 22 ' +
    'C1140 10 1180 12 1200 18';

  return (
    <div className="chat-tide" aria-hidden="true">
      <svg
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        className="chat-tide__svg"
      >
        <defs>
          <linearGradient
            id="chat-tide-grad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              stopColor="var(--chart-3)"
              stopOpacity="0.5"
            />
            <stop
              offset="55%"
              stopColor="var(--arrival-action)"
              stopOpacity="0.6"
            />
            <stop
              offset="100%"
              stopColor="var(--arrival-highlight)"
              stopOpacity="0.45"
            />
          </linearGradient>
        </defs>

        <g className="chat-tide__drift">
          {/* Soft glow copy behind the crisp line */}
          <path
            className="chat-tide__glow"
            d={wave}
            fill="none"
            stroke="url(#chat-tide-grad)"
            strokeWidth="0.375rem"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity="0.35"
          />
          <path
            className="chat-tide__line"
            d={wave}
            fill="none"
            stroke="url(#chat-tide-grad)"
            strokeWidth="0.125rem"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>
    </div>
  );
}
