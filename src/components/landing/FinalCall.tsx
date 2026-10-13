import { Link } from 'react-router-dom';
import { Cluster, Heading, Section, Stack, Text } from '../layout';
import { Button } from '../ui';

/**
 * The final call — Addendum 1 §4.
 *
 * Left-aligned like every other section: the page's one centred moment is the
 * hero's shape, and centring everything is one of the things the design
 * context explicitly rules out. The footer follows immediately, so the
 * emergency numbers are one glance past this band.
 */
export function FinalCall(): JSX.Element {
  return (
    <Section aria-labelledby="final-heading">
      <Stack gap={6}>
        <Heading level={2} id="final-heading">
          Come in from the storm.
        </Heading>
        <Text tone="muted">
          Create a profile to keep your list, your phrases and your progress —
          or look around first.
        </Text>
        <Cluster gap={3}>
          <Button asChild size="large">
            <Link to="/signup">Create your profile</Link>
          </Button>
          <Button asChild variant="ghost" size="large">
            <Link to="/login">Log in</Link>
          </Button>
        </Cluster>
      </Stack>
    </Section>
  );
}
