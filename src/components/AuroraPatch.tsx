import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/**
 * Contained aurora patch — a local colour field, for reviewing glass.
 *
 * Same three blobs as the page aurora, but inside a rounded box rather than
 * fixed to the viewport, and allowed to run hotter (`--aurora-patch-opacity`):
 * a patch is always covered by glass, and it is the glass tint that keeps text
 * legible. The page aurora has bare text on it, so its cap is far lower.
 *
 * `variant="hero"` is the same patch on a different bargain, and it is the only
 * place in the build where the 3:1 large-text allowance is spent: the bare hero
 * patch carries the display/H1 headline and nothing else, and everything else
 * in the hero sits on the copy panel's glass over it. Its cap
 * (`--aurora-hero-opacity`) is solved under both rules at once by
 * `scripts/solve-aurora-cap.mjs`.
 *
 * The blobs live in their own absolutely positioned layer, so `children` paints
 * on top of them without needing a z-index. Static, not animated: it is a
 * swatch, and motion here would be noise.
 */
export type AuroraPatchVariant = 'default' | 'hero';

export function AuroraPatch({
  children,
  variant = 'default',
  className,
}: {
  children?: ReactNode;
  variant?: AuroraPatchVariant;
  className?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'aurora-patch',
        variant === 'hero' && 'aurora-patch--hero',
        className,
      )}
      data-variant={variant}
    >
      <div className="aurora-patch__blobs" aria-hidden="true">
        <div className="aurora-patch__blob aurora-patch__blob--1" />
        <div className="aurora-patch__blob aurora-patch__blob--2" />
        <div className="aurora-patch__blob aurora-patch__blob--3" />
        <div className="aurora-noise" />
      </div>
      <div className="aurora-patch__content">{children}</div>
    </div>
  );
}
