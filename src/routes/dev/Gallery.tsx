import { useEffect, useState, type ReactNode } from 'react';
import { Aurora } from '../../components/Aurora';
import { AuroraPatch } from '../../components/AuroraPatch';
import { ThemeToggle } from '../../components/ThemeToggle';
import {
  Cluster,
  Grid,
  Heading,
  Section,
  Stack,
  Text,
} from '../../components/layout';
import { THEME_CHANGE_EVENT } from '../../theme/theme';
import { useResolvedTheme } from '../../theme/useTheme';
import { cn } from '../../lib/cn';

/* -------------------------------------------------------------------------- */
/* Data — module level so hook dependencies stay referentially stable.         */
/* -------------------------------------------------------------------------- */

const CHART_TOKENS = [
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
  '--chart-5',
] as const;

const COLOUR_GROUPS = [
  {
    title: 'Surfaces',
    tokens: [
      '--bg',
      '--bg-elevated',
      '--glass-fill',
      '--glass-fill-strong',
      '--border',
      '--glass-tint',
    ],
  },
  { title: 'Text', tokens: ['--text', '--text-muted', '--text-subtle'] },
  { title: 'Accent', tokens: ['--accent-fill', '--on-accent', '--accent-text'] },
  { title: 'Gold', tokens: ['--gold-fill', '--on-gold', '--gold-text'] },
  { title: 'Status', tokens: ['--danger', '--success', '--focus-ring'] },
  { title: 'Aurora', tokens: ['--aurora-1', '--aurora-2', '--aurora-3'] },
  { title: 'Chart', tokens: CHART_TOKENS },
] as const;

const COLOUR_TOKENS: readonly string[] = COLOUR_GROUPS.flatMap(
  (group) => group.tokens,
);

const TYPE_ROLES = [
  { name: 'Display', utility: 'type-display', token: '--type-display' },
  { name: 'H1', utility: 'type-h1', token: '--type-h1' },
  { name: 'H2', utility: 'type-h2', token: '--type-h2' },
  { name: 'H3', utility: 'type-h3', token: '--type-h3' },
  { name: 'Body', utility: 'type-body', token: '--type-body' },
  { name: 'Small', utility: 'type-small', token: '--type-small' },
  { name: 'Label', utility: 'type-label', token: '--type-label' },
] as const;

const SPACE_TOKENS = [
  '--space-1',
  '--space-2',
  '--space-3',
  '--space-4',
  '--space-5',
  '--space-6',
  '--space-7',
  '--space-8',
  '--space-9',
  '--space-10',
] as const;

const RADIUS_TOKENS = [
  '--radius-sm',
  '--radius-md',
  '--radius-lg',
  '--radius-pill',
] as const;

const MOTION_TOKENS = [
  { name: 'dur-fast', token: '--dur-fast', utility: 'duration-fast' },
  { name: 'dur-base', token: '--dur-base', utility: 'duration-base' },
  { name: 'dur-slow', token: '--dur-slow', utility: 'duration-slow' },
  { name: 'dur-scene', token: '--dur-scene', utility: 'duration-scene' },
] as const;

const MOTION_TOKEN_NAMES: readonly string[] = MOTION_TOKENS.map(
  (item) => item.token,
);

const GLASS_CARDS = [
  {
    title: 'Static',
    body: 'The plain glass card. Falls back to a solid surface where backdrop-filter is unavailable.',
  },
  {
    title: 'Elevated',
    body: 'The stronger fill, used for fields, hover states and modals.',
  },
  {
    title: 'Over a blob',
    body: 'Glass only ever sits over the aurora or a colour field, never on glass.',
  },
] as const;

