import { Cluster, Heading, Stack, Text } from '../../layout';
import { Button } from '../../ui';

/**
 * FinalCall — the page's closing beat.
 *
 * Calm, like the rest of the voice: no countdown, no invented stakes. Both
 * buttons switch the page's own tab, so the "call to action" is the tool
 * itself rather than a detour.
 */

export type FinalCallProps = {
  onXray: () => void;
  onDrill: () => void;
};

export function FinalCall({ onXray, onDrill }: FinalCallProps): JSX.Element {
  return (
    <Stack gap={4} align="center" className="scam-final">
      <Heading level={2}>Take it one message at a time.</Heading>
      <Text role="body" tone="muted" className="max-w-measure">
        Check a message, or practise a scam first. Nothing you paste is kept.
      </Text>
      <Cluster gap={3} justify="center">
        <Button onClick={onXray}>Check a message</Button>
        <Button variant="secondary" onClick={onDrill}>
          Practise a scam
        </Button>
      </Cluster>
    </Stack>
  );
}
