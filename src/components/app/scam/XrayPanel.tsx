import { useCallback, useState, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Heading, Stack, Text } from '../../layout';
import {
  Button,
  Card,
  DemoBadge,
  EmptyState,
  ErrorState,
  FormField,
  RedactionNotice,
  Skeleton,
  StatusBadge,
  Textarea,
} from '../../ui';
import { ListChecks, ShieldAlert } from '../../ui/icons';
import { redactPrivateInfo } from '../../../lib/features/redact';
import { screenScam } from '../../../lib/features/scam/keywordScreen';
import { SAMPLE_MESSAGE } from '../../../lib/features/scam/sample';
import type { RiskLevel, ScanResult } from '../../../lib/features/scam/types';

/**
 * XrayPanel — the Scam X-ray tool: paste, redact, read.
 *
 * The legacy `Shield.jsx` workspace, rebuilt on v2 components. The engine is
 * the deterministic keyword screen ported from the old build's server
 * fallback, so the read is instant and local: **no artificial delay is added**
 * (never imply a service is working when the feature is local). The four
 * states Addendum 1 rule 1 requires are all here — `idle`, `reading`,
 * `result` and `error`. `reading` stays in the machine for the day the read
 * gains a real async path; until then the screen resolves synchronously and
 * the skeleton is simply never reached.
 *
 * Privacy is demonstrated, not claimed (rule 5): the text is redacted in the
 * browser before the screen sees it, and `RedactionNotice` reports the count.
 */

/** The old build's red flags — shown when the check itself fails. */
const RED_FLAGS = [
  'An upfront fee to receive a prize, parcel, job, or loan',
  'Pressure to act immediately or keep the offer secret',
  'Requests for your HKID, bank PIN, password, or one-time code',
  'A payment link that is not on the organisation’s official website',
];

/** The old build's tone map, retargeted to v2 StatusBadge tones. */
const TONE: Record<RiskLevel, 'red' | 'amber' | 'green'> = {
  High: 'red',
  Medium: 'amber',
  Low: 'green',
};

/** The checklist handoff's suggestion — ported verbatim. */
const CHECKLIST_SUGGESTION =
  'Verify the offer using the organisation’s official website; do not use the message link or pay a fee.';

type XrayState =
  | { status: 'idle' }
  | { status: 'reading' }
  | { status: 'result'; scan: ScanResult; redactionCount: number }
  | { status: 'error' };

export type XrayPanelProps = {
  /**
   * Focus target for the page's "check a message" CTA. The hero sits above
   * the tab panel, so it needs the textarea's ref to move focus down here.
   */
  inputRef?: RefObject<HTMLTextAreaElement>;
};

