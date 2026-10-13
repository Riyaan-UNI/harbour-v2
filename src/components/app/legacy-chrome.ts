/**
 * Re-exports of the ported legacy background layers.
 *
 * `BlobBackground`, `GrainOverlay` and `ScrollProgress` are legacy components,
 * not v2 ones. This module exists so a v2 file can import them through a stable
 * path instead of reaching into `src/legacy/components/` directly from several
 * places — when the v2 lane grows its own equivalents, only this file changes.
 *
 * The `.jsx` extension is spelled out because these files are excluded from the
 * TypeScript project: Vite resolves them, `tsc` never sees them.
 */
// @ts-expect-error -- legacy JSX, outside the TS project on purpose.
export { default as BlobBackground } from '../../legacy/components/BlobBackground.jsx';
// @ts-expect-error -- legacy JSX, outside the TS project on purpose.
export { default as GrainOverlay } from '../../legacy/components/GrainOverlay.jsx';
// @ts-expect-error -- legacy JSX, outside the TS project on purpose.
export { default as ScrollProgress } from '../../legacy/components/ScrollProgress.jsx';
