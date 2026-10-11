import { useEffect, useState, type ReactNode } from 'react';
import { Aurora } from '../../components/Aurora';
import { AuroraPatch } from '../../components/AuroraPatch';
import { ThemeToggle } from '../../components/ThemeToggle';
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

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <section className="mt-12">
      <h2 className="type-h2 text-text">{title}</h2>
      <p className="type-small text-text-muted max-w-measure mt-2">
        {description}
      </p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Swatch({ token, value }: { token: string; value: string }): JSX.Element {
  return (
    <li className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="border-border size-8 shrink-0 rounded-sm border"
        style={{ backgroundColor: `var(${token})` }}
      />
      <span className="min-w-0">
        <span className="type-label text-text block">{token}</span>
        <span className="type-small text-text-muted block break-all">
          {value || '—'}
        </span>
      </span>
    </li>
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

      <main className="layer-raised max-w-page mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="type-label text-text-muted">Harbour · Brick 0</p>
            <h1 className="type-h1 text-text mt-2">Foundation gallery</h1>
            <p className="type-body text-text-muted mt-3">
              Every token, surface and motion value from the design spec, in both
              themes. Currently rendering the{' '}
              <strong className="text-text font-semibold">{resolved}</strong>{' '}
              theme.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <Section
          title="Colour tokens"
          description="Each chip is painted from the token itself, so it repaints on theme change. The caption shows the value the browser resolves right now."
        >
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {COLOUR_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="type-h3 text-text">{group.title}</h3>
                <ul className="mt-4 grid gap-3">
                  {group.tokens.map((token) => (
                    <Swatch
                      key={token}
                      token={token}
                      value={colourValues[token] ?? ''}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Type scale"
          description="Fluid roles from spec section 5. Display and body carry their maximum measure; the rest are unbounded."
        >
          <ul className="grid gap-6">
            {TYPE_ROLES.map((role) => (
              <li key={role.name} className="border-border border-t pt-4">
                <p className="type-label text-text-muted">
                  {role.name} · {role.token}
                </p>
                <p className={cn(role.utility, 'text-text mt-2')}>
                  Harbour keeps you steady
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="Spacing scale"
          description="The ten permitted steps. Nothing outside this list may be used for spacing."
        >
          <ul className="grid gap-3">
            {SPACE_TOKENS.map((token) => (
              <li key={token} className="flex items-center gap-4">
                <span className="type-label text-text-muted w-24 shrink-0">
                  {token}
                </span>
                <span
                  aria-hidden="true"
                  className="bg-accent-fill block h-3 rounded-sm"
                  style={{ inlineSize: `var(${token})` }}
                />
                <span className="type-small text-text-muted">
                  {spaceValues[token] ?? '—'}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="Radii"
          description="sm 0.5rem, md 1rem, lg 1.5rem and pill. Glass uses lg (spec section 4); the university logo box uses md (spec section 8)."
        >
          <ul className="flex flex-wrap items-end gap-6">
            {RADIUS_TOKENS.map((token) => (
              <li key={token} className="grid gap-2">
                <span
                  aria-hidden="true"
                  className="bg-accent-fill block size-16"
                  style={{ borderRadius: `var(${token})` }}
                />
                <span className="type-label text-text-muted">{token}</span>
                <span className="type-small text-text-muted">
                  {radiusValues[token] ?? '—'}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="Glass over a colour field"
          description="Three glass surfaces, the maximum the spec allows on screen at once. The cards sit on their own contained aurora patch, so glass is always reviewed over a real colour field rather than wherever the page blobs happen to land. The blur is static and never animated."
        >
          <AuroraPatch>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-3">
                {GLASS_CARDS.map((card) => (
                  <article key={card.title} className="glass p-6">
                    <h3 className="type-h3 text-text">{card.title}</h3>
                    <p className="type-small text-text-muted mt-2">
                      {card.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </AuroraPatch>
        </Section>

        <Section
          title="Chart palette"
          description="Read through CSS variables. Colour alone never carries meaning — charts also use direct labels or markers."
        >
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {CHART_TOKENS.map((token) => (
              <li key={token} className="grid gap-2">
                <span
                  aria-hidden="true"
                  className="border-border block h-16 rounded-md border"
                  style={{ backgroundColor: `var(${token})` }}
                />
                <span className="type-label text-text-muted">{token}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="Motion tokens"
          description="Press any block to set them all moving. Each square travels on a different duration token, all on the spec's ease-out curve."
        >
          <ul className="grid gap-4 sm:grid-cols-4">
            {MOTION_TOKENS.map((item) => (
              <li key={item.name} className="grid gap-2">
                <button
                  type="button"
                  aria-pressed={moved}
                  aria-label={`Move the ${item.name} block`}
                  onClick={() => {
                    setMoved((current) => !current);
                  }}
                  className="bg-glass-fill-strong border-border hover:bg-glass-fill flex h-16 w-full items-center rounded-md border px-3"
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
                </button>
                <span className="type-label text-text-muted">{item.name}</span>
                <span className="type-small text-text-muted">
                  {motionValues[item.token] ?? '—'}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="Scales"
          description="The remaining fixed scales. These are consumed through tokens rather than utilities."
        >
          <dl className="grid gap-3">
            {SCALE_ROWS.map((row) => (
              <div key={row.label} className="flex flex-wrap gap-x-4 gap-y-1">
                <dt className="type-label text-text w-32 shrink-0">
                  {row.label}
                </dt>
                <dd className="type-small text-text-muted">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </main>
    </>
  );
}
