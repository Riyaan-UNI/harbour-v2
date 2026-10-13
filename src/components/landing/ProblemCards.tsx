import { Grid, Heading, Section, Stack, Text } from '../layout';
import { InteractiveCard } from '../ui';

/**
 * The problem cards — Addendum 1 §4, whose copy is spec v1 §9's, unchanged.
 *
 * Three interactive cards in a Grid: the spec itself prescribes three here, so
 * the anti-identical-cards rule (which governs bento layouts) does not apply.
 * Each card expands in place, which is the component Brick 3 built and tested
 * for exactly this job — the front is the feeling, the expansion is the
 * answer.
 */
export function ProblemCards(): JSX.Element {
  return (
    <Section aria-labelledby="problem-heading">
      <Stack gap={8}>
        <Heading level={2} id="problem-heading">
          Arriving is the easy part.
        </Heading>

        <Grid min="lg" gap={6}>
          <InteractiveCard
            title="Lost in translation"
            description="Staff, landlords and forms in Cantonese."
            details={
              <Text role="small" tone="muted">
                Most daily admin assumes you speak Cantonese. Harbour turns
                what you hear and what you need to say into short, clear
                sentences.
              </Text>
            }
          />

          <InteractiveCard
            title="Scams that find newcomers"
            description="Fake internships, rental traps, offers that are too good to be true."
            details={
              <Text role="small" tone="muted">
                Harbour helps you spot the warning signs before you pay or
                share anything.
              </Text>
            }
          />

          <InteractiveCard
            title="Alone in a full city"
            description="A fixed routine and cliques make it easy to feel invisible."
            details={
              <Text role="small" tone="muted">
                Harbour connects you with people who have been where you are.
              </Text>
            }
          />
        </Grid>
      </Stack>
    </Section>
  );
}
