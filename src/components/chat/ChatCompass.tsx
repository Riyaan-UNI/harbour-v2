/**
 * ChatCompass — the header identity mark for the chat page.
 *
 * A harbour compass: an outer ring with four cardinal ticks, a two-tone
 * needle (warm north, cool south) and a centre pin. It reads as "a guide who
 * knows the way", which is what the chat page is for.
 *
 * The needle rocks through a few degrees on a slow alternate; the ring's
 * opacity breathes once per cycle. Both are transform/opacity only, and the
 * reduced-motion rest frame is the needle at 0deg with a fully opaque ring.
 *
 * Gradient ids are namespaced to this component. All decoration is aria-hidden.
 */
export function ChatCompass(): JSX.Element {
  return (
    <div className="chat-compass" aria-hidden="true">
      <svg viewBox="0 0 48 48" className="chat-compass__svg">
        <defs>
          <linearGradient
            id="chat-compass-grad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor="var(--arrival-action)"
              stopOpacity="0.9"
            />
            <stop
              offset="100%"
              stopColor="var(--chart-3)"
              stopOpacity="0.6"
            />
          </linearGradient>
        </defs>

        {/* Outer ring */}
        <circle
          className="chat-compass__ring"
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="url(#chat-compass-grad)"
          strokeWidth="0.125rem"
          vectorEffect="non-scaling-stroke"
        />

        {/* Cardinal ticks */}
        <g
          className="chat-compass__ticks"
          stroke="var(--arrival-action)"
          strokeWidth="0.125rem"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity="0.45"
        >
          <line x1="24" y1="4" x2="24" y2="9" />
          <line x1="24" y1="39" x2="24" y2="44" />
          <line x1="4" y1="24" x2="9" y2="24" />
          <line x1="39" y1="24" x2="44" y2="24" />
        </g>

        {/* Needle */}
        <g className="chat-compass__needle">
          <path
            d="M24 11 L27 24 L21 24 Z"
            fill="var(--arrival-highlight)"
            opacity="0.9"
          />
          <path
            d="M24 37 L21 24 L27 24 Z"
            fill="var(--arrival-action)"
            opacity="0.7"
          />
        </g>

        {/* Centre pin */}
        <circle
          cx="24"
          cy="24"
          r="2"
          fill="var(--arrival-highlight)"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}
