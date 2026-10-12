import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useEffect, useRef } from 'react';
import { AuroraPatch } from '../AuroraPatch';
import { Container, Grid, Heading, Section, Stack, Text } from '../layout';
import { ArtSlot } from './ArtSlot';
import { HeroCta } from './HeroCta';
import { WaveLine, type WaveLineHandle } from './WaveLine';

gsap.registerPlugin(SplitText);

/**
 * The hero — Addendum 1 §4.
 *
 * Brick 3b made the hero boxless: the colour field is full-bleed, with a
 * mask-image falloff from the art column (full --aurora-hero-opacity, 0.59 in
 * dark) to the copy column (--aurora-hero-copy-opacity, 0.28). The headline
 * sits on the bare field everywhere; the eyebrow, subhead and CTAs sit on the
 * copy column's weaker field. All three are small text, so the copy cap is held
 * to 4.5:1 — solved by scripts/solve-aurora-cap.mjs, not guessed.
 *
 * The WaveLine sits across the lower third, below the copy rather than behind
 * it, so nothing has to be positioned over the line to be readable.
 *
 * The entrance is a single GSAP timeline: SplitText reveals the headline lines
 * (0.6 s, 0.08 s stagger, ease-out), then the eyebrow, subhead and CTAs fade
 * up together, then the WaveLine settles. Reduced motion shows the final state
 * immediately.
 */
export type HeroProps = {
  /** Passed straight through to the CTA block. */
  savedNickname?: string | null;
};

export function Hero({ savedNickname = null }: HeroProps): JSX.Element {
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaWrapRef = useRef<HTMLDivElement>(null);
  const waveLineRef = useRef<WaveLineHandle>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      waveLineRef.current?.settle();
      return;
    }

    const headline = headlineRef.current;
    const eyebrow = eyebrowRef.current;
    const subhead = subheadRef.current;
    const ctaWrap = ctaWrapRef.current;
    if (!headline || !eyebrow || !subhead || !ctaWrap) return;

    // Hide the supporting copy before the first paint so there is no flash.
    gsap.set([eyebrow, subhead, ctaWrap], { opacity: 0, y: 12 });

    let split: SplitText | null = null;
    let tl: gsap.core.Timeline | null = null;
    let cancelled = false;

    const run = async (): Promise<void> => {
      // SplitText measures rendered lines, so it must wait for fonts.
      await document.fonts.ready;
      if (cancelled) return;

      split = new SplitText(headline, { type: 'lines' });
      gsap.set(split.lines, { opacity: 0, y: 20 });

      tl = gsap.timeline();

      // 1. Headline lines reveal.
      tl.to(split.lines, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
      });

      // 2. Eyebrow, subhead and CTAs fade up.
      tl.to(
        [eyebrow, subhead, ctaWrap],
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
        },
        '-=0.2',
      );

      // 3. WaveLine settles.
      tl.add(() => waveLineRef.current?.settle());
    };

    run();

    return () => {
      cancelled = true;
      tl?.kill();
      split?.revert();
    };
  }, []);

  return (
    <Section id="top" aria-labelledby="hero-headline" contained={false}>
      <AuroraPatch variant="hero">
        <Container>
          <Stack gap={8} className="hero__content">
            <Grid min="lg" gap={8} className="items-center lg:grid-cols-2">
              <Stack gap={6}>
                <Text role="label" tone="muted" ref={eyebrowRef}>
                  For international students in Hong Kong
                </Text>

                <Heading
                  level={1}
                  role="display"
                  id="hero-headline"
                  ref={headlineRef}
                >
                  Your safe harbour in Hong Kong.
                </Heading>

                <Text tone="muted" ref={subheadRef}>
                  Scams, language, paperwork, loneliness — the things nobody
                  warns you about. Harbour helps you through them, one small
                  step at a time.
                </Text>

                <div ref={ctaWrapRef}>
                  <HeroCta savedNickname={savedNickname} />
                </div>
              </Stack>

              <ArtSlot priority ratio="4 / 3" className="w-full" />
            </Grid>

            <div className="hero__wave">
              <WaveLine ref={waveLineRef} />
            </div>
          </Stack>
        </Container>
      </AuroraPatch>
    </Section>
  );
}
