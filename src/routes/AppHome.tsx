import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import { useProfile } from '@legacy/context/ProfileContext.jsx';
import {
  Bento,
  BentoItem,
  Cluster,
  Grid,
  Heading,
  Section,
  Stack,
  Text,
} from '../components/layout';
import {
  Button,
  Card,
  DemoBadge,
  Disclaimer,
  InteractiveCard,
  SafetyRail,
  Skeleton,
  StatusBadge,
} from '../components/ui';
import {
  ArrowUpRight,
  Globe,
  Languages,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Phone,
  ShieldAlert,
  Users,
} from '../components/ui/icons';

/**
 * AppHome — the redesigned `/app/home`.
 *
 * Built against the v2 design system only: layout primitives for structure,
 * shared components for surface and state, and the token layer for every
 * colour, space and radius. It does not reuse the legacy `Home.jsx` markup or
 * its centred, symmetric 2×2 tool grid — the layout here is an asymmetric
 * editorial bento, in line with the "no centred hero, no centring everything"
 * direction.
 *
 * Colours are fully theme-aware by construction: nothing here names a raw
 * colour. Accents are carried as a single `--tile-accent` custom property per
 * tile (itself a reference to a token), and the activity chart is coloured
 * through CSS class overrides that read `--chart-1`, so it re-themes with the
 * page and stays readable in both dark and light.
 *
 * The page sits on a fixed harbour-scene SVG backdrop (`/art/harbour-scene-1.svg`)
 * at z-index -1, muted to opacity 0.32 and overlaid with a `--glass-tint` wash.
 * Every text-bearing block that is not already a Card surface
 * (the masthead greeting, every section lead) wraps itself in
 * `.app-home-glass-text`, which paints the same `--glass-tint` and adds a
 * backdrop-filter blur. That gives the headings a frosted-glass plate to sit
 * on while the scene shows through softly behind it. Cards are never nested
 * inside `.app-home-glass-text` — glass on glass is the one rule the spec
 * forbids outright.
 *
 * Honesty (Addendum 1): the Tide Bank panel is a demo with no monetary value,
 * the Voice SOS tile is a simulation, and the community events are samples —
 * each carries a permanent DemoBadge. Nothing here invents a statistic; the
 * activity chart reads only the real `harbour-progress-history` the app writes.
 */

type DayActivity = { day: string; steps: number };

const TOOLS = [
  {
    to: '/app/scam',
    number: '01',
    title: 'Scam X-ray',
    description: 'Look beneath suspicious messages before you act.',
    Icon: ShieldAlert,
    accent: 'var(--danger)',
  },
  {
    to: '/app/checklist',
    number: '02',
    title: 'Settle-in list',
    description: 'Small steps, sorted for life in Hong Kong.',
    Icon: ListChecks,
    accent: 'var(--accent-text)',
  },
  {
    to: '/app/translate',
    number: '03',
    title: 'Cantonese helper',
    description: 'Say the useful thing, with the right context.',
    Icon: Languages,
    accent: 'var(--gold-text)',
  },
  {
    to: '/app/chat',
    number: '04',
    title: 'Ask Harbour',
    description: 'A calm starting point for any question.',
    Icon: MessageSquare,
    accent: 'var(--chart-3)',
  },
] as const;

const SAMPLE_EVENTS = [
  { id: 'clay', day: '18', month: 'OCT', title: 'Clay afternoon', place: 'PMQ, Central' },
  { id: 'sunset', day: '21', month: 'OCT', title: 'Sunset campus walk', place: 'HKU MTR Exit A' },
  { id: 'cafe', day: '26', month: 'OCT', title: 'Cantonese café', place: 'Sham Shui Po' },
] as const;

const EXPLORE = [
  { to: '/app/dashboard', title: 'Your dashboard', desc: 'Progress and profile details', Icon: LayoutDashboard },
  { to: '/app/people', title: 'Find your people', desc: 'Search the sample directory', Icon: Users },
  { to: '/app/community', title: 'Community', desc: 'See all sample events', Icon: Globe },
  { to: '/app/voice-sos', title: 'Voice SOS', desc: 'Open the support preview', Icon: Phone },
] as const;

