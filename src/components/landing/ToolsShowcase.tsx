import { useId, useRef, useState, type KeyboardEvent } from 'react';
import {
  CheckCircle,
  Chip,
  DemoBadge,
  ProgressRing,
  StatusBadge,
} from '../ui';
import { Cluster, Heading, Section, Stack, Text } from '../layout';
import { FeatureConceptArt, type HarbourFeature } from './FeatureConceptArt';

type Feature = {
  id: HarbourFeature;
  title: string;
  tagline: string;
  concepts: readonly [string, string, string];
  explanation: readonly string[];
};

const FEATURES = [
  {
    id: 'scam',
    title: 'Scam X-ray',
    tagline: 'See the patterns, not a verdict.',
    concepts: ['Message', 'Warning signs', 'Next check'],
    explanation: [
      'Paste a message and Harbour first hides email, phone, ID and card patterns in your browser. It tells you what it hid, then points out familiar pressure tactics such as urgency, upfront fees, one-time-code requests and unofficial links.',
      'The result gives you patterns and a next step. It never promises that a message is safe, and it is not a police report.',
    ],
  },
  {
    id: 'settle',
    title: 'Settle-in list',
    tagline: 'Small steps count.',
    concepts: ['Arrive', 'First steps', 'Your pace'],
    explanation: [
      'A country-aware first-week list keeps useful steps close at hand. It remembers what you have done on this device, and you can add your own tasks.',
    ],
  },
  {
    id: 'cantonese',
    title: 'Cantonese helper',
    tagline: 'Carry the right words, and the right way to say them.',
    concepts: ['Your phrase', 'Cantonese', 'How it sounds'],
    explanation: [
      'A phrase is shown with Cantonese characters, jyutping and a short note about tone. Essential phrases remain available without a connection.',
      'The examples here are samples. Cantonese wording and jyutping need a native-speaker review before release.',
    ],
  },
  {
    id: 'ask',
    title: 'Ask Harbour',
    tagline: 'Ask the thing you think is silly.',
    concepts: ['Ask freely', 'Clear answer', 'Next step'],
    explanation: [
      'Common questions have short, calm guidance and an offline fallback. Every answer makes clear what to do next; this sample is guidance, not professional advice.',
    ],
  },
] as const satisfies readonly Feature[];

const FIRST_48_HOURS = [
  { label: "Save your university's emergency contact details.", done: true },
  { label: 'Keep digital and paper copies of your travel documents.', done: true },
  { label: 'Arrange a local SIM or eSIM for arrival.', done: false },
] as const;

const SAMPLE_MESSAGE =
  'Your parcel is waiting. Pay a small redelivery fee now: hxxps://hk-post.example/claim. Reply with your bank card details to avoid return.';

const ASK_SUGGESTIONS = [
  'How do I use the MTR?',
  'Where can I get a SIM card?',
  'What is an Octopus card?',
] as const;

function FeatureSample({ feature }: { feature: HarbourFeature }): JSX.Element {
  switch (feature) {
    case 'scam':
      return (
        <Stack gap={4} className="tool-panel__sample-content">
          <DemoBadge variant="sample">fictional message</DemoBadge>
          <Text role="small" className="landing-quote">{SAMPLE_MESSAGE}</Text>
          <Cluster gap={3} align="center">
            <StatusBadge tone="amber">Caution</StatusBadge>
            <Text role="small">A small fee to release a parcel, on a link you cannot check.</Text>
          </Cluster>
          <Stack as="ul" gap={2} className="list-none p-0">
            <Text as="li" role="small" tone="muted">A payment link that is not the courier&apos;s official site.</Text>
            <Text as="li" role="small" tone="muted">A deadline that wants you to act before you can check.</Text>
          </Stack>
          <Text role="small"><span className="text-accent-text">Next step: </span>check the tracking number on the courier&apos;s own website, then delete the message.</Text>
        </Stack>
      );
    case 'settle':
      return (
        <Stack gap={4} className="tool-panel__sample-content">
          <DemoBadge variant="sample">one real list</DemoBadge>
          <Cluster gap={4} align="center">
            <ProgressRing value={1 / 3} size="sm" />
            <Stack gap={1}>
              <Text role="label" tone="muted">First 48 hours</Text>
              <Text role="small">1 of 3 done</Text>
            </Stack>
          </Cluster>
          <Stack as="ul" gap={3} className="list-none p-0">
            {FIRST_48_HOURS.map((task) => (
              <Cluster as="li" key={task.label} gap={3} align="start">
                {task.done ? <CheckCircle className="mt-1 size-4 shrink-0 text-success" /> : <span className="mt-1 size-4 shrink-0 rounded-pill border border-border-strong" aria-hidden="true" />}
                <Text role="small" tone={task.done ? 'muted' : 'default'} className={task.done ? 'line-through' : undefined}>
                  {task.label}<span className="sr-only">{task.done ? ' — done' : ' — not done yet'}</span>
                </Text>
              </Cluster>
            ))}
          </Stack>
        </Stack>
      );
    case 'cantonese':
      return (
        <Stack gap={3} className="tool-panel__sample-content">
          <DemoBadge variant="sample">one phrase</DemoBadge>
          <Text role="small" tone="muted">Please take me to Central MTR station.</Text>
          <Text role="body" lang="zh-HK">唔該，我想去中環站。</Text>
          <Text role="small" tone="muted" className="font-mono">m4 goi1, ngo5 soeng2 heoi3 zung1 waan4 zaam6</Text>
          <Text role="small"><span className="text-accent-text">Tone: </span>polite and natural for a taxi.</Text>
        </Stack>
      );
    case 'ask':
      return (
        <Stack gap={4} className="tool-panel__sample-content">
          <DemoBadge variant="sample">a common question</DemoBadge>
          <Cluster as="ul" gap={2} className="list-none p-0">
            {ASK_SUGGESTIONS.map((suggestion) => <li key={suggestion}><Chip>{suggestion}</Chip></li>)}
          </Cluster>
          <Stack gap={2} className="landing-quote">
            <Text role="label" tone="muted">Guidance · sample answer</Text>
            <Text role="small" tone="muted">“What is an Octopus card?”</Text>
            <Text role="small">A stored-value card you tap to pay for the MTR, buses, ferries and many convenience stores. You can buy and top one up at any MTR station customer service desk.</Text>
          </Stack>
        </Stack>
      );
  }
}

