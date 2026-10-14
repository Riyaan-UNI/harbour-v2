import { Link } from 'react-router-dom';
import { BentoItem, Heading, Text } from '../layout';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { ArrowRight } from '../ui/icons';

/**
 * NudgeCard — module 5. One calm next step, and the way to take it.
 *
 * A flat card, not an expandable one: a nudge is not a place to hide content
 * behind a click (§5). The only action is a real link to the profile page.
 */

export function NudgeCard(): JSX.Element {
  return (
    <BentoItem size="third" className="dash-panel">
      <Card variant="flat">
        <CardHeader>
          <Text role="label" tone="muted">
            A good next step
          </Text>
          <Heading level={2}>Make this space feel like yours.</Heading>
        </CardHeader>

        <CardContent>
          <Text tone="muted">
            Add a photo, a few profile details, and the social handles you would
            like to share. Everything stays on this device.
          </Text>
          <Button asChild>
            <Link to="/app/profile">
              Edit my profile
              <ArrowRight />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </BentoItem>
  );
}
