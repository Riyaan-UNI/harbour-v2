import { useState } from 'react';
import { BentoItem, Cluster, Heading, Stack, Text, VisuallyHidden } from '../layout';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { DemoBadge } from '../ui/demo-badge';
import { Disclaimer } from '../ui/disclaimer';

/**
 * TideBankCard — module 10. A masked demo balance, revealed on demand.
 *
 * The balance is DEMO and carries **no monetary value**: it is a count of skill
 * points, never money, so it is never shown as a currency figure and never
 * summed with one. It is masked by default and the reveal is a real, focusable
 * button, so nothing here depends on hover.
 */

export type TideBankCardProps = {
  points: number;
};

export function TideBankCard({ points }: TideBankCardProps): JSX.Element {
  const [revealed, setRevealed] = useState(false);

  return (
    <BentoItem size="third" className="dash-panel">
      <Card variant="flat">
        <CardHeader>
          <Cluster justify="between" align="center" gap={2}>
            <Text role="label" tone="muted">
              Tide points
            </Text>
            <DemoBadge variant="demo" />
          </Cluster>
          <Heading level={2}>Teach an hour. Learn an hour.</Heading>
        </CardHeader>

        <CardContent>
          <Cluster gap={3} align="center">
            <p className="type-h2 dash-balance">
              <span aria-hidden="true">{revealed ? points : '•••'}</span>
              <VisuallyHidden>
                {revealed ? `${points} demo tide points` : 'Balance hidden'}
              </VisuallyHidden>
            </p>
            <Button
              size="small"
              variant="secondary"
              aria-pressed={revealed}
              onClick={() => setRevealed((value) => !value)}
            >
              {revealed ? 'Hide balance' : 'Reveal balance'}
            </Button>
          </Cluster>

          <Stack gap={2}>
            <Text role="small" tone="muted">
              Demo points for the skill swap. They are not money and cannot be
              bought or cashed out.
            </Text>
            <Disclaimer>
              Demo balance only. Tide points are not money, are not a financial
              product, and are not advice.
            </Disclaimer>
          </Stack>
        </CardContent>
      </Card>
    </BentoItem>
  );
}
