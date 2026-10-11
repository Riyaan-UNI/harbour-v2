import { useEffect, useState } from 'react';

/**
 * Aurora background — spec §4.
 *
 * One fixed layer behind content holding three blurred blobs that drift on
 * transform only, a faint noise overlay to stop the blur banding, and the
 * optional masked 1px grid.
 *
 * The drift pauses while the tab is hidden and is switched off entirely under
 * `prefers-reduced-motion` (handled in CSS, so it also holds before hydration).
 */
export function Aurora(): JSX.Element {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const onVisibilityChange = (): void => {
      setPaused(document.visibilityState === 'hidden');
    };

    onVisibilityChange();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <div className="aurora" data-paused={paused} aria-hidden="true">
      <div className="aurora__blob aurora__blob--1" />
      <div className="aurora__blob aurora__blob--2" />
      <div className="aurora__blob aurora__blob--3" />
      <div className="aurora__grid" />
      <div className="aurora-noise" />
    </div>
  );
}
