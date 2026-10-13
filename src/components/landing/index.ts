export { ArtSlot, type ArtSlotProps } from './ArtSlot';
export { Hero, type HeroProps } from './Hero';
export { HeroCta, type HeroCtaProps } from './HeroCta';
export { LandingFooter } from './LandingFooter';
export { LandingNav } from './LandingNav';
export { WaveLine, type WaveLineProps } from './WaveLine';

/**
 * The sections below the hero are deliberately NOT re-exported here.
 *
 * This barrel is imported by the landing page's eager top (nav, hero,
 * footer) and by `/dev/components`; re-exporting the sections would drag
 * them — and the motion library they use through InteractiveCard — into
 * the initial chunk. `LandingSections` composes them and is imported
 * directly, so the landing page loads them as one separate chunk.
 */
