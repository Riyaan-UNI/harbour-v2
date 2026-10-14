/**
 * ChatRingStack — the thinking-state art for the chat page.
 *
 * Three elliptical rings set at 0/60/120 degrees read as a gyroscope spinning
 * up while Harbour composes an answer. It sits behind `ChatBeacon`, which
 * stays the honest pulsing core; this piece adds the depth around it.
 *
 * The rings rotate (outer and middle in opposite directions, the inner one
 * rocking) and the whole stack breathes its opacity. Transform/opacity only.
 * Reduced motion holds the rest frame: rings at their rest angles, one flat
 * opacity.
 *
 * Gradient ids are namespaced to this component. All decoration is aria-hidden.
 */
export function ChatRingStack(): JSX.Element {
  return (
    <div className="chat-ring-stack" aria-hidden="true">
      <svg viewBox="0 0 120 120" className="chat-ring-stack__svg">
        <defs>
          <linearGradient
            id="chat-ringstack-grad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor="var(--arrival-action)"
              stopOpacity="0.7"
            />
            <stop
              offset="100%"
              stopColor="var(--arrival-highlight)"
              stopOpacity="0.4"
            />
          </linearGradient>
        </defs>

        <g className="chat-ring-stack__rings">
          <ellipse
            className="chat-ring-stack__ring chat-ring-stack__ring--outer"
            cx="60"
            cy="60"
            rx="46"
            ry="17"
            fill="none"
            stroke="url(#chat-ringstack-grad)"
            strokeWidth="0.125rem"
            vectorEffect="non-scaling-stroke"
          />
          <ellipse
            className="chat-ring-stack__ring chat-ring-stack__ring--middle"
            cx="60"
            cy="60"
            rx="36"
            ry="14"
            fill="none"
            stroke="var(--arrival-action)"
            strokeWidth="0.125rem"
            vectorEffect="non-scaling-stroke"
            opacity="0.5"
          />
          <ellipse
            className="chat-ring-stack__ring chat-ring-stack__ring--inner"
            cx="60"
            cy="60"
            rx="26"
            ry="10"
            fill="none"
            stroke="var(--arrival-highlight)"
            strokeWidth="0.0625rem"
            vectorEffect="non-scaling-stroke"
            opacity="0.5"
          />
        </g>
      </svg>
    </div>
  );
}
