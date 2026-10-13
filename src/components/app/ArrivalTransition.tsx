import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';

const LandInScene = lazy(
  () => import('@legacy/components/LandInScene.jsx'),
);

/**
 * PROTECTED — the ripple/arrival intro, carried over from the old build's
 * `ArrivalTransition` in `client/src/App.jsx`.
 *
 * This is a user-flagged protected animation: the circle ripples out, the ship
 * sails in, and "Click anywhere to skip" dismisses it. The sequence, its
 * timings, its class names and its markup are unchanged. The only edit is the
 * import path of `LandInScene`, which moved into `src/legacy/`.
 *
 * Do not restyle or re-time it. A regression here is invisible to a load-only
 * check, because the component still renders — it just stops looking like the
 * intro — so treat any change to this file as a change to the protected asset.
 */
export function ArrivalTransition({
  onDone,
}: {
  onDone: () => void;
}): JSX.Element {
  const [closing, setClosing] = useState(false);
  const onDoneRef = useRef(onDone);
  const voyageRef = useRef<HTMLDivElement>(null);
  onDoneRef.current = onDone;

  const finish = useCallback(() => setClosing(true), []);

  useEffect(() => {
    const timer = window.setTimeout(finish, 5600);
    return () => window.clearTimeout(timer);
  }, [finish]);

  useEffect(() => {
    if (!closing) return undefined;
    const timer = window.setTimeout(() => onDoneRef.current(), 850);
    return () => window.clearTimeout(timer);
  }, [closing]);

  useEffect(() => {
    voyageRef.current?.focus();
  }, []);

  return (
    <div
      ref={voyageRef}
      className={`voyage ${closing ? 'closing' : ''}`}
      onClick={finish}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') finish();
      }}
      role="button"
      tabIndex={0}
      aria-label="Skip the arrival animation and continue"
    >
      <div className="portal-circle" />
      <div className="voyage-black" />
      <div className="voyage-world">
        <Suspense fallback={<div className="landin-loading" />}>
          <LandInScene mode="arrival" />
        </Suspense>
      </div>
      <p>Click anywhere to skip</p>
    </div>
  );
}
