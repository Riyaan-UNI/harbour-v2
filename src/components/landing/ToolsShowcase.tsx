import {
  Bento,
  BentoItem,
  Cluster,
  Heading,
  Section,
  Stack,
  Text,
  VisuallyHidden,
} from '../layout';
import {
  CheckCircle,
  Chip,
  DemoBadge,
  InteractiveCard,
  ProgressRing,
  StatusBadge,
} from '../ui';

/**
 * The four tools — Addendum 1 §4.
 *
 * Each card shows a real sample of the tool's own output, labelled SAMPLE, and
 * expands in place for the longer explanation. The samples are the old build's
 * own shapes: the Scam X-ray card carries the fictional parcel-fee text and
 * the warning-sign shape the X-ray returns; the Settle-in card carries a real
 * "First 48 hours" mini list with the progress ring; the Cantonese helper
 * carries one fully worked phrase; Ask Harbour carries its suggestion chips
 * and a guidance answer.
 *
 * Bento, with varied spans — Addendum 1 §6 rules out grids of identical cards.
 */

/** One row of the Settle-in sample. `done` is carried by an icon and a word. */
type Task = { label: string; done: boolean };

const FIRST_48_HOURS: Task[] = [
  { label: "Save your university's emergency contact details.", done: true },
  { label: 'Keep digital and paper copies of your travel documents.', done: true },
  { label: 'Arrange a local SIM or eSIM for arrival.', done: false },
];

/** The addendum's fictional parcel-fee text, unchanged. */
const SAMPLE_MESSAGE =
  'Your parcel is waiting. Pay a small redelivery fee now: hxxps://hk-post.example/claim. Reply with your bank card details to avoid return.';

const ASK_SUGGESTIONS = [
  'How do I use the MTR?',
  'Where can I get a SIM card?',
  'What is an Octopus card?',
];

