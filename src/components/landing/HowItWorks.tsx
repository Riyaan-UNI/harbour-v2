import { Cluster, Heading, Section, Stack, Text } from '../layout';

/**
 * How it works — Addendum 1 §4.
 *
 * Three steps, in order: create a profile, tell Harbour what you need, get a
 * clear next step. Spec §9 had the active step highlight as you scroll; the
 * addendum's replacement section names no scroll behaviour, so the steps are
 * quiet and static — the landing already has one scroll-linked scene (the
 * WaveLine), and a second one would be motion for its own sake.
 */

const STEPS = [
  {
    title: 'Create a profile',
    body: 'A name, where you are from, and your university if you want to add it. It takes a minute, and it stays on this device.',
  },
  {
    title: 'Tell Harbour what you need',
    body: 'A message to check, a phrase to learn, a form to read, a question that feels too small to ask.',
  },
  {
    title: 'Get a clear next step',
    body: 'Every answer ends with what to do next, and which tool to use next — you are never left holding a result with nowhere to take it.',
  },
];

export function HowItWorks(): JSX.Element {
  return (
    <Section id="how-it-works" aria-labelledby="how-heading">
      <Stack gap={8}>
        <Heading level={2} id="how-heading">
          Three steps to feeling at home.
        </Heading>

        <Stack gap={6}>
          {STEPS.map((step, index) => (
            <Cluster key={step.title} gap={5} align="start">
              <span
                className="landing-step__number type-label"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <Stack gap={2}>
                <Heading level={3}>{step.title}</Heading>
                <Text tone="muted">{step.body}</Text>
              </Stack>
            </Cluster>
          ))}
        </Stack>
      </Stack>
    </Section>
  );
}
