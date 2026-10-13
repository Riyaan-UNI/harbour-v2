/**
 * GrainOverlay — a fixed, invisible-by-default SVG noise texture that
 * adds subtle tactile grain to the whole app. 3.5% opacity, pointer-events
 * none, sits behind all content.
 *
 * Dependency-free: inline SVG data URI.
 */
export default function GrainOverlay() {
  return <div className="harbour-grain" aria-hidden="true" />;
}
