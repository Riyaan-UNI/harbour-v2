import { lazy, Suspense } from 'react';
import { Aurora } from '../components/Aurora';
import { Grid, Section, Stack } from '../components/layout';
import { Skeleton } from '../components/ui';
import {
  Hero,
  LandingFooter,
  LandingNav,
} from '../components/landing';
import { useLenis } from '../lib/useLenis';
import { useSavedProfile } from '../lib/useSavedProfile';

/**
 * The landing page — Brick 3 built the top of it, Brick 4 the rest.
 *
 * What is here: the skip link, the sticky glass nav, the hero with the
 * WaveLine and the art slot, then the sections the addendum's feature map
 * asks for, in its order: the four tools, the rental band, the problem
 * cards, the live demo, the practice teaser, the preview strip, how it
 * works, the trust band and the final call — then the footer. The nav's
 * three anchors now resolve: `#tools`, `#how-it-works` and `#trust` are real
 * ids on real sections.
 *
 * The sections below the hero are one lazy chunk (`LandingSections`): they
 * carry the motion library through InteractiveCard, and spec §12 asks for
 * below-the-fold sections to be code-split. The fetch starts at mount, and
 * because the boundary sits below the fold nothing visible moves while it
 * arrives.
 *
 * One `h1`, on the hero headline. The nav and the footer carry no headings —
 * their landmarks are named with `aria-label` instead — so the outline is a
 * single top-level heading followed by the section h2s.
 */

const LandingSections = lazy(() =>
  import('../components/landing/LandingSections').then((module) => ({
    default: module.LandingSections,
  })),
);

/**
 * The skeleton for the below-the-fold chunk.
 *
 * It mirrors the shape the sections actually have — a full-width band with a
 * two-column grid under it — so the page does not jump when they arrive. Every
 * block is the shared `Skeleton`, which means the reduced-motion rule turns the
 * shimmer off for free and the shape stays.
 */
function LandingSectionsSkeleton(): JSX.Element {
  return (
    <Section aria-busy="true" aria-label="Loading the rest of the page">
      <Stack gap={9}>
        {[0, 1].map((band) => (
          <Stack key={band} gap={6}>
            <Stack gap={3} className="max-w-prose">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-full max-w-lg" />
            </Stack>
            <Grid min="md" gap={5} className="sm:grid-cols-2">
              {[0, 1, 2, 3].map((card) => (
                <Skeleton key={card} className="h-40 w-full rounded-lg" />
              ))}
            </Grid>
          </Stack>
        ))}
      </Stack>
    </Section>
  );
}

export function Landing(): JSX.Element {
  const profile = useSavedProfile();
  useLenis();

  return (
    <>
      <Aurora />

      <a href="#main" className="landing-skip">
        Skip to content
      </a>

      <div className="layer-raised">
        <LandingNav />

        <main id="main" tabIndex={-1}>
          {/* The legacy store calls the display name `name`; the hero's CTA
              was written against `nickname` (the v2 name for the same thing).
              One alias here is cheaper than changing either side. */}
          <Hero savedNickname={profile?.name ?? null} />

          {/* The below-the-fold chunk gets a real skeleton rather than an
              empty div: on a cold load over a slow link the boundary can be on
              screen for a beat, and a blank band reads as a broken page. The
              skeleton is a section-shaped shimmer in the page background, so
              nothing about the layout shifts when the real sections arrive. */}
          <Suspense fallback={<LandingSectionsSkeleton />}>
            <LandingSections />
          </Suspense>
        </main>

        <LandingFooter />
      </div>
    </>
  );
}
