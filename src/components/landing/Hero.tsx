import { gsap } from 'gsap';
import { useLayoutEffect, useRef, useState } from 'react';
import { Container, Grid, Heading, Section, Stack, Text } from '../layout';
import { EyeOff } from '../ui/icons';
import { HarbourJourneyScene } from './HarbourJourneyScene';
import { HeroCta } from './HeroCta';
import { WaveLine, type WaveLineHandle } from './WaveLine';

export type HeroProps = {
  savedNickname?: string | null;
};

/** Arrival chapter. Content and actions are available before any animation runs. */
export function Hero({ savedNickname = null }: HeroProps): JSX.Element {
  const copyRef = useRef<HTMLDivElement>(null);
  const waveLineRef = useRef<WaveLineHandle>(null);
  const [entrance, setEntrance] = useState<'entering' | 'entered'>('entering');

  useLayoutEffect(() => {
    // No font-loading gate, hidden controls, or split-line DOM: resizing and
    // text enlargement must never leave an action waiting for an entrance.
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const tween = gsap.fromTo(
        copyRef.current,
        { y: 16 },
        {
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          onComplete: () => setEntrance('entered'),
        },
      );
      return () => tween.revert();
    });
    waveLineRef.current?.settle();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEntrance('entered');
    }
    return () => media.revert();
  }, []);

  return (
    <Section
      id="top"
      aria-labelledby="hero-headline"
      contained={false}
      className="hero__section"
      data-entrance={entrance}
    >
      <Container>
        <Stack gap={6} className="hero__content">
          <Grid min="lg" gap={7} className="hero__grid">
            <Stack gap={6} ref={copyRef} className="hero__copy">
              <Text role="label" tone="muted" className="hero__eyebrow">
                For international students in Hong Kong, China
              </Text>
              <Heading
                level={1}
                role="display"
                id="hero-headline"
                className="hero__headline"
              >
                Your <span className="hero__emphasis">safe harbour</span> in Hong Kong.
              </Heading>
              <Text tone="muted" className="hero__description">
                Scams, language, paperwork, loneliness — the things nobody
                warns you about. Harbour helps you through them, one small
                step at a time.
              </Text>
              <Stack gap={4}>
                <HeroCta savedNickname={savedNickname} className="hero__actions" />
                <Text role="small" tone="muted" className="hero__privacy">
                  <EyeOff />
                  A local profile. No account or password. Saved on this device.
                </Text>
              </Stack>
            </Stack>
            <HarbourJourneyScene />
          </Grid>
          <div className="hero__wave" aria-hidden="true">
            <WaveLine ref={waveLineRef} />
          </div>
        </Stack>
      </Container>
    </Section>
  );
}
