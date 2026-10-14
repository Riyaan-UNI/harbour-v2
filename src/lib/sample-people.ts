import type { MascotKind } from '../components/ui';
import type { UniversityId } from '../components/ui';

/**
 * sample-people — the single source of truth for Harbour's sample community.
 *
 * Before this file the same four people were hardcoded in five different
 * places, and only one of those copies carried a mascot: the same person was
 * an octopus on `/app/people`, a fox on the dashboard, and a bare letter on
 * their own profile page. Everything the directory and the public profile
 * show now comes from this one array, so a person's face and facts follow
 * them wherever they are one of our samples.
 *
 * Deliberately sample data, and deliberately labelled as such at every
 * surface: friend connections live in `localStorage` under `harbour-friends`,
 * **keyed by `id`** — so ids here are stable and the roster only ever grows.
 * Nothing in this file is a real person or a real statistic.
 */

export type SamplePerson = {
  /** Stable key. `harbour-friends` stores these; never reuse or rename. */
  id: string;
  name: string;
  handle: string;
  /** Display name of the home region. HK/Macao/Taiwan are never "countries". */
  country: string;
  /** ISO 3166-1 alpha-2, lowercase — resolves `/flags/<code>.svg`. */
  countryCode: string;
  /** Full institution name, for readable text. */
  university: string;
  /** The manifest id, for `<UniversityLogo>` and its concept-art badge. */
  universityId: UniversityId;
  /** The Hong Kong district they are settling into. */
  place: string;
  note: string;
  tags: readonly string[];
  mascot: MascotKind;
  /** A §3 chart token, scoped per card as `--person-accent`. */
  accent: string;
  likes: number;
  comments: number;
  timeAgo: string;
};

/**
 * Twelve neighbours, six universities, ten home regions, twelve distinct
 * creatures — one companion each, so no face is ever repeated.
 */
