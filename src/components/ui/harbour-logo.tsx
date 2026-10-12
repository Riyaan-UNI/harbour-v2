import { cn } from '../../lib/cn';
import { HarbourMark } from './harbour-mark';

/**
 * HarbourLogo — the nav and footer lockup, in two variants.
 *
 * **`variant="live"` (the default, and the one the product uses).** The mark,
 * plus the name set in `--font-heading`. This is the variant that was chosen,
 * and the reason is in the supplied file itself: its wordmark is a `<text>`
 * element in `Georgia, 'Times New Roman', serif` — a serif, against the
 * Bricolage Grotesque the rest of the product is set in. Setting the name live
 * keeps the lockup in the heading face, keeps it selectable and searchable,
 * lets it inherit the theme's text colour and tracking, and stays sharp at any
 * size because it is text rather than a scaled drawing.
 *
 * **`variant="supplied"`.** The lockup exactly as it was handed over —
 * 510x128, mark and wordmark and the tagline under it — inlined, with the hard
 * `width`/`height` dropped, the `viewBox` kept, and the five baked colours
 * mapped onto tokens. It is kept as a variant so the comparison can be made
 * again, and so the supplied artwork is still in the build rather than only in
 * the archive.
 *
 * Neither variant edits a path. Both read their colour from tokens, so they
 * follow the theme with the rest of the page.
 */
export type HarbourLogoVariant = 'live' | 'supplied';

/** The three sizes the nav, the footer and the dev page compare. */
export type HarbourLogoSize = 'sm' | 'md' | 'lg';

export type HarbourLogoProps = {
  /** `live` (default) is the mark plus the name in the heading face. */
  variant?: HarbourLogoVariant;
  /** `sm` 1.5rem, `md` 2rem, `lg` 3rem — the mark's box, and the lockup's height. */
  size?: HarbourLogoSize;
  /** The accessible name. Defaults to `Harbour`. */
  label?: string;
  className?: string;
};

export function HarbourLogo({
  variant = 'live',
  size = 'md',
  label = 'Harbour',
  className,
}: HarbourLogoProps): JSX.Element {
  const sizeClass = `brand-lockup--${size}`;

  if (variant === 'supplied') {
    return (
      <svg
        viewBox="0 0 510 128"
        className={cn('brand-lockup__supplied', sizeClass, className)}
        role="img"
        aria-label={label}
        focusable="false"
      >
        <circle cx="64" cy="64" r="61" className="fill-accent-fill" />
        <circle cx="64" cy="31" r="7" className="fill-on-accent" />

        <path
          d="M39 43v35M89 43v35"
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          className="stroke-on-accent"
        />
        <path
          d="M39 60c8-5 16-7 25-7s17 2 25 7"
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          className="stroke-on-accent"
        />
        <path
          d="M22 84c13-8 27-8 42 0s29 8 42 0"
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className="stroke-aurora-1"
        />
        <path
          d="M31 99c10-5 21-5 33 0s23 5 33 0"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.85"
          className="stroke-on-accent"
        />

        {/* The supplied wordmark: a serif, at 55 units, tracking -2. Left as
            the file has it — the typeface is the whole reason this variant
            exists. */}
        <text
          x="151"
          y="73"
          fontSize="55"
          fontWeight="600"
          letterSpacing="-2"
          fontFamily="Georgia, 'Times New Roman', serif"
          className="fill-text"
        >
          Harbour
        </text>
        <text
          x="155"
          y="101"
          fontSize="11"
          fontWeight="500"
          letterSpacing="0.4"
          fontFamily="Arial, sans-serif"
          className="fill-text-subtle"
        >
          Your safe harbour in Hong Kong
        </text>
      </svg>
    );
  }

  return (
    <span className={cn('brand-lockup', sizeClass, className)}>
      <HarbourMark className="brand-lockup__mark" />
      <span className="brand-lockup__word">{label}</span>
    </span>
  );
}
