import { useState } from 'react';
import { Heading, Stack, Text } from '../../layout';
import {
  Button,
  DemoBadge,
  ProgressRing,
  StatusBadge,
} from '../../ui';
import { AlertTriangle, CheckCircle, RefreshCw, ShieldAlert } from '../../ui/icons';
import {
  listScenarios,
  getScenario,
} from '../../../lib/features/scam/drillBank';
import type { DrillScenarioId } from '../../../lib/features/scam/types';
import { useDrillSession } from './useDrillSession';

/**
 * DrillPanel — the Scam Drill practice mode.
 *
 * The legacy `ScamDrill.jsx` rebuilt on v2 components, with the ported
 * scenario bank behind it. Every string that was already written for this
 * product is ported verbatim — the SIMULATION banner, the turn counter, the
 * feedback notes, the debrief — because these words were the reviewed ones.
 *
 * Layout notes:
 *
 *   - Options are full-width secondary buttons at the 2.75rem touch target.
 *     An answer advances the thread immediately — the feedback line above
 *     the next message is the record of what was chosen, which is why no
 *     "picked" state outlives the click.
 *   - The progress ring is decoration; the "Turn n of m" text beside it
 *     carries the meaning (Addendum 1 rule 4).
 *   - No scroll-jacking: a new turn simply exists below the previous one.
 *     Reduced motion removes nothing here because nothing moves.
 */

/** The old build's default scenario — verbatim behaviour. */
const DEFAULT_SCENARIO: DrillScenarioId = 'fake_parcel';

export function DrillPanel(): JSX.Element {
  const drill = useDrillSession();
  const [choice, setChoice] = useState<DrillScenarioId>(DEFAULT_SCENARIO);

  const playing =
    drill.status === 'playing' || drill.status === 'answered';
  const scenario = drill.scamType ? getScenario(drill.scamType) : null;
  const turn = scenario?.turns[drill.turnIndex];
  const total = scenario?.turns.length ?? 0;

  return (
    <Stack gap={6} className="scam-drill">
      <DemoBadge variant="simulation">
        this is practice. Nothing here is a real message, number, link or
        account.
      </DemoBadge>

      {drill.status === 'idle' ? (
        <Stack gap={4} className="scam-drill__start">
          <Text role="label" tone="subtle">
            PRACTICE MODE · NEW
          </Text>
          <Heading level={2}>Practise before it happens.</Heading>
          <Text role="body" tone="muted" className="max-w-measure">
            Pick a scenario and answer the way you would in real life. At the
            end you get a debrief and a resilience score.
          </Text>

          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Choose a practice scenario"
          >
            {listScenarios().map((item) => (
              <button
                key={item.id}
                type="button"
                className="scam-drill__chip"
                aria-pressed={choice === item.id}
                onClick={() => setChoice(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div>
            <Button onClick={() => drill.begin(choice)}>
              <ShieldAlert />
              Start practice
            </Button>
          </div>
        </Stack>
      ) : null}

      {playing && scenario ? (
        <Stack gap={4} className="scam-drill__thread">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge tone="info">{scenario.label}</StatusBadge>
            {turn ? (
              <span className="flex items-center gap-2">
                <ProgressRing
                  value={total > 0 ? drill.turnIndex / total : 0}
                  size="sm"
                />
                <Text role="label" tone="subtle">
                  Turn {drill.turnIndex + 1} of {total}
                </Text>
              </span>
            ) : null}
          </div>

          {turn ? (
            <article className="scam-drill__bubble">
              <Text role="label" tone="subtle">
                INCOMING · SIMULATED
              </Text>
              <Text>{turn.message}</Text>
            </article>
          ) : null}

          {drill.feedback ? (
            <div
              className="scam-drill__feedback"
              data-safe={drill.feedback.safe ? 'true' : 'false'}
              role="status"
              aria-live="polite"
            >
              {drill.feedback.safe ? (
                <CheckCircle className="size-4 shrink-0" />
              ) : (
                <AlertTriangle className="size-4 shrink-0" />
              )}
              <Text role="small" tone="muted">
                {drill.feedback.note}
              </Text>
            </div>
          ) : null}

          {turn && drill.status === 'playing' ? (
            <div
              className="flex flex-col gap-2"
              role="group"
              aria-label="Choose your reply"
            >
              {turn.options.map((option) => (
                <Button
                  key={option.id}
                  variant="secondary"
                  className="scam-drill__option w-full justify-start"
                  onClick={() => drill.answer(option.id)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          ) : null}

          {drill.status === 'answered' && !drill.debrief ? (
            <div>
              <Button onClick={drill.finish}>See my debrief</Button>
            </div>
          ) : null}
        </Stack>
      ) : null}

      {drill.debrief ? (
        <Stack gap={4} className="scam-drill__debrief">
          <Text role="label" tone="subtle">
            DEBRIEF
          </Text>
          <Heading level={2}>{drill.debrief.band}</Heading>
          <p className="scam-drill__score">
            <Heading level={3}>{drill.debrief.score}</Heading>
            <Text role="small" tone="muted">
              resilience score
            </Text>
          </p>
          <Text role="small" tone="muted">
            {drill.debrief.scenario}
          </Text>
          <Stack as="ul" gap={2}>
            {drill.debrief.debrief.map((line) => (
              <li key={line} className="type-small text-text-muted">
                {line}
              </li>
            ))}
          </Stack>
          {drill.debrief.missed.length ? (
            <Stack gap={2}>
              <Text role="label" tone="subtle">
                PRACTISE THESE
              </Text>
              <div className="flex flex-wrap gap-2">
                {drill.debrief.missed.map((signal) => (
                  <span key={signal} className="scam-drill__chip is-static">
                    {signal}
                  </span>
                ))}
              </div>
            </Stack>
          ) : null}
          <div>
            <Button variant="secondary" onClick={drill.reset}>
              <RefreshCw />
              Practise again
            </Button>
          </div>
        </Stack>
      ) : null}
    </Stack>
  );
}