const SCALE_ROWS = [
  {
    label: 'z-index',
    value: 'base 0 · raised 10 · nav 100 · dropdown 200 · modal 300 · toast 400',
  },
  { label: 'breakpoints', value: 'sm 40em · md 48em · lg 64em · xl 80em' },
  {
    label: 'container',
    value:
      'max-inline-size 75rem · padding-inline 1rem → 1.5rem @40em → 2rem @64em',
  },
  { label: 'touch target', value: '2.75rem' },
  { label: 'focus ring', value: '0.125rem ring, 0.125rem offset' },
] as const;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/** Reads the live computed value of each token and refreshes on theme change. */
function useTokenValues(tokens: readonly string[]): Record<string, string> {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const read = (): void => {
      const computed = getComputedStyle(document.documentElement);
      const next: Record<string, string> = {};
      for (const token of tokens) {
        next[token] = computed.getPropertyValue(token).trim();
      }
      setValues(next);
    };

    read();
    window.addEventListener(THEME_CHANGE_EVENT, read);
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, read);
    };
  }, [tokens]);

  return values;
}

/**
 * A gallery block: a Section, a Container (from Section), and a heading pair.
 * Every one of those is a primitive — the gallery has no layout classes of its
 * own.
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

function Swatch({ token, value }: { token: string; value: string }): JSX.Element {
  return (
    <Cluster as="li" gap={3} align="center">
      <span
        aria-hidden="true"
        className="border-border size-8 shrink-0 rounded-sm border"
        style={{ backgroundColor: `var(${token})` }}
      />
      <Stack as="span" gap={1}>
        <Text as="span" role="label">
          {token}
        </Text>
        <Text as="span" role="small" tone="muted" className="break-all">
          {value || '—'}
        </Text>
      </Stack>
    </Cluster>
  );
}

/* -------------------------------------------------------------------------- */
/* Gallery                                                                     */
/* -------------------------------------------------------------------------- */

