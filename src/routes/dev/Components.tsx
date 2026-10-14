import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Aurora } from '../../components/Aurora';
import { AuroraPatch } from '../../components/AuroraPatch';
import { HeroCta } from '../../components/landing';
import { ThemeToggle } from '../../components/ThemeToggle';
import {
  Cluster,
  Grid,
  Heading,
  Section,
  Stack,
  Text,
} from '../../components/layout';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Chip,
  DemoBadge,
  Disclaimer,
  EmptyState,
  ErrorState,
  FormField,
  HarbourLogo,
  HarbourMark,
  Input,
  InteractiveCard,
  ProgressRing,
  RedactionNotice,
  SafetyRail,
  Skeleton,
  StatusBadge,
  Textarea,
  UNIVERSITIES,
  UniversityLogo,
  toast,
  type HarbourLogoVariant,
} from '../../components/ui';
import { AlertTriangle, CheckCircle, InfoCircle, ShieldAlert } from '../../components/ui/icons';
import { publicUrl } from '../../lib/public-url';
import { useResolvedTheme } from '../../theme/useTheme';

/**
 * /dev/components — Brick 2a.
 *
 * Every shared component in every state, in both themes, behind the dev flag.
 * Structure is the layout primitives and nothing else; the components
 * themselves are the only things that carry a class.
 *
 * Hover, active and focus-visible are live states, not pictures: the buttons in
 * "Interaction states" are real, and the Playwright pass focuses and presses
 * them. Everything that can be shown statically is.
 */

function Block({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <Section>
      <Stack gap={6}>
        <Stack gap={2}>
          <Heading level={2}>{title}</Heading>
          <Text role="small" tone="muted">
            {description}
          </Text>
        </Stack>
        {children}
      </Stack>
    </Section>
  );
}

/** A caption above a demo cluster. */
function Row({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <Stack gap={3}>
      <Text role="label" tone="muted">
        {label}
      </Text>
      {children}
    </Stack>
  );
}

const BUTTON_VARIANTS = ['primary', 'secondary', 'ghost', 'danger'] as const;
const BUTTON_SIZES = ['default', 'large', 'small'] as const;
const STATUS_TONES = ['red', 'amber', 'green', 'info'] as const;
const DEMO_VARIANTS = ['simulation', 'demo', 'sample'] as const;
const LOGO_SIZES = ['sm', 'md', 'lg'] as const;

/**
 * One lockup, shown where it actually has to work: on the nav's glass bar, on
 * the footer's plain surface, and at the three sizes the size class defines.
 * `testId` namespaces the boxes so a test can measure each one.
 */
function LogoSample({
  variant,
  testId,
}: {
  variant: HarbourLogoVariant;
  testId: string;
}): JSX.Element {
  return (
    <Stack gap={4}>
      <div className="glass glass--bar px-4">
        <Cluster justify="between" align="center" gap={4} className="py-3">
          <span data-testid={`${testId}-nav`}>
            <HarbourLogo variant={variant} />
          </span>
          <Text role="label" tone="muted">
            over the nav glass
          </Text>
        </Cluster>
      </div>

      <div className="border-border border-t px-4 pt-4">
        <Cluster justify="between" align="center" gap={4}>
          <span data-testid={`${testId}-footer`}>
            <HarbourLogo variant={variant} />
          </span>
          <Text role="label" tone="muted">
            over the footer
          </Text>
        </Cluster>
      </div>

      <Cluster gap={6} align="end">
        {LOGO_SIZES.map((size) => (
          <span key={size} data-testid={`${testId}-${size}`}>
            <HarbourLogo variant={variant} size={size} />
          </span>
        ))}
      </Cluster>
    </Stack>
  );
}

