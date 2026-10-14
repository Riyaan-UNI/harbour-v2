import { BentoItem, Cluster, Heading, Stack, Text } from '../layout';
import { Card, CardContent, CardHeader } from '../ui/card';
import { DemoBadge } from '../ui/demo-badge';
import { StatusBadge } from '../ui/status-badge';

/**
 * ImpactPanel — module 11. Anonymous community counters.
 *
 * The counters are DEMO (Appendix B), and they are withheld until enough
 * students have used a tool, so no single person can be identified. Rather than
 * invent a number, the panel shows its real below-threshold state: the counter
 * labels with their values withheld (`—`) and the threshold explained. Nothing
 * here is a live total, and the DemoBadge says so permanently.
 */

const COUNTERS = [
  'Listings checked',
  'Leases read',
  'Counter cards made',
  'Drills completed',
];

/** The display threshold the legacy impact panel uses. */
const MIN_DISPLAY = 5;

export function ImpactPanel(): JSX.Element {
  return (
    <BentoItem size="half" className="dash-lower">
      <Card variant="flat">
        <CardHeader>
          <Cluster justify="between" align="center" gap={3}>
            <Text role="label" tone="muted">
              Community impact
            </Text>
            <DemoBadge variant="demo" />
          </Cluster>
          <Heading level={2}>What Harbour has helped with.</Heading>
        </CardHeader>

        <CardContent>
          {/* In a Stack column, a bare badge would stretch to the card width and
              read as a bar, so it sits in a Cluster that sizes to its content. */}
          <Cluster>
            <StatusBadge tone="info">Anonymous totals</StatusBadge>
          </Cluster>

          <Stack as="ul" gap={2}>
            {COUNTERS.map((counter) => (
              <Cluster as="li" key={counter} justify="between" align="center" gap={3}>
                <Text role="small">{counter}</Text>
                <Text role="small" tone="subtle">
                  —
                </Text>
              </Cluster>
            ))}
          </Stack>

          <Text role="small" tone="muted">
            Totals appear here once enough students have used a tool. Nothing is
            shown below {MIN_DISPLAY}, so no single person can be identified.
            Counts are anonymous and carry no identifiers.
          </Text>
        </CardContent>
      </Card>
    </BentoItem>
  );
}
