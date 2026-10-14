import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Cluster,
  Heading,
  Section,
  Stack,
  Text,
  VisuallyHidden,
} from '../layout';
import { Button, Card, DemoBadge, Skeleton } from '../ui';

/**
 * The live demo — Addendum 1 §4.
 *
 * Canned examples only, labelled DEMO, and honest about being canned: the
 * input is a fixed quote rather than an editable box, because a box you can
 * type into implies the demo answers anything you type — and it answers
 * exactly two prepared sentences. This is a deviation from spec §9's "text
 * box prefilled with a sample", recorded in PROGRESS.md; the addendum's own
 * words are "canned examples only".
 *
 * The button plays the real tool's shape — a calm thinking state, then the
 * result with English, characters, jyutping and a tone note. The thinking
 * delay is skipped entirely under reduced motion: the state exists for people
 * who are waiting, not as theatre.
 */

type Example = {
  id: string;
  /** The chip that selects it. */
  label: string;
  input: string;
  english: string;
  cantonese: string;
  jyutping: string;
  tone: string;
};

const TAXI_EXAMPLE: Example = {
  id: 'taxi',
  label: 'A taxi to Central',
  input:
    'Hi uh sorry, so I was wondering if maybe you could, like, take me to Central station, the MTR one, if it is not too much trouble?',
  english: 'Please take me to Central MTR station.',
  cantonese: '唔該，我想去中環站。',
  jyutping: 'm4 goi1, ngo5 soeng2 heoi3 zung1 waan4 zaam6',
  tone: 'Polite and natural for a taxi.',
};

const EXAMPLES: Example[] = [
  TAXI_EXAMPLE,
  {
    id: 'deposit',
    label: 'A landlord question',
    input:
      'Um, my landlord says I have to pay two months deposit but I do not understand if that is normal.',
    english: 'Is a two-month deposit normal for a rental?',
    cantonese: '請問租屋要俾兩個月按金係咪正常？',
    jyutping:
      'cing2 man6 zou1 uk1 jiu3 bei2 loeng5 go3 jyut6 on3 gam1 hai6 mai6 zing3 soeng4',
    tone: 'Direct and neutral — a fair question to ask at a counter.',
  },
];

type Phase = 'idle' | 'thinking' | 'done';

export function LiveDemo(): JSX.Element {
  const [selectedId, setSelectedId] = useState(TAXI_EXAMPLE.id);
  const [phase, setPhase] = useState<Phase>('idle');
  const reduceMotion = useReducedMotion() === true;
  const timer = useRef<number | undefined>(undefined);

  const example =
    EXAMPLES.find((item) => item.id === selectedId) ?? TAXI_EXAMPLE;

  // A pending "thinking" timer must not outlive the section.
  useEffect(
    () => () => {
      if (timer.current !== undefined) window.clearTimeout(timer.current);
    },
    [],
  );

  function select(id: string): void {
    if (timer.current !== undefined) window.clearTimeout(timer.current);
    setSelectedId(id);
    setPhase('idle');
  }

  function makeClear(): void {
    if (phase === 'thinking') return;
    if (reduceMotion) {
      setPhase('done');
      return;
    }
    setPhase('thinking');
    timer.current = window.setTimeout(() => {
      setPhase('done');
    }, 450);
  }

  return (
    <Section aria-labelledby="demo-heading">
      <Stack gap={8}>
        <Stack gap={4}>
          <Cluster gap={3} align="center">
            <Heading level={2} id="demo-heading">
              Say it your way. We will make it clear.
            </Heading>
            <DemoBadge variant="demo">canned examples</DemoBadge>
          </Cluster>
          <Text tone="muted">
            Two prepared examples, so you can see the shape of an answer before
            you ask anything yourself.
          </Text>
        </Stack>

        <Card variant="static">
          <Cluster gap={3}>
            {EXAMPLES.map((item) => (
              <Button
                key={item.id}
                variant="secondary"
                size="small"
                aria-pressed={item.id === selectedId}
                onClick={() => {
                  select(item.id);
                }}
              >
                {item.label}
              </Button>
            ))}
          </Cluster>

          <Text role="small" tone="muted" className="landing-quote">
            {example.input}
          </Text>

          <div>
            <Button onClick={makeClear} disabled={phase === 'thinking'}>
              {phase === 'thinking' ? 'Making it clear…' : 'Make it clear'}
            </Button>
          </div>

          <div aria-live="polite">
            {phase === 'thinking' ? (
              <Stack gap={3}>
                <Text role="small" tone="muted">
                  Making it clear…
                </Text>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </Stack>
            ) : null}

            {phase === 'done' ? (
              <motion.div
                key={example.id}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <Stack gap={3} className="landing-quote">
                  <Cluster gap={3} align="center">
                    <DemoBadge variant="demo" />
                    <Text role="label" tone="muted">
                      What Harbour would say
                    </Text>
                  </Cluster>
                  <Text>{example.english}</Text>
                  <Text lang="zh-HK">{example.cantonese}</Text>
                  <Text role="small" tone="muted" className="font-mono">
                    {example.jyutping}
                  </Text>
                  <Text role="small">
                    <span className="text-accent-text">Tone: </span>
                    {example.tone}
                  </Text>
                  <VisuallyHidden>
                    This is a prepared example, not a live translation.
                  </VisuallyHidden>
                </Stack>
              </motion.div>
            ) : null}

            {phase === 'idle' ? (
              <Text role="small" tone="subtle">
                Press the button to see the answer for this example.
              </Text>
            ) : null}
          </div>
        </Card>
      </Stack>
    </Section>
  );
}
