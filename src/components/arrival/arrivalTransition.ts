/**
 * Configuration for the `/arrival` passage's warp transition.
 *
 * These live in their own module rather than in `ArrivalStory.tsx` so that the
 * route file exports only its component (the fast-refresh lint rule wants it
 * that way) and so the transition's copy and destination can be changed — and
 * asserted in tests — without touching the story itself.
 */

/**
 * The typewriter lines revealed over the warp. Edit here.
 *
 * Keep them short: each line reveals with `steps(22)` and the whole overlay
 * only lives for about three seconds, so a long line will not finish typing
 * before the ripple takes over.
 */
export const TERMINAL_LINES = [
  'ARRIVAL CONFIRMED · HONG KONG',
  'PREPARING YOUR HARBOUR…',
];

/** Where the passage hands off once the ripple has washed out. */
export const ARRIVAL_DESTINATION = '/app/home';