export function Components(): JSX.Element {
  const resolved = useResolvedTheme();

  return (
    <>
      <Aurora />

      <main className="layer-raised">
        <Section>
          <Cluster as="header" justify="between" align="start" gap={6}>
            <Stack gap={3}>
              <Text role="label" tone="muted">
                Harbour · Bricks 2a + 4
              </Text>
              <Heading level={1}>Shared components</Heading>
              <Text tone="muted">
                Every component, every variant, every state, in both themes.
                Currently rendering the{' '}
                <strong className="text-text font-semibold">{resolved}</strong>{' '}
                theme.
              </Text>
              <Link
                to="/dev"
                className="text-accent-text hover:text-text inline-flex items-center text-sm font-medium transition-colors"
              >
                ← Dev hub
              </Link>
            </Stack>
            <ThemeToggle />
          </Cluster>
        </Section>

        <Block
          title="Harbour logo"
          description="Two candidates, each shown on the nav's glass bar, on the footer's plain surface, and at 1.5 / 2 / 3rem. Candidate 1 is the mark plus the name in the heading face; candidate 2 is the supplied 510x128 lockup, inlined with its viewBox kept and its five baked colours mapped onto tokens. Candidate 1 is the one the product uses, because the supplied wordmark is a Georgia serif and the rest of the product is set in Bricolage Grotesque — a serif lockup beside a grotesque heading is two voices in one bar. Both variants are token-driven, so both follow the theme. The sun is the one colour that could not be kept gold: see the note under the samples."
        >
          <Stack gap={8}>
            <Row label="candidate 1 — the mark plus a live wordmark in the heading face (chosen)">
              <LogoSample variant="live" testId="logo-live" />
            </Row>

            <Row label="candidate 2 — the supplied lockup, kept as a variant">
              <LogoSample variant="supplied" testId="logo-supplied" />
            </Row>

            <Row label="the mark alone, named and decorative">
              <Cluster gap={6} align="center">
                <span data-testid="logo-mark-named">
                  <HarbourMark label="Harbour" className="size-12" />
                </span>
                <HarbourMark className="size-6" />
                <Text role="small" tone="muted">
                  Left: the mark with a name, so it is announced. Right: the
                  same mark with no name, which is how it sits beside a visible
                  wordmark — hidden from assistive technology, not repeated.
                </Text>
              </Cluster>
            </Row>

            <Card variant="flat">
              <CardHeader>
                <CardTitle>The sun is not gold any more, and it cannot be</CardTitle>
              </CardHeader>
              <CardContent>
                <Text role="small" tone="muted">
                  The disc has to be <code className="text-text">--accent-fill</code>:
                  it is the only token that is dark on the light theme&apos;s
                  nav glass and light on the dark theme&apos;s, so it is the
                  only way one mark clears 3:1 on both. Its ink is therefore{' '}
                  <code className="text-text">--on-accent</code>, the same
                  pairing the Button uses. That leaves the sun, and gold fails
                  on it: <code className="text-text">--gold-fill</code> is{' '}
                  <code className="text-text">#F1C96F</code> in both themes, so
                  on the dark theme&apos;s disc it measures 1.01:1. No other
                  disc rescues it either — the disc needs a luminance of at
                  least 0.19 to clear 3:1 against the dark nav glass, and gold
                  needs it at most 0.172 to clear 3:1 on the disc. The two are
                  mutually exclusive, so the sun takes the disc&apos;s ink. The
                  gold survives in the archived original and nowhere else.
                </Text>
              </CardContent>
            </Card>
          </Stack>
        </Block>

        <Block
          title="Button"
          description="Four variants, three sizes, five states. The small size is 2.25rem on a fine pointer and 2.75rem on a coarse one, so a touch target never shrinks. Loading keeps the width: the label stays in the layout, made invisible, and the spinner is centred over it."
        >
          <Stack gap={6}>
            <Row label="variants">
              <Cluster gap={3}>
                {BUTTON_VARIANTS.map((variant) => (
                  <Button key={variant} variant={variant}>
                    {variant}
                  </Button>
                ))}
              </Cluster>
            </Row>

            <Row label="sizes">
              <Cluster gap={3} align="center">
                {BUTTON_SIZES.map((size) => (
                  <Button key={size} size={size}>
                    size {size}
                  </Button>
                ))}
              </Cluster>
            </Row>

            <Row label="states">
              <Cluster gap={3} align="center">
                <Button>Default</Button>
                <Button>Saving</Button>
                <Button loading>Saving</Button>
                <Button disabled>Disabled</Button>
                <Button variant="secondary" loading>
                  Loading
                </Button>
                <Button variant="ghost" disabled>
                  Disabled ghost
                </Button>
              </Cluster>
            </Row>

            <Row label="with an icon, and as a link (asChild)">
              <Cluster gap={3} align="center">
                <Button>
                  <CheckCircle />
                  Confirm
                </Button>
                <Button variant="secondary" asChild>
                  <a href="#components">A link styled as a button</a>
                </Button>
              </Cluster>
            </Row>

            <Row label="interaction states — hover, focus and press these">
              <Cluster gap={3} align="center">
                <Button>Hover me</Button>
                <Button variant="secondary">Focus me with Tab</Button>
                <Button variant="ghost">Press me</Button>
                <Button variant="danger">Careful</Button>
              </Cluster>
            </Row>
          </Stack>
        </Block>

        <Block
          title="Input, Textarea and FormField"
          description="Label above, helper text below, error below that with the danger token and an icon. The control is wired to both through aria-describedby, and aria-invalid drives the red border, so the look and the semantics cannot disagree. These demos use the flat card: glass is reserved for the Card section, because the spec allows at most three glass surfaces on screen at once."
        >
          <Grid min="md" gap={6}>
            <Card variant="flat">
              <CardHeader>
                <CardTitle>Default, with a hint</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  id="demo-nickname"
                  label="What should we call you?"
                  hint="You do not have to use your real name."
                >
                  {(props) => <Input {...props} placeholder="Nickname" />}
                </FormField>
              </CardContent>
            </Card>

            <Card variant="flat">
              <CardHeader>
                <CardTitle>Error, and required</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  id="demo-country"
                  label="Where are you from?"
                  required
                  error="Pick a country from the list."
                >
                  {(props) => <Input {...props} defaultValue="H" />}
                </FormField>
              </CardContent>
            </Card>

            <Card variant="flat">
              <CardHeader>
                <CardTitle>Textarea</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  id="demo-message"
                  label="Paste a message to check"
                  hint="Nothing leaves this device."
                >
                  {(props) => (
                    <Textarea {...props} placeholder="Paste the message here" />
                  )}
                </FormField>
              </CardContent>
            </Card>

            <Card variant="flat">
              <CardHeader>
                <CardTitle>Disabled</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField id="demo-disabled" label="Saved value">
                  {(props) => <Input {...props} defaultValue="Locked" disabled />}
                </FormField>
              </CardContent>
            </Card>
          </Grid>
        </Block>

        <Block
          title="Card"
          description="Static is glass, interactive is glass with the full spec section 8 behaviour, flat is a hairline with no glass — which is why flat uses the border-strong token, held to 3:1 because the border is its only boundary. A card never sits inside a card, and the three glass cards here are the maximum the spec allows on screen at once, so every other demo on this page uses the flat variant."
        >
          <AuroraPatch>
            <Stack gap={6}>
              <Grid min="md" gap={6}>
                <Card>
                  <CardHeader>
                    <CardTitle>Static</CardTitle>
                    <CardDescription>
                      The plain glass card, over its own colour field.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Chip>SAMPLE</Chip>
                  </CardFooter>
                </Card>

                <InteractiveCard
                  title="Interactive card"
                  description="Hover it, or Tab to the trigger — the card lifts, its border deepens and the spotlight follows the pointer."
                  footer={<Chip>SAMPLE</Chip>}
                  details={
                    <>
                      <Text role="small" tone="muted">
                        This is the expanded state. It is a Radix dialog, so
                        Escape closes it, focus is trapped inside and then
                        returned to the card, and the page behind cannot
                        scroll. Motion&apos;s shared layout is what makes it
                        read as the same card growing rather than a second one
                        appearing.
                      </Text>
                      <Text role="small" tone="muted">
                        On a touch device a tap does the same thing, and the
                        tilt is off: it is only enabled while
                        <code className="text-text"> (hover: hover)</code> and
                        <code className="text-text"> (pointer: fine)</code>
                        both match and motion is allowed.
                      </Text>
                    </>
                  }
                >
                  <Text role="small" tone="muted">
                    Click or tap anywhere on the card to expand it in place.
                    Nothing here depends on hover.
                  </Text>
                </InteractiveCard>

                <Card variant="flat">
                  <CardHeader>
                    <CardTitle>Flat</CardTitle>
                    <CardDescription>
                      A hairline and nothing else. The border is the whole
                      surface, so it clears 3:1.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Text role="small" tone="muted">
                      No glass, no shadow, no fill.
                    </Text>
                  </CardContent>
                </Card>
              </Grid>

              <Row label="interactive, without the expand — spotlight and tilt only">
                <InteractiveCard
                  title="Interactive card without details"
                  description="Omitting `details` leaves the spotlight and the tilt and drops the expand."
                >
                  <Text role="small" tone="muted">
                    Move the pointer across this card to see the spotlight
                    follow it. With a fine pointer the card tilts by at most
                    six degrees, the cap held in the `--tilt-max` token.
                  </Text>
                </InteractiveCard>
              </Row>
            </Stack>
          </AuroraPatch>
        </Block>

        <Block
          title="Chip, StatusBadge and DemoBadge"
          description="Status is never colour alone: a badge carries a colour, an icon and a label. The demo badges are permanent honesty labels — a simulation is never presented as live."
        >
          <Stack gap={6}>
            <Row label="Chip">
              <Cluster gap={3}>
                <Chip>Listing check</Chip>
                <Chip>Lease X-ray</Chip>
                <Chip variant="accent">Accent</Chip>
                <Chip variant="gold">Gold</Chip>
                <Chip asChild variant="neutral">
                  <a href="#components">A chip that is a link</a>
                </Chip>
              </Cluster>
            </Row>

            <Row label="StatusBadge — four risk tones">
              <Cluster gap={3}>
                {STATUS_TONES.map((tone) => (
                  <StatusBadge key={tone} tone={tone} />
                ))}
                <StatusBadge tone="amber">Watch this</StatusBadge>
              </Cluster>
            </Row>

            <Row label="DemoBadge — simulation, demo, sample">
              <Cluster gap={3}>
                {DEMO_VARIANTS.map((variant) => (
                  <DemoBadge key={variant} variant={variant} />
                ))}
                <DemoBadge variant="simulation">no call is placed</DemoBadge>
              </Cluster>
            </Row>

            <Row label="Badges and icons, in context">
              <Cluster gap={3}>
                <StatusBadge tone="red">
                  <ShieldAlert />
                  High risk
                </StatusBadge>
                <StatusBadge tone="amber">
                  <AlertTriangle />
                  Caution
                </StatusBadge>
                <StatusBadge tone="green">
                  <CheckCircle />
                  Clear
                </StatusBadge>
                <StatusBadge tone="info">
                  <InfoCircle />
                  Note
                </StatusBadge>
              </Cluster>
            </Row>
          </Stack>
        </Block>

        <Block
          title="HeroCta"
          description="The hero's call to action in both states. `savedNickname` is a prop rather than a hook call, so both can be shown side by side without a profile store to fake — the landing passes whatever useSavedProfile returns, which is null until Brick 6."
        >
          <Grid min="md" gap={6}>
            <Card variant="flat">
              <CardHeader>
                <CardTitle>New visitor — savedNickname is null</CardTitle>
                <CardDescription>
                  Create your profile, and a way to see how it works.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HeroCta />
              </CardContent>
            </Card>

            <Card variant="flat">
              <CardHeader>
                <CardTitle>Returning — a saved nickname</CardTitle>
                <CardDescription>
                  Continue as the nickname, plus a way out, because the landing
                  page cannot know who is at the browser.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HeroCta savedNickname="Mei" />
              </CardContent>
            </Card>
          </Grid>
        </Block>

        <Block
          title="Disclaimer"
          description="The standing line. General information, not advice, and not an emergency service."
        >
          <Card variant="flat">
            <Disclaimer />
          </Card>
        </Block>

        <Block
          title="Skeleton, EmptyState and ErrorState"
          description="The four states of a data screen. Loading is a calm shimmer, never a spinner; the empty state is warm and offers a next step; the error state offers a retry and an offline alternative."
        >
          <Grid min="md" gap={6}>
            <Card variant="flat">
              <CardHeader>
                <CardTitle>Loading</CardTitle>
              </CardHeader>
              <CardContent aria-busy="true">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>

            <Card variant="flat">
              <EmptyState
                title="Nothing here yet"
                icon={<InfoCircle className="text-accent-text size-8" />}
                action={
                  <Button size="small">
                    <CheckCircle />
                    Start your list
                  </Button>
                }
              >
                Your settle-in list is empty. Add the first small step and it
                will be waiting for you tomorrow.
              </EmptyState>
            </Card>

            <Card variant="flat">
              <ErrorState
                title="Harbour is taking a breather"
                onRetry={() => {
                  toast('Retrying…');
                }}
                offline="Without a connection, you can still use the settle-in list and the Cantonese helper — both work on this device."
              >
                The request did not come back. Nothing was lost.
              </ErrorState>
            </Card>
          </Grid>
        </Block>

        <Block
          title="Toast"
          description="Sonner, themed with tokens, 4s, polite live region. Success and error recolour the icon only; the toast surface stays the elevated surface so the text contrast never changes."
        >
          <Cluster gap={3}>
            <Button
              variant="secondary"
              onClick={() => {
                toast('Saved to this device.');
              }}
            >
              Plain toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                toast.success('Profile saved.');
              }}
            >
              Success toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                toast.error('Could not save. Try again.');
              }}
            >
              Error toast
            </Button>
          </Cluster>
        </Block>

        <Block
          title="Avatar"
          description="One or two initials on a chart colour at 20% alpha, with the text token on top. The colour follows the tone, so a person keeps the same colour everywhere."
        >
          <Stack gap={6}>
            <Row label="sizes">
              <Cluster gap={3} align="center">
                <Avatar name="Mei Lin" size="sm" />
                <Avatar name="Mei Lin" size="md" />
                <Avatar name="Mei Lin" size="lg" />
              </Cluster>
            </Row>
            <Row label="chart tones 1 to 5">
              <Cluster gap={3} align="center">
                {[1, 2, 3, 4, 5].map((tone) => (
                  <Avatar key={tone} name="Harbour Student" tone={tone} />
                ))}
              </Cluster>
            </Row>
            <Row label="beside a name (decorative), and named for a screen reader">
              <Cluster gap={6} align="center">
                <Cluster gap={2} align="center">
                  <Avatar name="Mei Lin" />
                  <Text role="small">Mei Lin</Text>
                </Cluster>
                <Avatar name="Kwok Ho" tone={3} label="Kwok Ho" />
              </Cluster>
            </Row>
          </Stack>
        </Block>

        <Block
          title="UniversityLogo"
          description="A square box on a white plate in both themes, radius md at 3rem and sm at 2rem and 2.5rem. The nine boxes below are built from the typed manifest, so the ids, names and acronyms are spec section 10's table. No logo file is bundled yet — a search of public/, src/assets/ and the previous build found no university artwork — so every box falls back to its acronym with no layout shift, which is the behaviour the last box proves on purpose."
        >
          <Stack gap={6}>
            <Row label="all nine, from the manifest (spec §10)">
              <Cluster gap={4} align="center">
                {UNIVERSITIES.map((university) => (
                  <span
                    key={university.id}
                    data-testid={`uni-logo-${university.id}`}
                    className="inline-flex"
                  >
                    <UniversityLogo id={university.id} size="md" />
                  </span>
                ))}
              </Cluster>
            </Row>

            <Row label="art variant — concept art per id, decorative (no plate)">
              <Cluster gap={4} align="center">
                {UNIVERSITIES.filter((university) => university.art !== null).map((university) => (
                  <span
                    key={university.id}
                    data-testid={`uni-art-${university.id}`}
                    className="inline-flex"
                  >
                    <UniversityLogo id={university.id} size="md" variant="art" />
                  </span>
                ))}
              </Cluster>
            </Row>

            <Row label="sizes — 2rem / 2.5rem / 3rem">
              <Cluster gap={6} align="center">
                <UniversityLogo id="hku" size="sm" />
                <UniversityLogo id="cuhk" size="md" />
                <UniversityLogo id="hkust" size="lg" />
              </Cluster>
            </Row>

            <Row label="error fallback, on purpose">
              <Cluster gap={6} align="center">
                <span data-testid="logo-missing" className="inline-flex">
                  <UniversityLogo
                    src={publicUrl('/logos/does-not-exist.svg')}
                    name="City University of Hong Kong"
                    acronym="CityU"
                    size="lg"
                  />
                </span>
                <span data-testid="logo-generic" className="inline-flex">
                  <UniversityLogo id="other" size="lg" />
                </span>
              </Cluster>
            </Row>
          </Stack>
        </Block>

        <Block
          title="SafetyRail"
          description="999, the Anti-Scam Helpline, Immigration enquiries and the Hospital Authority line, as tel: links. Every number is marked UNVERIFIED in the source until it is checked against the official page. Compact for a bar, expanded for a page."
        >
          <Stack gap={6}>
            <Row label="compact">
              <SafetyRail />
            </Row>
            <Row label="expanded">
              <Card variant="flat" className="max-w-measure">
                <SafetyRail variant="expanded" />
              </Card>
            </Row>
          </Stack>
        </Block>

        <Block
          title="RedactionNotice"
          description="Privacy is demonstrated. It reports how many identifiers were hidden in the browser, and it always carries the caveat that patterns can miss things — including when the count is zero."
        >
          <Stack gap={4} className="max-w-measure">
            <Card variant="flat">
              <RedactionNotice count={3} />
            </Card>
            <Card variant="flat">
              <RedactionNotice count={1} />
            </Card>
            <Card variant="flat">
              <RedactionNotice count={0} />
            </Card>
          </Stack>
        </Block>
        <Block
          title="Progress ring"
          description="The progress indicator from Brick 2b, built in Brick 4 for the landing's Settle-in sample. The ring is decorative and static — it never animates, and the caller's words carry the number, because a progress indicator is never the only carrier of meaning (Addendum 1 rule 4). The value is clamped, not asserted."
        >
          <Stack gap={6}>
            <Row label="sizes, each at a third of progress">
              <Cluster gap={6} align="center">
                <ProgressRing value={1 / 3} size="sm" />
                <ProgressRing value={1 / 3} size="md" />
                <ProgressRing value={1 / 3} size="lg" />
              </Cluster>
            </Row>
            <Row label="values, with the words that carry them">
              <Cluster gap={6} align="center">
                <Cluster gap={3} align="center">
                  <ProgressRing value={0} size="md" />
                  <Text role="small">0 of 3 done</Text>
                </Cluster>
                <Cluster gap={3} align="center">
                  <ProgressRing value={2 / 3} size="md" />
                  <Text role="small">2 of 3 done</Text>
                </Cluster>
                <Cluster gap={3} align="center">
                  <ProgressRing value={1} size="md" />
                  <Text role="small">3 of 3 done</Text>
                </Cluster>
              </Cluster>
            </Row>
            <Row label="out-of-range values, clamped">
              <Cluster gap={6} align="center">
                <ProgressRing value={-2} size="sm" />
                <ProgressRing value={7} size="sm" />
                <ProgressRing value={Number.NaN} size="sm" />
                <Text role="small" tone="muted">
                  Negative, over one and NaN all clamp to a real ring rather
                  than an error.
                </Text>
              </Cluster>
            </Row>
          </Stack>
        </Block>
      </main>
    </>
  );
}