export function XrayPanel({ inputRef }: XrayPanelProps): JSX.Element {
  const [text, setText] = useState('');
  const [state, setState] = useState<XrayState>({ status: 'idle' });

  const runAnalysis = useCallback((): void => {
    const trimmed = text.trim();
    if (!trimmed) return;
    // Redact first, in the browser: the screen never sees the original.
    const { text: safeText, count } = redactPrivateInfo(trimmed);
    try {
      const scan = screenScam(safeText);
      setState({ status: 'result', scan, redactionCount: count });
    } catch {
      // The engine is pure and cannot realistically throw — but a tool that
      // shows a result must always have somewhere to go when it cannot.
      setState({ status: 'error' });
    }
  }, [text]);

  function submit(event: React.FormEvent): void {
    event.preventDefault();
    runAnalysis();
  }

  return (
    <Grid min="lg" gap={6} className="scam-xray">
      <Card variant="flat" className="scam-xray__form">
        <form onSubmit={submit} noValidate>
          <Stack gap={4}>
            <FormField
              id="scam-text"
              label="Suspicious message"
              hint="Review before sending. Harbour automatically hides common email, phone, ID, card-number, and one-time-code patterns in your browser; other private details may be missed."
            >
              {(field) => (
                <Textarea
                  {...field}
                  ref={inputRef}
                  value={text}
                  maxLength={8000}
                  rows={6}
                  placeholder="Paste a message, link or offer here…"
                  onChange={(event) => {
                    setText(event.target.value);
                    setState({ status: 'idle' });
                  }}
                />
              )}
            </FormField>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" loading={state.status === 'reading'} disabled={!text.trim()}>
                X-ray this message
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setText(SAMPLE_MESSAGE);
                  setState({ status: 'idle' });
                }}
              >
                Use fictional sample
              </Button>
              <Text role="label" tone="subtle" className="ms-auto">
                {text.length} / 8,000
              </Text>
            </div>
          </Stack>
        </form>
      </Card>

      <Card variant="flat" className="scam-xray__result">
        {state.status === 'idle' ? (
          <EmptyState
            icon={<ShieldAlert className="size-8 text-text-subtle" />}
            title="Your result will appear here"
          >
            We’ll explain patterns and offer cautious next steps.
          </EmptyState>
        ) : null}

        {state.status === 'reading' ? (
          <div
            className="scam-xray__busy"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <Stack gap={3}>
              <Text role="small" tone="muted">
                Looking for patterns…
              </Text>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </Stack>
          </div>
        ) : null}

        {state.status === 'error' ? (
          <Stack gap={6}>
            <ErrorState
              title="The check did not run"
              onRetry={runAnalysis}
              retryLabel="Try the check again"
            >
              Harbour is taking a breather. Nothing you pasted was kept, and you
              can run it again in a moment.
            </ErrorState>
            <SelfCheckCard />
          </Stack>
        ) : null}

        {state.status === 'result' ? (
          <article className="scam-xray__read">
            <Stack gap={4}>
              <div className="flex flex-wrap items-center gap-3">
                <DemoBadge variant="demo">basic keyword check</DemoBadge>
                <StatusBadge tone={TONE[state.scan.riskLevel]}>
                  {state.scan.riskLevel} risk
                </StatusBadge>
              </div>

              <Text role="small" tone="muted">
                Demo check only. This is not an AI review and cannot confirm
                whether a message is genuine.
              </Text>

              <Heading level={3}>{state.scan.issue}</Heading>

              <Text>{state.scan.explanation}</Text>

              <RedactionNotice count={state.redactionCount} />

              <Grid min="md" gap={6}>
                <Stack gap={2}>
                  <Text role="label" tone="subtle">
                    Signals to notice
                  </Text>
                  <Stack as="ul" gap={2}>
                    {state.scan.warningSigns.map((sign) => (
                      <li key={sign} className="type-small text-text-muted">
                        {sign}
                      </li>
                    ))}
                  </Stack>
                </Stack>
                <Stack gap={2}>
                  <Text role="label" tone="subtle">
                    What you can do
                  </Text>
                  <Stack as="ul" gap={2}>
                    {state.scan.actions.map((action) => (
                      <li key={action} className="type-small text-text-muted">
                        {action}
                      </li>
                    ))}
                  </Stack>
                </Stack>
              </Grid>

              <p className="type-small text-text-muted">
                NEED A SECOND OPINION?{' '}
                <strong className="text-text">{state.scan.support.name}</strong>{' '}
                ·{' '}
                <a
                  href={`tel:${state.scan.support.phone}`}
                  className="text-accent-text underline"
                >
                  {state.scan.support.phone}
                </a>
              </p>

              <Button asChild variant="secondary">
                <Link
                  to="/app/checklist"
                  state={{ checklistSuggestion: CHECKLIST_SUGGESTION }}
                >
                  <ListChecks />
                  Add a verification step to your checklist
                </Link>
              </Button>
            </Stack>
          </article>
        ) : null}
      </Card>
    </Grid>
  );
}

/**
 * The error state's offline alternative — the old build's `ServiceError`
 * content: the red flags to check by hand, and who to call. Ported verbatim,
 * including the ADCC and Scameter+ links.
 */
function SelfCheckCard(): JSX.Element {
  return (
    <Stack gap={4} className="scam-selfcheck">
      <Text role="label" tone="subtle">
        While you wait, check these yourself
      </Text>
      <Stack as="ul" gap={2}>
        {RED_FLAGS.map((flag) => (
          <li key={flag} className="type-small text-text-muted">
            {flag}
          </li>
        ))}
      </Stack>
      <Stack gap={2}>
        <p className="type-small text-text-muted">
          <strong className="text-text">ADCC Anti-Scam Helpline</strong>{' '}
          <a href="tel:18222" className="text-accent-text underline">
            18222 · call for advice
          </a>
        </p>
        <p className="type-small text-text-muted">
          <strong className="text-text">Police Scameter+</strong>{' '}
          <a
            href="https://www.adcc.gov.hk/en-hk/alerts-detail/alerts-1805163751902826497.html"
            target="_blank"
            rel="noreferrer"
            className="text-accent-text underline"
          >
            Check suspicious details ↗
          </a>
        </p>
      </Stack>
    </Stack>
  );
}
