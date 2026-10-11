import type { ReactNode } from 'react';

/**
 * Contained aurora patch — a local colour field, for reviewing glass.
 *
 * Same three blobs as the page aurora, but inside a rounded box rather than
 * fixed to the viewport, and allowed to run hotter (`--aurora-patch-opacity`):
 * a patch is always covered by glass, and it is the glass tint that keeps text
 * legible. The page aurora has bare text on it, so its cap is far lower.
 *
 * The blobs live in their own absolutely positioned layer, so `children` paints
 * on top of them without needing a z-index. Static, not animated: it is a
 * swatch, and motion here would be noise.
 */
export function AuroraPatch({
  children,
}: {
  children?: ReactNode;
}): JSX.Element {
  return (
    <div className="aurora-patch">
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
