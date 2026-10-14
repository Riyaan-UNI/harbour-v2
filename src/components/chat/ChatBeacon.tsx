/**
 * ChatBeacon — a breathing ring that reacts to the chatbot's state.
 *
 * Two concentric rings plus a central core, animated via CSS keyframes
 * (transform/opacity only). The idle state breathes slowly; the thinking
 * state pulses quicker with a second ring. Reduced motion renders the
 * same calm rest frame for both states.
 *
 * All decoration is aria-hidden; state is communicated through text labels
 * elsewhere in the page.
 */
export function ChatBeacon({
  state,
}: {
  state: 'idle' | 'thinking';
}): JSX.Element {
  return (
    <div
      className={`chat-beacon chat-beacon--${state}`}
      data-state={state}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 120" className="chat-beacon__svg">
        <defs>
          <linearGradient
            id="chat-beacon-grad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor="var(--arrival-action)"
              stopOpacity="0.5"
            />
            <stop
              offset="100%"
              stopColor="var(--arrival-highlight)"
              stopOpacity="0.25"
            />
          </linearGradient>
        </defs>
        <circle
          className="chat-beacon__ring chat-beacon__ring--outer"
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="url(#chat-beacon-grad)"
          strokeWidth="0.125rem"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          className="chat-beacon__ring chat-beacon__ring--inner"
          cx="60"
          cy="60"
          r="35"
          fill="none"
          stroke="var(--arrival-action)"
          strokeWidth="0.125rem"
          vectorEffect="non-scaling-stroke"
          opacity="0.4"
        />
        <circle
          className="chat-beacon__core"
          cx="60"
          cy="60"
          r="12"
          fill="var(--arrival-action)"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}