const WEATHER_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=22.2819&longitude=114.1577&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FHong_Kong';

const WEATHER_DESC: Record<number, string> = {
  0: 'Clear skies',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Misty',
  48: 'Misty',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Passing showers',
  81: 'Showers',
  82: 'Heavy showers',
  95: 'Thunderstorms',
  96: 'Thunderstorms',
  99: 'Thunderstorms',
};

type WeatherData = {
  temperature: number;
  apparent: number;
  humidity: number;
  wind: number;
  code: number;
};

function readWeekActivity(): DayActivity[] {
  let history: Record<string, number> = {};
  try {
    history = JSON.parse(localStorage.getItem('harbour-progress-history') || '{}');
  } catch {
    history = {};
  }
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 6 + index);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return {
      day: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date),
      steps: Number(history[key] || 0),
    };
  });
}

/** The compact, token-driven Hong Kong weather card. */
function HongKongNow(): JSX.Element {
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [data, setData] = useState<WeatherData | null>(null);

  const refresh = useCallback(async () => {
    setStatus('loading');
    try {
      const response = await fetch(WEATHER_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error('Weather unavailable');
      const json = (await response.json()) as {
        current: {
          temperature_2m: number;
          apparent_temperature: number;
          relative_humidity_2m: number;
          wind_speed_10m: number;
          weather_code: number;
        };
      };
      setData({
        temperature: json.current.temperature_2m,
        apparent: json.current.apparent_temperature,
        humidity: json.current.relative_humidity_2m,
        wind: json.current.wind_speed_10m,
        code: json.current.weather_code,
      });
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <Card variant="static" className="h-full">
      <Stack gap={4}>
        <Cluster justify="between" align="center">
          <Text role="label" tone="subtle">
            Hong Kong · now
          </Text>
          <span className="type-label text-text-subtle">Open-Meteo</span>
        </Cluster>

        {status === 'loading' ? (
          <Stack gap={3}>
            <Skeleton className="h-12 w-28 rounded-md" />
            <Skeleton className="h-4 w-40 rounded-md" />
          </Stack>
        ) : status === 'error' ? (
          <Stack gap={3} align="center" className="text-center">
            <Text role="small" tone="muted">
              Weather is unavailable right now.
            </Text>
            <Button variant="secondary" size="small" onClick={() => void refresh()}>
              Try again
            </Button>
          </Stack>
        ) : (
          <Stack gap={3}>
            <Cluster align="baseline" gap={3}>
              <span className="type-display text-text">
                {Math.round(data?.temperature ?? 0)}°
              </span>
              <Text role="small" tone="muted">
                {WEATHER_DESC[data?.code ?? 0] ?? 'Current conditions'}
              </Text>
            </Cluster>
            <Cluster gap={4} className="type-small text-text-muted">
              <span>Feels {Math.round(data?.apparent ?? 0)}°</span>
              <span>Humidity {data?.humidity ?? 0}%</span>
              <span>Wind {Math.round(data?.wind ?? 0)} km/h</span>
            </Cluster>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

export function AppHome(): JSX.Element {
  const { profile } = useProfile();
  const name = profile?.name?.trim() || 'friend';

  const dateLabel = useMemo(
    () =>
      `${new Intl.DateTimeFormat('en-HK', { weekday: 'long', timeZone: 'Asia/Hong_Kong' }).format(new Date()).toUpperCase()} · HONG KONG`,
    [],
  );

  const [activity, setActivity] = useState<DayActivity[]>(readWeekActivity);
  const [savedEvents, setSavedEvents] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('harbour-events-saved') || '[]');
    } catch {
      return [];
    }
  });
  const [revealed, setRevealed] = useState(false);
  const [balance] = useState(() =>
    Number(localStorage.getItem('harbour-tide-balance') || 3),
  );

  useEffect(() => {
    const refresh = (): void => setActivity(readWeekActivity());
    window.addEventListener('storage', refresh);
    window.addEventListener('harbour-progress', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('harbour-progress', refresh);
    };
  }, []);

  const totalSteps = useMemo(
    () => activity.reduce((sum, day) => sum + day.steps, 0),
    [activity],
  );
  const busiest = useMemo(
    () =>
      activity.reduce<DayActivity>(
        (best, day) => (day.steps > best.steps ? day : best),
        activity[0] ?? { day: '', steps: 0 },
      ),
    [activity],
  );
  const activitySummary =
    totalSteps === 0
      ? 'No check-ins in the last seven days. Tick one small task to begin.'
      : `${totalSteps} check-ins in the last seven days, busiest on ${busiest.day}.`;

  const toggleEvent = (id: string): void => {
    const next = savedEvents.includes(id)
      ? savedEvents.filter((item) => item !== id)
      : [...savedEvents, id];
    setSavedEvents(next);
    localStorage.setItem('harbour-events-saved', JSON.stringify(next));
  };

  const FlagshipIcon = TOOLS[0].Icon;

  return (
    <div className="app-home">
      {/* Fixed harbour scene backdrop — sits at z-index -1 behind everything. */}
      <div className="app-home__scene" aria-hidden="true">
        <img src="/art/harbour-scene-1.svg" alt="" />
        <div className="app-home__scene-tint" />
      </div>

      {/* Masthead — asymmetric split: greeting leads, weather sits aside. */}
      <Section aria-label="Welcome">
        <div className="app-home-masthead">
          <div className="app-home-masthead__intro app-home-glass-text">
            <span className="app-home-eyebrow">{dateLabel}</span>
            <Heading level={1} role="h1">
              Good to see you, {name}.
            </Heading>
            <Text role="body" tone="muted">
              What would make today feel a little easier?
            </Text>
          </div>
          <div className="app-home-masthead__aside">
            <HongKongNow />
          </div>
        </div>
      </Section>

      {/* Start here — the flagship tool carries the row; demos and the other
          three tools fill the bento. Asymmetric, not a centred grid. */}
      <Section aria-label="Start here">
        <div className="app-home-head">
          <div className="app-home-head__lead app-home-glass-text">
            <Heading level={2}>Start here</Heading>
            <Text role="body" tone="muted">
              Four quiet tools, and a couple of safe ways to practise.
            </Text>
          </div>
        </div>

        <Bento gap={6}>
          <BentoItem size="twothirds" tall>
            <Card
              variant="static"
              className="app-home-tile"
              style={{ '--tile-accent': TOOLS[0].accent } as CSSProperties}
            >
              <span className="app-home-tile__accent" aria-hidden="true" />
              <div className="app-home-tile__top">
                <span className="app-home-tile__num" aria-hidden="true">
                  {TOOLS[0].number}
                </span>
                <span className="app-home-tile__glyph" aria-hidden="true">
                  <FlagshipIcon />
                </span>
              </div>
              <div className="app-home-tile__body">
                <Heading level={3}>{TOOLS[0].title}</Heading>
                <Text role="small" tone="muted">
                  {TOOLS[0].description}
                </Text>
              </div>
              <div className="app-home-tile__foot">
                <Link to={TOOLS[0].to} className="inline-flex items-center gap-2 hover:underline">
                  Open Scam X-ray
                  <ArrowUpRight />
                </Link>
              </div>
            </Card>
          </BentoItem>

          {/* Demos column — two solid panels, never glass on glass. */}
          <BentoItem size="third" tall>
            <Stack gap={4} className="app-home-demos">
              <div className="app-home-demo">
                <DemoBadge variant="demo">Demo balance</DemoBadge>
                <p className="app-home-demo__title">Tide Bank</p>
                <Text role="small" tone="muted">
                  A local demo balance. No monetary value.
                </Text>
                <button
                  type="button"
                  className="app-home-demo__balance"
                  onClick={() => setRevealed((value) => !value)}
                  aria-pressed={revealed}
                  aria-label={revealed ? 'Hide demo balance' : 'Reveal demo balance'}
                >
                  {revealed
                    ? `HK$ ${balance.toLocaleString('en-HK')}.00`
                    : 'HK$ ••••••'}
                </button>
                <Link
                  to="/app/tide-bank"
                  className="inline-flex items-center gap-2 text-accent-text hover:underline"
                >
                  Open Tide Bank
                  <ArrowUpRight />
                </Link>
              </div>

              <div className="app-home-demo">
                <DemoBadge variant="simulation">No call placed</DemoBadge>
                <p className="app-home-demo__title">Voice SOS</p>
                <Text role="small" tone="muted">
                  Preview a fictional call with Maya, a volunteer guide.
                </Text>
                <Link
                  to="/app/voice-sos"
                  className="inline-flex items-center gap-2 text-accent-text hover:underline"
                >
                  Preview Voice SOS
                  <ArrowUpRight />
                </Link>
              </div>
            </Stack>
          </BentoItem>

          {TOOLS.slice(1).map((tool) => (
            <BentoItem key={tool.to} size="third">
              <Card
                variant="static"
                className="app-home-tile"
                style={{ '--tile-accent': tool.accent } as CSSProperties}
              >
                <span className="app-home-tile__accent" aria-hidden="true" />
                <div className="app-home-tile__top">
                  <span className="app-home-tile__num" aria-hidden="true">
                    {tool.number}
                  </span>
                  <span className="app-home-tile__glyph" aria-hidden="true">
                    <tool.Icon />
                  </span>
                </div>
                <div className="app-home-tile__body">
                  <Heading level={3}>{tool.title}</Heading>
                  <Text role="small" tone="muted">
                    {tool.description}
                  </Text>
                </div>
                <div className="app-home-tile__foot">
                  <Link to={tool.to} className="inline-flex items-center gap-2 hover:underline">
                    Open {tool.title}
                    <ArrowUpRight />
                  </Link>
                </div>
              </Card>
            </BentoItem>
          ))}
        </Bento>
      </Section>

      {/* This week — the real activity chart plus a supportive expandable. */}
      <Section aria-label="This week">
        <div className="app-home-head">
          <div className="app-home-head__lead app-home-glass-text">
            <Heading level={2}>This week, in small steps</Heading>
            <Text role="body" tone="muted">
              A gentle look at the check-ins you have logged.
            </Text>
          </div>
        </div>

        <Bento gap={6}>
          <BentoItem size="twothirds" tall>
            <Card variant="static" className="h-full">
              <Stack gap={5}>
                <Stack gap={2}>
                  <Heading level={3}>Your week</Heading>
                  <Text role="small" tone="muted">
                    {activitySummary}
                  </Text>
                </Stack>

                {totalSteps === 0 ? (
                  <EmptyActivity />
                ) : (
                  <div
                    className="app-home-activity"
                    role="img"
                    aria-label={`Checklist activity over the last seven days. ${activitySummary}`}
                  >
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart
                        data={activity}
                        margin={{ top: 16, right: 12, left: 0, bottom: 4 }}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="5 7" />
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ stroke: 'var(--border)' }}
                          contentStyle={{
                            background: 'var(--bg-elevated)',
                            border: 'var(--hairline) solid var(--border-strong)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text)',
                            fontSize: 'var(--type-small)',
                          }}
                          formatter={(value) => [
                            `${Number(value)} steps`,
                            'Completed',
                          ]}
                        />
                        <Line
                          dataKey="steps"
                          type="monotone"
                          stroke="var(--chart-1)"
                          strokeWidth={3}
                          dot={{ r: 4, fill: 'var(--bg-elevated)', stroke: 'var(--chart-1)', strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                          name="Completed"
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Stack>
            </Card>
          </BentoItem>

          <BentoItem size="third" tall>
            <InteractiveCard
              title="Stay supported"
              description="If a moment feels heavy, a calm path is one tap away."
              details={
                <Stack gap={4}>
                  <Text role="body" tone="muted">
                    Voice SOS is a quiet space to rehearse asking for help. Maya is a
                    fictional volunteer guide — no call is ever placed or connected.
                  </Text>
                  <Button asChild variant="secondary" size="small">
                    <Link to="/app/voice-sos">Open Voice SOS</Link>
                  </Button>
                </Stack>
              }
              footer={<StatusBadge tone="info">Here if you need it</StatusBadge>}
              className="h-full"
            />
          </BentoItem>
        </Bento>
      </Section>

      {/* Community — sample events only, each honestly badged. */}
      <Section aria-label="Community">
        <div className="app-home-head">
          <div className="app-home-head__lead app-home-glass-text">
            <Heading level={2}>Good things nearby</Heading>
            <Text role="body" tone="muted">
              Sample events, shown to illustrate the shape. No live matching.
            </Text>
          </div>
        </div>

        <Grid min="sm" gap={5}>
          {SAMPLE_EVENTS.map((event) => {
            const saved = savedEvents.includes(event.id);
            return (
              <Card key={event.id} variant="flat" className="app-home-event">
                <Stack gap={4}>
                  <DemoBadge variant="sample">Sample</DemoBadge>
                  <div className="app-home-event__date">
                    <span className="app-home-event__day">{event.day}</span>
                    <span className="app-home-event__month">{event.month}</span>
                  </div>
                  <div className="app-home-event__copy">
                    <Heading level={3}>{event.title}</Heading>
                    <Text role="small" tone="muted">
                      {event.place}
                    </Text>
                  </div>
                  <div className="app-home-event__foot">
                    <Button
                      variant="ghost"
                      size="small"
                      aria-pressed={saved}
                      onClick={() => toggleEvent(event.id)}
                    >
                      {saved ? 'Saved sample' : 'Save sample'}
                    </Button>
                  </div>
                </Stack>
              </Card>
            );
          })}
        </Grid>
      </Section>

      {/* Here if you need it — the safety numbers, with an honest note. */}
      <Section aria-label="Support and emergency numbers">
        <div className="app-home-head">
          <div className="app-home-head__lead app-home-glass-text">
            <Heading level={2}>Here if you need it</Heading>
            <Text role="body" tone="muted">
              Tap a number to call from your device.
            </Text>
          </div>
        </div>

        <Card variant="static">
          <Stack gap={5}>
            <SafetyRail variant="expanded" />
            <Disclaimer>
              The numbers above are unverified samples carried over from the
              original project — confirm them against official Hong Kong sources
              before relying on them.
            </Disclaimer>
          </Stack>
        </Card>
      </Section>

      {/* A little more Harbour — quiet navigation to the rest of the app. */}
      <Section aria-label="More in Harbour">
        <div className="app-home-head">
          <div className="app-home-head__lead app-home-glass-text">
            <Heading level={2}>A little more Harbour</Heading>
            <Text role="body" tone="muted">
              Your space, your pace.
            </Text>
          </div>
        </div>

        <nav className="app-home-explore" aria-label="More in Harbour">
          {EXPLORE.map((item) => (
            <Link key={item.to} to={item.to} className="app-home-explore__link">
              <span className="app-home-explore__icon" aria-hidden="true">
                <item.Icon />
              </span>
              <span className="app-home-explore__text">
                <span className="type-body text-text">{item.title}</span>
                <span className="type-small text-text-muted">{item.desc}</span>
              </span>
            </Link>
          ))}
        </nav>
      </Section>
    </div>
  );
}

/** Warm empty state for the activity chart — a next step, never a shrug. */
function EmptyActivity(): JSX.Element {
  return (
    <Stack gap={4} align="center" className="text-center py-6">
      <Heading level={3}>No check-ins yet</Heading>
      <Text role="small" tone="muted">
        Log a small task and it will appear here over the next seven days.
      </Text>
      <Button asChild variant="secondary" size="small">
        <Link to="/app/checklist">Open the settle-in list</Link>
      </Button>
    </Stack>
  );
}
