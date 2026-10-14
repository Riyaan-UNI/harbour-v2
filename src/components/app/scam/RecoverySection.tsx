import { Heading, Stack, Text } from '../../layout';
import { Disclaimer, SafetyRail } from '../../ui';

/**
 * RecoverySection — "If it already happened".
 *
 * The honest stand-in for the inspiration page's testimonial wall: instead of
 * invented people praising the product, the page spends its trust on the
 * moment that matters. Four calm steps, then the safety rail, then the
 * disclaimer that keeps them honest.
 *
 * The words are new but the facts are not: 18222 is the Police Anti-Scam
 * Helpline from the safety contacts (same UNVERIFIED flag as everywhere it
 * appears), and every step is general, non-judgemental guidance — the
 * product's standing voice (Addendum 1 rule 11).
 */

const STEPS = [
  {
    body: 'Call 18222, the Anti-Scam Helpline. It is free, and it is there for exactly this.',
    action: { label: 'Call 18222', href: 'tel:18222' },
  },
  {
    body: 'Contact your bank. If you shared card details or a one-time code, they can stop the payment.',
  },
  {
    body: 'Keep the evidence. Screenshots, the number, the link. Do not delete the messages.',
  },
  {
    body: 'Tell your university’s international office, or a friend you trust. Scammers count on you staying quiet.',
  },
] as const;

export function RecoverySection(): JSX.Element {
  return (
    <Stack gap={6} className="scam-recovery">
      <Stack gap={2}>
        <Heading level={2}>If it already happened</Heading>
        <Text role="body" tone="muted" className="max-w-measure">
          Money sent, details shared, a message answered. Do these four things,
          in this order. None of them is too late.
        </Text>
      </Stack>

      <Stack as="ol" gap={4} className="scam-recovery__steps">
        {STEPS.map((step, index) => (
          <li key={step.body} className="scam-recovery__step">
            <span
              className="scam-recovery__number type-label"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <Stack gap={2}>
              <Text role="small" tone="muted">
                {step.body}
              </Text>
              {'action' in step && step.action ? (
                <a
                  href={step.action.href}
                  className="type-small text-accent-text underline"
                >
                  {step.action.label}
                </a>
              ) : null}
            </Stack>
          </li>
        ))}
      </Stack>

      <SafetyRail variant="expanded" />
      <Disclaimer />
    </Stack>
  );
}
