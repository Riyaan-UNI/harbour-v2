import { Grid, Heading, Section, Stack, Text } from '../layout';
import { Card } from '../ui';

/**
 * Trust — Addendum 1 §4.
 *
 * Three claims, and each one is matched to what the prototype actually does
 * (spec §14): the profile store is device-local storage, redaction happens in
 * the browser before anything is sent, and there is no account system. Flat
 * cards, because this band is a statement rather than an interface.
 */

const POINTS = [
  {
    title: 'Your profile stays on this device',
    body: 'It is stored in your browser, not on a server. Logging out of the device clears it.',
  },
  {
    title: 'Pasted text is cleaned first',
    body: 'Emails, phone numbers, ID and card patterns are hidden in your browser before anything is sent, and Harbour tells you how many it hid.',
  },
  {
    title: 'No accounts, no passwords',
    body: 'This is a prototype. Nothing here asks you to sign up with an email or a password.',
  },
];

export function TrustBand(): JSX.Element {
  return (
    <Section id="trust" aria-labelledby="trust-heading">
      <Stack gap={8}>
        <Heading level={2} id="trust-heading">
          Built to be careful with you.
        </Heading>

        <Grid min="md" gap={6}>
          {POINTS.map((point) => (
            <Card variant="flat" key={point.title}>
              <Heading level={3}>{point.title}</Heading>
              <Text role="small" tone="muted">
                {point.body}
              </Text>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}
