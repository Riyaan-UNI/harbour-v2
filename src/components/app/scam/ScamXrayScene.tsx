import { useId } from 'react';

/**
 * ScamXrayScene — the Scam Shield page's artwork.
 *
 * An original Harbour-owned illustration, drawn rather than generated: a
 * suspicious message being read. The card is the message; the lens is the
 * X-ray; the three gold dots are the signals the screen looks for (an
 * upfront fee, urgency, an unofficial link); the small wave in the lens is
 * the Harbour signature, and it is the calm at the centre of the storm.
 *
 * House rules this follows:
 *
 *   - **Decorative only.** `aria-hidden` and `focusable="false"`: nothing in
 *     the scene carries information the page does not already state in text,
 *     so a screen reader loses nothing by skipping it.
 *   - **Token colours.** Every fill and stroke is a CSS custom property set
 *     from `scam-shield.css`, so the scene re-themes with dark and light and
 *     no raw colour enters the codebase.
 *   - **Transform and opacity only.** The lens sweep rotates, the signal
 *     dots breathe; both stop under `prefers-reduced-motion` (the global
 *     rule in base.css also caps them) and under calm mode's `data-calm`.
 *     With animation off, the scene is a complete static drawing.
 */

export function ScamXrayScene(): JSX.Element {
  // Unique per instance: an SVG id collision silently breaks the sweep's
  // gradient and clip on the second render of the page.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const clipId = `scam-scene-clip-${uid}`;
  const sweepId = `scam-scene-sweep-${uid}`;

  return (
    <svg
      className="scam-scene"
      viewBox="0 0 320 260"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="210" cy="120" r="50" />
        </clipPath>
        <linearGradient id={sweepId} x1="0" y1="0" x2="1" y2="0">
          <stop className="scam-scene__sweep-stop" offset="0%" />
          <stop
            className="scam-scene__sweep-stop scam-scene__sweep-stop--faded"
            offset="100%"
          />
        </linearGradient>
      </defs>

      {/* The message: a card with the lines of a text, one of them flagged. */}
      <rect
        className="scam-scene__card"
        x="16"
        y="24"
        width="184"
        height="128"
        rx="12"
      />
      <rect className="scam-scene__bar" x="32" y="44" width="140" height="8" rx="4" />
      <rect className="scam-scene__bar" x="32" y="64" width="104" height="8" rx="4" />
      <rect className="scam-scene__bar" x="32" y="84" width="120" height="8" rx="4" />
      <rect className="scam-scene__bar" x="32" y="104" width="72" height="8" rx="4" />
      {/* The line the read would flag — the fee, in the caution token. */}
      <rect
        className="scam-scene__bar scam-scene__bar--signal"
        x="32"
        y="124"
        width="96"
        height="8"
        rx="4"
      />

      {/* The lens over the message's edge. */}
      <line
        className="scam-scene__handle"
        x1="252"
        y1="162"
        x2="284"
        y2="194"
      />
      <circle
        className="scam-scene__lens"
        cx="210"
        cy="120"
        r="50"
      />

      {/* Inside the lens: the sweep, then the wave at its calm centre. The
          sweep is clipped to the lens so the wedge never escapes it. */}
      <g clipPath={`url(#${clipId})`}>
        <g className="scam-scene__sweep">
          <path
            d="M210 120 L258 92 A50 50 0 0 1 258 148 Z"
            fill={`url(#${sweepId})`}
          />
        </g>
        <path
          className="scam-scene__wave"
          d="M186 138 q7 -8 14 0 t14 0 t14 0"
        />
      </g>

      {/* The three signals, pulled toward the lens centre. */}
      <line className="scam-scene__signal-line" x1="200" y1="56" x2="222" y2="100" />
      <line className="scam-scene__signal-line" x1="200" y1="92" x2="214" y2="112" />
      <line className="scam-scene__signal-line" x1="200" y1="128" x2="216" y2="126" />
      <circle
        className="scam-scene__signal"
        cx="200"
        cy="56"
        r="5"
        style={{ animationDelay: '0ms' }}
      />
      <circle
        className="scam-scene__signal"
        cx="200"
        cy="92"
        r="5"
        style={{ animationDelay: '240ms' }}
      />
      <circle
        className="scam-scene__signal"
        cx="200"
        cy="128"
        r="5"
        style={{ animationDelay: '480ms' }}
      />
    </svg>
  );
}
