import { BentoItem, Heading, Stack, Text } from '../layout';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Disclaimer } from '../ui/disclaimer';
import { SafetyRail } from '../ui/safety-rail';

/**
 * SafetyPanel — module 7. The safety numbers, one tap away, on the dashboard.
 *
 * The compact rail is a wrapping row of real `tel:` pills at the touch target,
 * each with an accessible name. The numbers themselves and their UNVERIFIED
 * provenance live in `safety-contacts.ts` and are carried in the source.
 */

export function SafetyPanel(): JSX.Element {
  return (
    <BentoItem size="third" className="dash-panel">
      <Card variant="flat">
        <CardHeader>
          <Text role="label" tone="muted">
            If you need help
          </Text>
          <Heading level={2}>Someone is here.</Heading>
        </CardHeader>

        <CardContent>
          <SafetyRail variant="compact" />
          <Stack gap={2}>
            <Text role="small" tone="muted">
              Tap a number to call. These lines are staffed, and calling them is
              free.
            </Text>
            <Disclaimer />
          </Stack>
        </CardContent>
      </Card>
    </BentoItem>
  );
}