export function Gallery(): JSX.Element {
  const resolved = useResolvedTheme();
  const colourValues = useTokenValues(COLOUR_TOKENS);
  const spaceValues = useTokenValues(SPACE_TOKENS);
  const radiusValues = useTokenValues(RADIUS_TOKENS);
  const motionValues = useTokenValues(MOTION_TOKEN_NAMES);
  const [moved, setMoved] = useState(false);

  return (
    <>
      <Aurora />

      <main className="layer-raised">
        <Section>
          <Cluster as="header" justify="between" align="start" gap={6}>
            <Stack gap={3}>
              <Text role="label" tone="muted">
                Harbour · Brick 0
              </Text>
              <Heading level={1}>Foundation gallery</Heading>
              <Text tone="muted">
                Every token, surface and motion value from the design spec, in
                both themes. Currently rendering the{' '}
                <strong className="text-text font-semibold">{resolved}</strong>{' '}
                theme.
              </Text>
            </Stack>
            <ThemeToggle />
          </Cluster>
        </Section>

        <Block
          title="Colour tokens"
          description="Each chip is painted from the token itself, so it repaints on theme change. The caption shows the value the browser resolves right now."
        >
          <Grid min="md" gap={8}>
            {COLOUR_GROUPS.map((group) => (
              <Stack key={group.title} gap={4}>
                <Heading level={3}>{group.title}</Heading>
                <Stack as="ul" gap={3}>
                  {group.tokens.map((token) => (
                    <Swatch
                      key={token}
                      token={token}
                      value={colourValues[token] ?? ''}
                    />
                  ))}
                </Stack>
              </Stack>
            ))}
          </Grid>
        </Block>

        <Block
          title="Type scale"
          description="Fluid roles from spec section 5. Display and body carry their maximum measure; the rest are unbounded."
        >
          <Stack as="ul" gap={6}>
            {TYPE_ROLES.map((role) => (
              <Stack as="li" gap={4} key={role.name}>
                <div className="border-border border-t" aria-hidden="true" />
                <Text role="label" tone="muted">
                  {role.name} · {role.token}
                </Text>
                <p className={cn(role.utility, 'text-text')}>
                  Harbour keeps you steady
                </p>
              </Stack>
            ))}
          </Stack>
        </Block>

        <Block
          title="Spacing scale"
          description="The ten permitted steps. Nothing outside this list may be used for spacing, and Tailwind's step numbers are not these numbers."
        >
          <Stack as="ul" gap={3}>
            {SPACE_TOKENS.map((token) => (
              <Cluster as="li" gap={4} align="center" key={token}>
                <Text
                  as="span"
                  role="label"
                  tone="muted"
                  className="w-24 shrink-0"
                >
                  {token}
                </Text>
                <span
                  aria-hidden="true"
                  className="bg-accent-fill block h-3 rounded-sm"
                  style={{ inlineSize: `var(${token})` }}
                />
                <Text as="span" role="small" tone="muted">
                  {spaceValues[token] ?? '—'}
                </Text>
              </Cluster>
            ))}
          </Stack>
        </Block>

        <Block
          title="Radii"
          description="sm 0.5rem, md 1rem, lg 1.5rem and pill. Glass uses lg (spec section 4); the university logo box uses md (spec section 8)."
        >
          <Cluster as="ul" gap={6} align="end">
            {RADIUS_TOKENS.map((token) => (
              <Stack as="li" gap={2} key={token}>
                <span
                  aria-hidden="true"
                  className="bg-accent-fill block size-16"
                  style={{ borderRadius: `var(${token})` }}
                />
                <Text as="span" role="label" tone="muted">
                  {token}
                </Text>
                <Text as="span" role="small" tone="muted">
                  {radiusValues[token] ?? '—'}
                </Text>
              </Stack>
            ))}
          </Cluster>
        </Block>

        <Block
          title="Glass over a colour field"
          description="Three glass surfaces, the maximum the spec allows on screen at once. The cards sit on their own contained aurora patch, so glass is always reviewed over a real colour field rather than wherever the page blobs happen to land. The blur is static and never animated."
        >
          <AuroraPatch>
            <Grid min="md" gap={6}>
              {GLASS_CARDS.map((card) => (
                <article key={card.title} className="glass p-6">
                  <Stack gap={2}>
                    <Heading level={3}>{card.title}</Heading>
                    <Text role="small" tone="muted">
                      {card.body}
                    </Text>
                  </Stack>
                </article>
              ))}
            </Grid>
          </AuroraPatch>
        </Block>

        <Block
          title="Chart palette"
          description="Read through CSS variables. Colour alone never carries meaning — charts also use direct labels or markers."
        >
          <Grid as="ul" min="sm" gap={4}>
            {CHART_TOKENS.map((token) => (
              <Stack as="li" gap={2} key={token}>
                <span
                  aria-hidden="true"
                  className="border-border block h-16 rounded-md border"
                  style={{ backgroundColor: `var(${token})` }}
                />
                <Text as="span" role="label" tone="muted">
                  {token}
                </Text>
              </Stack>
            ))}
          </Grid>
        </Block>

        <Block
          title="Motion tokens"
          description="Press any block to set them all moving. Each square travels on a different duration token, all on the spec's ease-out curve."
        >
          <Grid as="ul" min="sm" gap={4}>
            {MOTION_TOKENS.map((item) => (
              <Stack as="li" gap={2} key={item.name}>
                <Cluster
                  as="button"
                  gap={3}
                  align="center"
                  type="button"
                  aria-pressed={moved}
                  aria-label={`Move the ${item.name} block`}
                  onClick={() => {
                    setMoved((current) => !current);
                  }}
                  className="bg-glass-fill-strong border-border hover:bg-glass-fill h-16 w-full rounded-md border px-3"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'bg-accent-fill block size-8 rounded-sm',
                      'transition-transform ease-out',
                      item.utility,
                      moved && 'translate-x-12',
                    )}
                  />
                </Cluster>
                <Text as="span" role="label" tone="muted">
                  {item.name}
                </Text>
                <Text as="span" role="small" tone="muted">
                  {motionValues[item.token] ?? '—'}
                </Text>
              </Stack>
            ))}
          </Grid>
        </Block>

        <Block
          title="Scales"
          description="The remaining fixed scales. These are consumed through tokens rather than utilities."
        >
          <Stack as="dl" gap={3}>
            {SCALE_ROWS.map((row) => (
              <Cluster key={row.label} gap={4}>
                <Text as="dt" role="label" className="w-32 shrink-0">
                  {row.label}
                </Text>
                <Text as="dd" role="small" tone="muted">
                  {row.value}
                </Text>
              </Cluster>
            ))}
          </Stack>
        </Block>
      </main>
    </>
  );
}
