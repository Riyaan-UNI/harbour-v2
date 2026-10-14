/**
 * Dashboard data readers and derivations.
 *
 * Non-component exports live in a `.ts` file, never beside a component — the
 * ESLint react-refresh rule (`only-export-components`) wants a `.tsx` file to
 * export components and nothing else.
 *
 * Every reader below mirrors `src/legacy/pages/Dashboard.jsx` exactly: the same
 * localStorage keys, the same fallbacks, every access wrapped in try/catch so a
 * blocked or malformed store cannot break the page. Nothing here invents a
 * value; where a figure is not real it is labelled DEMO/SAMPLE in the module
 * that renders it (docs/DASHBOARD_DESIGN_SPEC.md, Appendix B).
 */

/** The three range-selector states (module 3). */
export type RangeKey = 'today' | 'week' | 'month';

/** One bar of the activity chart. */
export type SeriesPoint = { label: string; value: number };

/** One cell of the 28-day heat strip. */
export type HeatCell = { key: string; level: 0 | 1 | 2 | 3; value: number };

/** A user-created checklist list, as `Checklist.jsx` writes it. */
type CustomList = {
  id: string;
  title: string;
  items?: { id: string; text: string }[];
};

/** The known sample directory — the only friends `harbour-friends` can name. */
export const FRIEND_DIRECTORY: Record<
  string,
  { name: string; country: string; mascot: string }
> = {
  'lina-chen': {
    name: 'Lina Chen',
    country: 'Taiwan, China',
    mascot: '/art/mascot-otter.webp',
  },
  'arjun-mehta': {
    name: 'Arjun Mehta',
    country: 'India',
    mascot: '/art/mascot-fox.webp',
  },
  'mei-wong': {
    name: 'Mei Wong',
    country: 'Malaysia',
    mascot: '/art/mascot-crane.webp',
  },
  'sara-kim': {
    name: 'Sara Kim',
    country: 'South Korea',
    mascot: '/art/mascot-turtle.webp',
  },
};

/** Social platforms Harbour can link out to (from `Profile.jsx`). */
export const SOCIAL_URLS: Record<string, string> = {
  instagram: 'https://instagram.com/',
  linkedin: 'https://linkedin.com/in/',
  tiktok: 'https://tiktok.com/@',
  x: 'https://x.com/',
};

/** A profile's social handle as a safe outbound URL, or null if unusable. */
export function socialHref(platform: string, handle: string): string | null {
  const base = SOCIAL_URLS[platform];
  if (!base || !handle) return null;
  return `${base}${encodeURIComponent(handle.replace(/^@/, ''))}`;
}

/** Parse a localStorage JSON value, falling back on any error. */
export function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** `harbour-checklist` — `{ taskId: boolean }`. Real. */
export function readChecklist(): Record<string, boolean> {
  const value = safeRead<Record<string, boolean>>('harbour-checklist', {});
  return value && typeof value === 'object' ? value : {};
}

/** `harbour-progress-history` — `{ 'YYYY-MM-DD': completedCount }`. Real. */
export function readHistory(): Record<string, number> {
  const value = safeRead<Record<string, number>>('harbour-progress-history', {});
  return value && typeof value === 'object' ? value : {};
}

/** `harbour-custom-lists` — the user's own lists. Real. */
export function readCustomLists(): CustomList[] {
  const value = safeRead<CustomList[]>('harbour-custom-lists', []);
  return Array.isArray(value) ? value : [];
}

/** `harbour-friends` — an array of directory ids. Real. */
export function readFriends(): string[] {
  const value = safeRead<string[]>('harbour-friends', []);
  return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : [];
}

/**
 * `harbour-tide-balance` — a plain number in a string. DEMO, and it carries no
 * monetary value. Read exactly as the legacy dashboard reads it (default 3).
 */
