import { ThemeToggle } from '../ThemeToggle';
import { Container, Cluster, Stack, Text } from '../layout';
import { Disclaimer, SafetyRail } from '../ui';

/**
 * The landing footer — Addendum 1 §4.
 *
 * Four things the addendum asks for, in order: the standing disclaimer, the
 * emergency numbers, the theme control, and the honesty statement about what
 * this prototype is. The numbers come from `SAFETY_CONTACTS`, which is still
 * marked UNVERIFIED — the rail says so on screen rather than quietly shipping
 * a number nobody has checked.
 */
export function LandingFooter(): JSX.Element {
  return (
    <footer className="landing-footer">
      <Container>
        <Stack gap={6}>
          <Cluster justify="between" align="center" gap={4}>
            <span className="landing-nav__wordmark">Harbour</span>
            <ThemeToggle />
          </Cluster>

          <SafetyRail />

          <Disclaimer />

          <Text role="small" tone="subtle">
            Harbour is guidance, not an emergency service, and not legal,
            financial or medical advice. It does not verify any listing, person
            or message. In an emergency, call 999.
          </Text>

          <Text role="small" tone="subtle">
            This is a prototype. There are no accounts and no passwords: a
            profile lives on this device only, and nothing here sends your text
            anywhere until you ask it to.
          </Text>

          <Text role="label" tone="subtle">
            Harbour · Brick 3 · landing page in progress
          </Text>
        </Stack>
      </Container>
    </footer>
  );
}
