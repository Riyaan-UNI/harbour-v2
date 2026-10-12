/**
 * Route registry — consumed by the router and the dev hub.
 *
 * Keeping the metadata here means the dev hub can list every route without
 * duplicating the table, and the router can still lazy-load the dev pages.
 */

export type RouteMeta = {
  path: string;
  label: string;
  description: string;
  brick: number;
  group: 'production' | 'dev';
};

export const ROUTES: readonly RouteMeta[] = [
  {
    path: '/',
    label: 'Landing',
    description: 'Hero, nav, footer — the top of the page.',
    brick: 3,
    group: 'production',
  },
  {
    path: '/dev',
    label: 'Dev hub',
    description: 'Route registry and quick navigation for developers.',
    brick: 3,
    group: 'dev',
  },
  {
    path: '/dev/gallery',
    label: 'Gallery',
    description: 'Colour tokens, glass surfaces, motion and aurora patches.',
    brick: 0,
    group: 'dev',
  },
  {
    path: '/dev/primitives',
    label: 'Primitives',
    description: 'Layout primitives stress test at every breakpoint.',
    brick: 1,
    group: 'dev',
  },
  {
    path: '/dev/components',
    label: 'Components',
    description: 'UI components, variants, and interactive states.',
    brick: 2,
    group: 'dev',
  },
];