export function ToolsShowcase(): JSX.Element {
  const [activeFeature, setActiveFeature] = useState<HarbourFeature>('scam');
  const id = useId();
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeIndex = FEATURES.findIndex(({ id: featureId }) => featureId === activeFeature);
  const active = FEATURES.find(({ id: featureId }) => featureId === activeFeature) ?? FEATURES[0];
  const tablistId = `${id}-feature-tabs`;
  const panelId = `${id}-feature-panel`;

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    let nextIndex = activeIndex;
    if (event.key === 'ArrowRight') nextIndex = (activeIndex + 1) % FEATURES.length;
    else if (event.key === 'ArrowLeft') nextIndex = (activeIndex - 1 + FEATURES.length) % FEATURES.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = FEATURES.length - 1;
    else return;

    event.preventDefault();
    const nextFeature = FEATURES[nextIndex];
    if (!nextFeature) return;
    setActiveFeature(nextFeature.id);
    tabs.current[nextIndex]?.focus();
    if (window.matchMedia('(width < 48em)').matches) {
      window.requestAnimationFrame(() => panelRef.current?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      }));
    }
  };

  return (
    <Section id="tools" aria-labelledby="tools-heading" className="tools-showcase">
      <Stack gap={8}>
        <Cluster align="end" gap={8} className="tools-showcase__intro">
          <Stack gap={3}>
            <Text role="label" tone="muted">Harbour tools · choose a card</Text>
            <Heading level={2} id="tools-heading">Four tools for your first weeks.</Heading>
          </Stack>
          <Text tone="muted" className="tools-showcase__instruction">Choose a tool to see its sample and next step. Swipe the cards on a phone.</Text>
        </Cluster>

        <div id={tablistId} className="tool-deck" role="tablist" aria-label="Explore Harbour tools" aria-orientation="horizontal">
          {FEATURES.map((feature, index) => {
            const selected = feature.id === activeFeature;
            const tabId = `${id}-tab-${feature.id}`;
            return (
              <button
                key={feature.id}
                ref={(node) => { tabs.current[index] = node; }}
                id={tabId}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                aria-label={`${feature.title}: ${feature.tagline}`}
                tabIndex={selected ? 0 : -1}
                data-selected={selected}
                className={`tool-deck__card tool-deck__card--${feature.id}`}
                onClick={() => {
                  setActiveFeature(feature.id);
                  if (window.matchMedia('(width < 48em)').matches) {
                    window.requestAnimationFrame(() => panelRef.current?.scrollIntoView({
                      block: 'start',
                      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
                    }));
                  }
                }}
                onKeyDown={handleTabKeyDown}
              >
                <span className="tool-deck__card-meta" aria-hidden="true">0{index + 1} / 04</span>
                <FeatureConceptArt feature={feature.id} />
                <span className="tool-deck__concepts" aria-hidden="true">
                  {feature.concepts.map((concept) => <span key={concept}>{concept}</span>)}
                </span>
                <span className="tool-deck__card-title" role="heading" aria-level={3}>{feature.title}</span>
                <span className="tool-deck__card-tagline">{feature.tagline}</span>
              </button>
            );
          })}
        </div>

        <div
          ref={panelRef}
          id={panelId}
          className={`tool-panel tool-panel--${active.id}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${active.id}`}
          tabIndex={0}
        >
          <div className="tool-panel__story">
            <Text role="label" tone="muted">Selected tool · 0{activeIndex + 1}</Text>
            <Heading level={3}>{active.title}</Heading>
            <Text role="body" className="tool-panel__tagline">{active.tagline}</Text>
            {active.explanation.map((paragraph) => <Text key={paragraph} role="small" tone="muted">{paragraph}</Text>)}
          </div>
          <div className="tool-panel__sample" aria-label={`${active.title} sample`}>
            <FeatureSample feature={active.id} />
          </div>
        </div>
      </Stack>
    </Section>
  );
}
