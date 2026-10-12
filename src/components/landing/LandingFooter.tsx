import { ThemeToggle } from '../ThemeToggle';
import { Container, Cluster, Stack, Text } from '../layout';
import { Disclaimer, HarbourLogo, SafetyRail } from '../ui';

/**
 * The landing footer — Addendum 1 §4.
 *
 * Four things the addendum asks for, in order: the standing disclaimer, the
 * emergency numbers, the theme control, and the honesty statement about what
 * this prototype is. The numbers come from `SAFETY_CONTACTS`, which is still
 * marked UNVERIFIED — the rail says so on screen rather than quietly shipping
 * a number nobody has checked.
 *
 * Brick 3b deduplicated the legal disclaimer: the `Disclaimer` component covers
 * the same ground the extra paragraph did, so the paragraph is gone.
 */
export function LandingFooter(): JSX.Element {
  return (
    <footer className="landing-footer">
      <Container>
        <Stack gap={6}>
          <Cluster justify="between" align="center" gap={4}>
            <HarbourLogo size="md" />
            <ThemeToggle />
          </Cluster>

          <SafetyRail />

          <Disclaimer />

          <Text role="small" tone="subtle">
            This is a prototype. There are no accounts and no passwords: a
            profile lives on this device only, and nothing here sends your text
            anywhere until you ask it to.
          </Text>

          {import.meta.env.DEV && (
            <Text role="label" tone="subtle">
              Harbour · Brick 3b · landing page in progress
            </Text>
          )}
        </Stack>
      </Container>
    </footer>
  );
}