export function ToolsShowcase(): JSX.Element {
  return (
    <Section id="tools" aria-labelledby="tools-heading">
      <Stack gap={8}>
        <Stack gap={4}>
          <Heading level={2} id="tools-heading">
            Four tools for your first weeks.
          </Heading>
          <Text tone="muted">
            Each card shows a real sample of what the tool gives back, labelled
            SAMPLE. Open a card to see what it actually does.
          </Text>
        </Stack>

        <Bento gap={6}>
          <BentoItem size="twothirds">
            <InteractiveCard
              title="Scam X-ray"
              description="Paste a message. See the patterns, not a verdict."
              details={
                <Stack gap={4}>
                  <Text role="small" tone="muted">
                    The real tool hides emails, phone numbers, ID and card
                    patterns in your browser before anything is checked, and it
                    tells you how many it hid. Then it looks for the signs
                    scammers reuse: urgency, an upfront fee, a request for a
                    one-time code, a link that is not the organisation&apos;s
                    official site.
                  </Text>
                  <Text role="small" tone="muted">
                    It shows patterns and next steps. It never says a message is
                    safe, and it is not a police report.
                  </Text>
                </Stack>
              }
            >
              <DemoBadge variant="sample">fictional message</DemoBadge>

              <Text role="small" className="landing-quote">
                {SAMPLE_MESSAGE}
              </Text>

              <Cluster gap={3} align="center">
                <StatusBadge tone="amber">Caution</StatusBadge>
                <Text role="small">
                  A small fee to release a parcel, on a link you cannot check.
                </Text>
              </Cluster>

              <Stack as="ul" gap={2} className="list-none p-0">
                <Text as="li" role="small" tone="muted">
                  A payment link that is not the courier&apos;s official site.
                </Text>
                <Text as="li" role="small" tone="muted">
                  A deadline that wants you to act before you can check.
                </Text>
              </Stack>

              <Text role="small">
                <span className="text-accent-text">Next step: </span>
                check the tracking number on the courier&apos;s own website,
                then delete the message.
              </Text>
            </InteractiveCard>
          </BentoItem>

          <BentoItem size="third" tall>
            <InteractiveCard
              title="Settle-in list"
              description="Small steps count."
              details={
                <Text role="small" tone="muted">
                  The list adapts to the country you arrive from and remembers
                  what you have done, so the order of your first week is always
                  in front of you. It lives on this device, and you can add your
                  own tasks to it.
                </Text>
              }
            >
              <DemoBadge variant="sample">one real list</DemoBadge>

              <Cluster gap={4} align="center">
                <ProgressRing value={1 / 3} size="sm" />
                <Stack gap={1}>
                  <Text role="label" tone="muted">
                    First 48 hours
                  </Text>
                  <Text role="small">1 of 3 done</Text>
                </Stack>
              </Cluster>

              <Stack as="ul" gap={3} className="list-none p-0">
                {FIRST_48_HOURS.map((task) => (
                  <Cluster as="li" key={task.label} gap={3} align="start">
                    {task.done ? (
                      <CheckCircle className="mt-1 size-4 shrink-0 text-success" />
                    ) : (
                      <span
                        className="mt-1 size-4 shrink-0 rounded-pill border border-border-strong"
                        aria-hidden="true"
                      />
                    )}
                    <Text
                      role="small"
                      tone={task.done ? 'muted' : 'default'}
                      className={task.done ? 'line-through' : undefined}
                    >
                      {task.label}
                      <VisuallyHidden>
                        {task.done ? ' — done' : ' — not done yet'}
                      </VisuallyHidden>
                    </Text>
                  </Cluster>
                ))}
              </Stack>
            </InteractiveCard>
          </BentoItem>

          <BentoItem size="half">
            <InteractiveCard
              title="Cantonese helper"
              description="Carry the right words, and the right way to say them."
              details={
                <Text role="small" tone="muted">
                  Type or speak what you need, and get one short sentence back:
                  the characters, the jyutping and a note on how it sounds. The
                  essential phrases are always there, even with no connection.
                </Text>
              }
            >
              <DemoBadge variant="sample">one phrase</DemoBadge>

              <Stack gap={2}>
                <Text role="small" tone="muted">
                  Please take me to Central MTR station.
                </Text>
                <Text role="body" lang="zh-HK">
                  唔該，我想去中環站。
                </Text>
                <Text role="small" tone="muted" className="font-mono">
                  m4 goi1, ngo5 soeng2 heoi3 zung1 waan4 zaam6
                </Text>
                <Text role="small">
                  <span className="text-accent-text">Tone: </span>
                  polite and natural for a taxi.
                </Text>
              </Stack>
            </InteractiveCard>
          </BentoItem>

          <BentoItem size="half">
            <InteractiveCard
              title="Ask Harbour"
              description="Ask the thing you think is silly."
              details={
                <Text role="small" tone="muted">
                  Answers are general guidance, written to be short and calm,
                  and they end with a next step. Harbour also works fully
                  without a connection — these questions are the ones people ask
                  most.
                </Text>
              }
            >
              <DemoBadge variant="sample">a common question</DemoBadge>

              <Cluster as="ul" gap={2} className="list-none p-0">
                {ASK_SUGGESTIONS.map((suggestion) => (
                  <li key={suggestion}>
                    <Chip>{suggestion}</Chip>
                  </li>
                ))}
              </Cluster>

              <Stack gap={2} className="landing-quote">
                <Text role="label" tone="muted">
                  Guidance · sample answer
                </Text>
                <Text role="small" tone="muted">
                  “What is an Octopus card?”
                </Text>
                <Text role="small">
                  A stored-value card you tap to pay for the MTR, buses, ferries
                  and many convenience stores. You can buy and top one up at any
                  MTR station customer service desk.
                </Text>
              </Stack>
            </InteractiveCard>
          </BentoItem>
        </Bento>
      </Stack>
    </Section>
  );
}
