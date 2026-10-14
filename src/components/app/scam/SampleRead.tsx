import { Stack, Text } from '../../layout';
import { Heading } from '../../layout';
import { DemoBadge, StatusBadge } from '../../ui';
import { screenScam } from '../../../lib/features/scam/keywordScreen';
import { SAMPLE_MESSAGE } from '../../../lib/features/scam/sample';
import type { RiskLevel } from '../../../lib/features/scam/types';
import { RiskMeter } from './RiskMeter';

/**
 * SampleRead — "What a read looks like".
 *
 * The honest stand-in for the inspiration page's analytics mock: a fictional
 * message, the read the keyword screen actually returns for it, and a
 * permanent SAMPLE badge. Nothing here pretends to be a live service — it is
 * the tool's own engine, run on the old build's fictional sample text, so the
 * example can never drift from what the tool really does.
 *
 * The message is plain text on purpose: the old build's sample carries a
 * deliberately unclickable `hxxps://` scheme, and it must stay unclickable
 * here (the e2e spec asserts zero anchors inside this block).
 */

const TONE: Record<RiskLevel, 'red' | 'amber' | 'green'> = {
  High: 'red',
  Medium: 'amber',
  Low: 'green',
};

export function SampleRead(): JSX.Element {
  // Run the real screen so the sample can never disagree with the tool.
  const read = screenScam(SAMPLE_MESSAGE);

  return (
    <Stack gap={4} className="scam-sample">
      <Stack gap={2}>
        <DemoBadge variant="sample">fictional message</DemoBadge>
        <Heading level={2}>What a read looks like</Heading>
      </Stack>

      <p className="scam-sample__message type-small text-text-muted">
        {SAMPLE_MESSAGE}
      </p>

      <Stack gap={3} className="scam-sample__read">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge tone={TONE[read.riskLevel]}>
            {read.riskLevel} risk
          </StatusBadge>
          <RiskMeter level={read.riskLevel} matched={1} />
        </div>

        <Text>
          <strong className="text-text">{read.issue}.</strong>{' '}
          {read.explanation}
        </Text>

        <Stack as="ul" gap={2} className="scam-sample__signs">
          {read.warningSigns.map((sign) => (
            <li key={sign} className="type-small text-text-muted">
              {sign}
            </li>
          ))}
        </Stack>

        <Text role="small" tone="muted">
          <strong className="text-text">What you can do:</strong>{' '}
          {read.actions.join(' ')}
        </Text>
      </Stack>
    </Stack>
  );
}
