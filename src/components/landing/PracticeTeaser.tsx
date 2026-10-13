import { useState } from 'react';
import { Cluster, Heading, Section, Stack, Text } from '../layout';
import { Button, Card, DemoBadge, StatusBadge } from '../ui';

/**
 * The practice teaser — Addendum 1 §4.
 *
 * The first turn of the old build's `fake_parcel` drill scenario, unchanged:
 * one message, three response options, exactly one safe. The drill itself is
 * a simulation (its own component in the Scam Shield brick), so the section
 * carries a permanent SIMULATION badge — this is practice, not a real
 * message.
 *
 * The feedback names the signal rather than scoring the person, and the band
 * is gentle in both directions: picking the trap is the point of practising,
 * not a failure.
 */

const MESSAGE =
  'Your parcel is held at the depot. Pay a small redelivery fee today or it returns to the sender. Open the link to claim it.';

const SIGNAL = 'Small-fee bait';

type Option = { id: string; label: string; safe: boolean };

const OPTIONS: Option[] = [
  { id: 'a', label: 'Open the link and pay the small fee', safe: false },
  {
    id: 'b',
    label: "Check the tracking number on the courier's official website yourself",
    safe: true,
  },
  { id: 'c', label: 'Reply asking for a bigger discount', safe: false },
];

export function PracticeTeaser(): JSX.Element {
  const [picked, setPicked] = useState<Option | null>(null);

  const feedback = picked
    ? picked.safe
      ? `That's the safe one — you checked the tracking number yourself. The signal was ${SIGNAL}: a small fee, and a link you cannot check.`
      : `That one walks into the trap, which is exactly what this is for. The signal was ${SIGNAL}: a small fee, and a link you cannot check.`
    : null;

  return (
    <Section aria-labelledby="teaser-heading">
      <Stack gap={8}>
        <Stack gap={4}>
          <Cluster gap={3} align="center">
            <Heading level={2} id="teaser-heading">
              Rehearse the hard conversation first.
            </Heading>
            <DemoBadge variant="simulation">
              practice, not a real message
            </DemoBadge>
          </Cluster>
          <Text tone="muted">
            Three ways to answer, one of them safe. It is safe to try.
          </Text>
        </Stack>

        <Card variant="static">
          <Text role="small" className="landing-quote">
            {MESSAGE}
          </Text>

          <Stack as="ul" gap={3} className="list-none p-0">
            {OPTIONS.map((option) => (
              <li key={option.id}>
                <Button
                  variant="secondary"
                  disabled={picked !== null}
                  aria-pressed={picked?.id === option.id}
                  onClick={() => {
                    setPicked(option);
                  }}
                  className="w-full justify-start text-start whitespace-normal"
                >
                  {option.label}
                </Button>
              </li>
            ))}
          </Stack>

          {picked ? (
            <Stack gap={3}>
              <Cluster gap={3} align="center">
                <StatusBadge tone={picked.safe ? 'green' : 'amber'}>
                  {picked.safe ? 'A good instinct' : 'Worth another run'}
                </StatusBadge>
              </Cluster>
              <Text role="small" tone="muted">
                {feedback}
              </Text>
              <div>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => {
                    setPicked(null);
                  }}
                >
                  Practise again
                </Button>
              </div>
            </Stack>
          ) : null}
        </Card>
      </Stack>
    </Section>
  );
}
