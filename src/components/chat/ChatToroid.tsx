/**
 * ChatToroid — the empty-state concept art for the chat page.
 *
 * A composed SVG scene in the FeatureConceptArt family: a toroid (concentric
 * ellipse strokes with a tube effect) as the harbour beacon, concentric ripple
 * rings behind it, a ground line, and glow dots. Pure SVG, no WebGL.
 *
 * The gradient ids are hard-scoped to this component (`chat-toroid-grad`)
 * because this SVG is never rendered alongside another that shares the page.
 * All decoration is aria-hidden.
 */
export function ChatToroid(): JSX.Element {
  return (
    <div className="chat-toroid" aria-hidden="true">
      <svg viewBox="0 0 320 200" className="chat-toroid__svg">
        <defs>
          <linearGradient
            id="chat-toroid-grad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor="var(--arrival-action)"
              stopOpacity="0.45"
            />
            <stop
              offset="50%"
              stopColor="var(--chart-3)"
              stopOpacity="0.25"
            />
            <stop
              offset="100%"
              stopColor="var(--arrival-highlight)"
              stopOpacity="0.35"
            />
          </linearGradient>
        </defs>

        {/* Ground line */}
        <path
          className="chat-toroid__ground"
          d="M20 170 Q160 150 300 170"
          fill="none"
          stroke="var(--arrival-art-frame)"
          strokeWidth="0.125rem"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Ripple rings */}
        <ellipse
          className="chat-toroid__ripple"
          cx="160"
          cy="145"
          rx="110"
          ry="18"
          fill="none"
          stroke="var(--arrival-action)"
          strokeWidth="0.0625rem"
          vectorEffect="non-scaling-stroke"
          opacity="0.2"
        />
        <ellipse
          className="chat-toroid__ripple"
          cx="160"
          cy="145"
          rx="85"
          ry="14"
          fill="none"
          stroke="var(--chart-3)"
          strokeWidth="0.0625rem"
          vectorEffect="non-scaling-stroke"
          opacity="0.15"
        />

        {/* Toroid — outer body */}
        <ellipse
          className="chat-toroid__body"
          cx="160"
          cy="100"
          rx="65"
          ry="32"
          fill="none"
          stroke="url(#chat-toroid-grad)"
          strokeWidth="0.1875rem"
          vectorEffect="non-scaling-stroke"
        />

        {/* Toroid — inner tube */}
        <ellipse
          className="chat-toroid__tube"
          cx="160"
          cy="100"
          rx="48"
          ry="22"
          fill="none"
          stroke="var(--arrival-action)"
          strokeWidth="0.125rem"
          vectorEffect="non-scaling-stroke"
          opacity="0.35"
        />

        {/* Toroid — highlight ring */}
        <ellipse
          className="chat-toroid__ring"
          cx="160"
          cy="100"
          rx="32"
          ry="14"
          fill="none"
          stroke="var(--arrival-highlight)"
          strokeWidth="0.0625rem"
          vectorEffect="non-scaling-stroke"
          opacity="0.5"
        />

        {/* Glow dots */}
        <circle
          className="chat-toroid__dot"
          cx="125"
          cy="78"
          r="4"
          fill="var(--arrival-highlight)"
          opacity="0.6"
        />
        <circle
          className="chat-toroid__dot"
          cx="195"
          cy="82"
          r="3"
          fill="var(--arrival-action)"
          opacity="0.5"
        />
        <circle
          className="chat-toroid__dot"
          cx="170"
          cy="68"
          r="2.5"
          fill="var(--chart-3)"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