export function readTidePoints(): number {
  try {
    const raw = localStorage.getItem('harbour-tide-balance');
    const value = Number(raw ?? 3);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

/* --------------------------------------------------------------------------
   Derivations
   -------------------------------------------------------------------------- */

/** The UTC day key the checklist writes history under. */
function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function countFor(history: Record<string, number>, key: string): number {
  const value = Number(history[key]);
  return Number.isFinite(value) ? value : 0;
}

/** The chart series for a range: 1 / 7 / 30 bars (module 3, §5). */
export function buildSeries(
  history: Record<string, number>,
  range: RangeKey,
): SeriesPoint[] {
  if (range === 'today') {
    const now = new Date();
    return [{ label: 'Today', value: countFor(history, dayKey(now)) }];
  }

  const span = range === 'week' ? 7 : 30;
  const points: SeriesPoint[] = [];

  for (let back = span - 1; back >= 0; back -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - back);
    points.push({
      label:
        range === 'week'
          ? date.toLocaleDateString('en', { weekday: 'short' })
          : String(date.getDate()),
      value: countFor(history, dayKey(date)),
    });
  }

  return points;
}

/**
 * The 28-day heat strip — 7 columns × 4 weeks, oldest first, so it flows into
 * the grid as four weeks. The four bands are derived from the same counts the
 * chart plots; they are a coarse read, not a second measurement.
 */
export function buildHeat(history: Record<string, number>): HeatCell[] {
  const cells: HeatCell[] = [];

  for (let back = 27; back >= 0; back -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - back);
    const key = dayKey(date);
    const value = countFor(history, key);
    cells.push({ key, value, level: heatLevel(value) });
  }

  return cells;
}

/** 0 → empty; 1–2, 3–5 and 6+ → the three filled bands. */
function heatLevel(value: number): 0 | 1 | 2 | 3 {
  if (value <= 0) return 0;
  if (value <= 2) return 1;
  if (value <= 5) return 2;
  return 3;
}

/**
 * The visible, screen-reader-readable summary of the plotted series (module 3).
 * Reuses the legacy sentence pattern for the seven-day case. The chart is never
 * the only carrier of meaning (Addendum 1 rule 4).
 */
export function summarise(series: SeriesPoint[], range: RangeKey): string {
  const total = series.reduce((sum, point) => sum + point.value, 0);

  if (range === 'today') {
    return total === 0
      ? 'No checklist steps recorded today yet.'
      : `${total} step${total === 1 ? '' : 's'} recorded today.`;
  }

  const window = range === 'week' ? 'seven days' : 'thirty days';

  if (total === 0) {
    return `No checklist steps recorded in the last ${window} yet. Complete one small task to start the line.`;
  }

  let busiest = series[0] ?? { label: '—', value: 0 };
  for (const point of series) {
    if (point.value > busiest.value) busiest = point;
  }

  return `${total} step${total === 1 ? '' : 's'} recorded in the last ${window}. Your busiest day was ${busiest.label} with ${busiest.value}.`;
}

/** Settle-in progress for module 4, from the checklist and the user's lists. */
export function deriveTaskProgress(): {
  done: number;
  total: number;
  progress: number;
  nextTasks: { id: string; text: string }[];
} {
  const checklist = readChecklist();
  const customItems = readCustomLists().flatMap((list) =>
    Array.isArray(list.items) ? list.items : [],
  );

  const done = Object.values(checklist).filter(Boolean).length;

  // The denominator is the steps this device actually knows about: the ids the
  // user has recorded, plus the items on their own lists. No total is invented.
  const ids = new Set<string>([
    ...Object.keys(checklist),
    ...customItems.map((item) => String(item.id)),
  ]);
  const total = ids.size;
  const progress = total > 0 ? done / total : 0;

  const nextTasks = customItems
    .filter((item) => !checklist[item.id])
    .slice(0, 3)
    .map((item) => ({ id: String(item.id), text: String(item.text) }));

  return { done, total, progress, nextTasks };
}

/**
 * Whether motion may play. False under `prefers-reduced-motion: reduce`, under
 * the shell's calm mode (`data-calm="true"`), or when the stored calm-mode
 * preference is on — the same default `AppShell` applies. The dashboard's GSAP
 * timeline and the count-up both gate on this, so reduced motion and calm mode
 * render the identical static page (spec §6.3).
 */
export function motionAllowed(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    if (document.documentElement.dataset.calm === 'true') {
      return false;
    }
    // The shell's own default: an unset preference follows reduced-motion,
    // which is already handled above.
    return localStorage.getItem('harbour-calm-mode') !== 'on';
  } catch {
    return false;
  }
}
