import { AuroraPatch } from '../AuroraPatch';
import { Card } from '../ui';
import { Grid, Heading, Section, Stack, Text } from '../layout';
import { ArtSlot } from './ArtSlot';
import { HeroCta } from './HeroCta';
import { WaveLine } from './WaveLine';

/**
 * The hero — Addendum 1 §4.
 *
 * The colour bargain, which is the reason for the shape of this markup: the
 * contained aurora patch runs hot (`--aurora-hero-opacity`, 0.59 in dark —
 * more than three times the page aurora), and it can, because the only text on
 * the bare patch is the display headline. The headline is 44px at its smallest,
 * so the 3:1 large-text allowance covers it, and the script measures it at
 * 3.94:1. Everything else — the eyebrow, the subhead, the buttons — sits on the
 * copy panel's glass over the patch, where 4.5:1 applies. The eyebrow could
 * never sit bare: at 0.75rem it is small text.
 *
 * The WaveLine sits across the lower third, below the copy rather than behind
 * it, so nothing has to be positioned over the line to be readable.
 */
export type HeroProps = {
  /** Passed straight through to the CTA block. */
  savedNickname?: string | null;
};

export function Hero({ savedNickname = null }: HeroProps): JSX.Element {
  return (
    <Section id="top" aria-labelledby="hero-headline">
      <AuroraPatch variant="hero">
        <Stack gap={8}>
          <Grid min="lg" gap={8} className="items-center lg:grid-cols-2">
            <Stack gap={6}>
              <Heading level={1} role="display" id="hero-headline">
                Your safe harbour in Hong Kong.
              </Heading>

              <Card variant="static">
                <Stack gap={5}>
                  <Text role="label" tone="muted">
                    For international students in Hong Kong
                  </Text>
                  <Text tone="muted">
                    Scams, language, paperwork, loneliness — the things nobody
                    warns you about. Harbour helps you through them, one small
                    step at a time.
                  </Text>
                  <HeroCta savedNickname={savedNickname} />
                </Stack>
              </Card>
            </Stack>

            <ArtSlot priority ratio="4 / 3" className="w-full" />
          </Grid>

          <div className="hero__wave">
            <WaveLine />
          </div>
        </Stack>
      </AuroraPatch>
    </Section>
  );
}