export const SAMPLE_PEOPLE: readonly SamplePerson[] = [
  {
    id: 'lina-chen',
    name: 'Lina Chen',
    handle: '@lina.chen',
    country: 'Taiwan, China',
    countryCode: 'tw',
    university: 'City University of Hong Kong',
    universityId: 'cityu',
    place: 'Kowloon',
    note: 'Finding little cafés around Kowloon.',
    tags: ['Cafés', 'Design'],
    mascot: 'otter',
    accent: 'var(--chart-4)',
    likes: 128,
    comments: 12,
    timeAgo: '2h',
  },
  {
    id: 'arjun-mehta',
    name: 'Arjun Mehta',
    handle: '@arjun',
    country: 'India',
    countryCode: 'in',
    university: 'The University of Hong Kong',
    universityId: 'hku',
    place: 'Pok Fu Lam',
    note: 'Always up for a campus walk.',
    tags: ['Hiking', 'Food'],
    mascot: 'octopus',
    accent: 'var(--chart-3)',
    likes: 96,
    comments: 8,
    timeAgo: '5h',
  },
  {
    id: 'mei-wong',
    name: 'Mei Wong',
    handle: '@meiwong',
    country: 'Malaysia',
    countryCode: 'my',
    university: 'Hong Kong Polytechnic University',
    universityId: 'polyu',
    place: 'Hung Hom',
    note: 'Learning the city one MTR stop at a time.',
    tags: ['Language exchange', 'Markets'],
    mascot: 'turtle',
    accent: 'var(--chart-2)',
    likes: 74,
    comments: 15,
    timeAgo: '1d',
  },
  {
    id: 'sara-kim',
    name: 'Sara Kim',
    handle: '@sarakim',
    country: 'South Korea',
    countryCode: 'kr',
    university: 'Hong Kong Baptist University',
    universityId: 'hkbu',
    place: 'Kowloon Tong',
    note: 'New here too. Sharing small discoveries.',
    tags: ['Photography', 'Museums'],
    mascot: 'jellyfish',
    accent: 'var(--chart-5)',
    likes: 143,
    comments: 21,
    timeAgo: '1d',
  },
  {
    id: 'dimas-pratama',
    name: 'Dimas Pratama',
    handle: '@dimas.p',
    country: 'Indonesia',
    countryCode: 'id',
    university: 'The Chinese University of Hong Kong',
    universityId: 'cuhk',
    place: 'Sha Tin',
    note: 'Basketball at sunset, then noodles.',
    tags: ['Sports', 'Food'],
    mascot: 'crab',
    accent: 'var(--chart-1)',
    likes: 88,
    comments: 6,
    timeAgo: '3h',
  },
  {
    id: 'linh-nguyen',
    name: 'Linh Nguyen',
    handle: '@linh.ng',
    country: 'Vietnam',
    countryCode: 'vn',
    university: 'The Hong Kong University of Science and Technology',
    universityId: 'hkust',
    place: 'Clear Water Bay',
    note: 'Looking for study buddies by the sea.',
    tags: ['Study groups', 'Cycling'],
    mascot: 'seahorse',
    accent: 'var(--chart-2)',
    likes: 61,
    comments: 9,
    timeAgo: '6h',
  },
  {
    id: 'nattha-chai',
    name: 'Nattha Chai',
    handle: '@nattha',
    country: 'Thailand',
    countryCode: 'th',
    university: 'Hong Kong Baptist University',
    universityId: 'hkbu',
    place: 'Kowloon Tong',
    note: 'Collecting Hong Kong desserts, one stall at a time.',
    tags: ['Food', 'Markets'],
    mascot: 'shrimp',
    accent: 'var(--chart-5)',
    likes: 112,
    comments: 18,
    timeAgo: '4h',
  },
  {
    id: 'maria-santos',
    name: 'Maria Santos',
    handle: '@maria.s',
    country: 'Philippines',
    countryCode: 'ph',
    university: 'Lingnan University',
    universityId: 'lingnan',
    place: 'Tuen Mun',
    note: 'Choir on weekdays, hikes on Sundays.',
    tags: ['Music', 'Hiking'],
    mascot: 'starfish',
    accent: 'var(--chart-4)',
    likes: 79,
    comments: 11,
    timeAgo: '8h',
  },
  {
    id: 'bishal-shrestha',
    name: 'Bishal Shrestha',
    handle: '@bishal',
    country: 'Nepal',
    countryCode: 'np',
    university: 'The Education University of Hong Kong',
    universityId: 'eduhk',
    place: 'Tai Po',
    note: 'Morning runs before the lectures start.',
    tags: ['Sports', 'Language exchange'],
    mascot: 'seal',
    accent: 'var(--chart-1)',
    likes: 54,
    comments: 5,
    timeAgo: '1d',
  },
  {
    id: 'wei-zhang',
    name: 'Wei Zhang',
    handle: '@wei.zhang',
    country: 'Mainland, China',
    countryCode: 'cn',
    university: 'The University of Hong Kong',
    universityId: 'hku',
    place: 'Sai Ying Pun',
    note: 'Trying every tram route on the island.',
    tags: ['Photography', 'Cafés'],
    mascot: 'eel',
    accent: 'var(--chart-3)',
    likes: 134,
    comments: 16,
    timeAgo: '3h',
  },
  {
    id: 'yuki-tanaka',
    name: 'Yuki Tanaka',
    handle: '@yuki.t',
    country: 'Japan',
    countryCode: 'jp',
    university: 'City University of Hong Kong',
    universityId: 'cityu',
    place: 'Sham Shui Po',
    note: 'Sketching the old streets and the markets.',
    tags: ['Design', 'Museums'],
    mascot: 'pufferfish',
    accent: 'var(--chart-4)',
    likes: 151,
    comments: 23,
    timeAgo: '30m',
  },
  {
    id: 'nadia-rahman',
    name: 'Nadia Rahman',
    handle: '@nadia.r',
    country: 'Singapore',
    countryCode: 'sg',
    university: 'Hong Kong Polytechnic University',
    universityId: 'polyu',
    place: 'Tsim Sha Tsui',
    note: 'Harbourfront walks and cheap noodle nights.',
    tags: ['Study groups', 'Markets'],
    mascot: 'whale',
    accent: 'var(--chart-2)',
    likes: 67,
    comments: 7,
    timeAgo: '12h',
  },
] as const;

/** Every interest that appears above, de-duplicated, in first-seen order. */
export const SAMPLE_TAGS: readonly string[] = [
  ...new Set(SAMPLE_PEOPLE.flatMap((person) => person.tags)),
];

/** Look up a sample person by their stable id. `undefined` for a stranger. */
export function samplePersonById(id: string | undefined): SamplePerson | undefined {
  if (!id) return undefined;
  return SAMPLE_PEOPLE.find((person) => person.id === id);
}
