import { AuroraPatch } from '../AuroraPatch';
import { Cluster, Heading, Section, Text } from '../layout';
import { Card, Chip, Disclaimer } from '../ui';

/**
 * The rental band — Addendum 1 §4.
 *
 * Its own band rather than a card row, because rental is the one tool that
 * carries money. The colour field is a contained patch at the default cap
 * (0.29 in dark), which is the safe variant: a patch is always covered by
 * glass, and the glass tint is what keeps text legible. The glass card sits
 * inside it — never glass on glass.
 *
 * No statistics: the addendum forbids claiming how common rental scams are
 * without a source, and the small print keeps the legal disclaimer standing.
 */
export function RentalBand(): JSX.Element {
  return (
    <Section aria-labelledby="rental-heading">
      <AuroraPatch variant="default">
        <Card variant="static">
          <Heading level={2} id="rental-heading">
            Before you pay a deposit.
          </Heading>
          <Text tone="muted">
            Check a listing for warning signs, read your lease clause by
            clause, and know the first-hour plan if something goes wrong.
          </Text>
          <Cluster gap={3}>
            <Chip>Listing check</Chip>
            <Chip>Lease X-ray</Chip>
            <Chip>First-hour playbook</Chip>
          </Cluster>
          <Disclaimer>General information, not legal advice.</Disclaimer>
        </Card>
      </AuroraPatch>
    </Section>
  );
}
