import { useState } from 'react';
import { Cluster, Grid, Heading, Section, Stack, Text } from '../layout';
import { Button, Card, DemoBadge } from '../ui';

/**
 * A look at what is next — Addendum 1 §4.
 *
 * The three later features, each with a permanent badge, and each honest
 * about what it is not: Voice SOS places no call (and always shows 999 for
 * real danger), Tide Bank has no monetary value, Community events are
 * fictional listings. These are flat cards rather than glass — a lighter
 * tier than the tools above, and one fewer glass surface on the page.
 */

const EVENTS = [
  { title: 'A slow Sunday in Sheung Wan', type: 'Explore together' },
  { title: 'Tea, chats & new beginnings', type: 'Meet & connect' },
  { title: 'Market morning in Kowloon City', type: 'City discovery' },
];

export function PreviewStrip(): JSX.Element {
  return (
    <Section aria-labelledby="preview-heading">
      <Stack gap={8}>
        <Heading level={2} id="preview-heading">
          A look at what is next.
        </Heading>

        <Grid min="md" gap={6}>
          <Card variant="flat">
            <Heading level={3}>Voice SOS</Heading>
            <DemoBadge variant="simulation">no call is placed</DemoBadge>
            <Text role="small" tone="muted">
              Practise the words for an emergency, and hear how a call goes,
              before you ever need one. For real danger, call 999 first —
              always.
            </Text>
            <div className="mt-auto">
              <Button asChild variant="secondary" size="small">
                <a href="tel:999">For danger, call 999</a>
              </Button>
            </div>
          </Card>

          <TidePreview />

          <Card variant="flat">
            <Heading level={3}>Community events</Heading>
            <DemoBadge variant="sample">fictional listings</DemoBadge>
            <Stack as="ul" gap={3} className="list-none p-0">
              {EVENTS.map((event) => (
                <li key={event.title}>
                  <Text role="small">{event.title}</Text>
                  <Text role="label" tone="muted">
                    {event.type}
                  </Text>
                </li>
              ))}
            </Stack>
            <Text role="small" tone="muted" className="mt-auto">
              Sample events, shown to demonstrate the shape of the feature.
            </Text>
          </Card>
        </Grid>
      </Stack>
    </Section>
  );
}

/**
 * The Tide Bank preview. The balance is masked by default and revealed on
 * demand — the addendum asks for exactly this, because a number sitting on
 * screen reads as a balance you own, and these points own nothing.
 */
function TidePreview(): JSX.Element {
  const [revealed, setRevealed] = useState(false);

  return (
    <Card variant="flat">
      <Heading level={3}>Tide Bank</Heading>
      <DemoBadge variant="demo">no monetary value</DemoBadge>
      <Text role="small" tone="muted">
        Help someone with an hour, and ask for an hour back. A gentle way to
        swap skills with other students.
      </Text>
      <Cluster gap={3} align="center">
        <Text role="label" tone="muted">
          Demo balance
        </Text>
        <Text role="small">{revealed ? '3 demo points' : '•••'}</Text>
        <Button
          variant="ghost"
          size="small"
          aria-pressed={revealed}
          onClick={() => {
            setRevealed((value) => !value);
          }}
        >
          {revealed ? 'Hide' : 'Show'}
        </Button>
      </Cluster>
      <Text role="small" tone="muted" className="mt-auto">
        Demo points have no monetary value and involve no real people.
      </Text>
    </Card>
  );
}
