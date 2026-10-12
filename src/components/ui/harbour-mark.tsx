import { cn } from '../../lib/cn';

/**
 * HarbourMark — the brand mark, inlined.
 *
 * The geometry is `src/assets/brand/original/harbour-mark.svg` byte for byte:
 * the same `viewBox`, the same four paths, the same stroke widths, the same
 * `opacity=".85"` on the lower wave. Nothing is redrawn, re-ordered or
 * re-scaled. Three things did change, and only three:
 *
 *   1. **The hard `width`/`height` are gone.** The original carried none, but
 *      its siblings do, and a fixed size is what stops a mark scaling into a
 *      nav bar.
 *   2. **Every baked colour is now a token class.** The original's comment
 *      names each value as a spec §3 token, so the mapping is a rename rather
 *      than a decision — see the table below.
 *   3. **`<title>`/`<desc>` are replaced by the `label` prop.** Two marks on
 *      one page would otherwise both claim `id="title"`.
 *
 * | Original | Token | Light theme | Dark theme |
 * | --- | --- | --- | --- |
 * | `#0B3935` the disc | `--accent-fill` | `#0B3935` | `#4FE3D0` |
 * | `#F7F3E9` the gate and the waves | `--on-accent` | `#F2F7F6` | `#04201D` |
 * | `#BFE5E2` the outer wave | `--aurora-1` | `#BFE5E2` | `#0F6B63` |
 * | `#F1C96F` the sun | `--on-accent` | `#F2F7F6` | `#04201D` |
 *
 * The disc has to be `--accent-fill`: it is the only token that is *dark on
 * the light theme's nav glass and light on the dark theme's*, which is the
 * only way one mark clears 3:1 on both. And once the disc is `--accent-fill`,
 * its ink has to be `--on-accent` — the same pairing the Button uses.
 *
 * That leaves the sun. `--gold-fill` is `#F1C96F` in **both** themes, so on
 * the dark theme's disc it measures **1.01:1** — invisible. It cannot be
 * rescued by a different disc either: the disc needs a luminance of at least
 * 0.19 to clear 3:1 against the dark nav glass, and gold needs it at most
 * 0.172 to clear 3:1 *on* the disc. The two are mutually exclusive, so the sun
 * takes the disc's ink and the mark becomes a two-tone badge. The gold
 * survives in the archived original and nowhere else.
 */
export type HarbourMarkProps = {
  className?: string;
  /**
   * The accessible name. Omit it when the mark sits beside a visible wordmark,
   * which is the case in the nav and the footer — the mark is then decoration
   * and is hidden from assistive technology.
   */
  label?: string;
};

export function HarbourMark({
  className,
  label,
}: HarbourMarkProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 128 128"
      className={cn('block', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
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
    </svg>
  );
}
