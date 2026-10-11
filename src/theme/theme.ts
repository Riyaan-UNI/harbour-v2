/**
 * Harbour theme engine — spec §11.
 *
 * The mode is a raw string under `harbour:theme` (`system` | `light` | `dark`),
 * deliberately not serialised state, so the pre-paint script in index.html can
 * read it directly and avoid a flash of the wrong theme.
 *
 * The resolved theme is written to `data-theme` and `color-scheme` on <html>,
 * never on a wrapper, so Radix and shadcn portals inherit it.
 */

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'harbour:theme';
export const THEME_CHANGE_EVENT = 'harbour:themechange';

/** Origin of the circular reveal, in viewport pixels. */
export type ThemeOrigin = { x: number; y: number };

const MODES = ['system', 'light', 'dark'] as const;
const DARK_QUERY = '(prefers-color-scheme: dark)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type ViewTransitionLike = { finished: Promise<void> };
type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => ViewTransitionLike;
};

/* -------------------------------------------------------------------------- */
/* Store — a tiny external store so React can read the mode without context.   */
/* -------------------------------------------------------------------------- */

let currentMode: ThemeMode = 'system';
const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getMode(): ThemeMode {
  return currentMode;
}

function emit(): void {
  for (const listener of listeners) listener();
}

/* -------------------------------------------------------------------------- */
/* Reading the environment                                                     */
/* -------------------------------------------------------------------------- */

export function isThemeMode(value: unknown): value is ThemeMode {
  return (
    typeof value === 'string' && (MODES as readonly string[]).includes(value)
  );
}

export function readStoredMode(): ThemeMode {
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(raw) ? raw : 'system';
  } catch {
    // Storage can be blocked (private mode, policy). Fall back to system.
    return 'system';
  }
}

export function systemTheme(): ResolvedTheme {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  return mode === 'system' ? systemTheme() : mode;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** Reads a duration token so JS timing stays in step with CSS. */
function readDurationMs(token: string, fallbackMs: number): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return fallbackMs;
  return raw.endsWith('ms') ? value : value * 1000;
}

/* -------------------------------------------------------------------------- */
/* Applying                                                                    */
/* -------------------------------------------------------------------------- */

function updateMetaThemeColor(): void {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  const bg = getComputedStyle(document.documentElement)
    .getPropertyValue('--bg')
    .trim();
  if (bg) meta.setAttribute('content', bg);
}

function applyTheme(theme: ResolvedTheme): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  updateMetaThemeColor();
  window.dispatchEvent(
    new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme } }),
  );
}

/**
 * Sets the mode, persists it, and applies the resolved theme.
 *
 * Switching uses the View Transitions API with a circular reveal from the
 * toggle. Where that is unsupported, or where the user prefers reduced motion,
 * it falls back to a short colour crossfade — or to an instant change.
 */
export function setMode(mode: ThemeMode, origin?: ThemeOrigin): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Not fatal: the theme still applies for this session.
  }

  currentMode = mode;
  const next = resolveTheme(mode);
  const root = document.documentElement;

  if (prefersReducedMotion()) {
    applyTheme(next);
    emit();
    return;
  }

  const doc = document as DocumentWithViewTransition;

  if (typeof doc.startViewTransition !== 'function') {
    // Fallback: a short colour crossfade, no geometry change.
    root.classList.add('harbour-theme-fade');
    applyTheme(next);
    window.setTimeout(() => {
      root.classList.remove('harbour-theme-fade');
    }, readDurationMs('--dur-base', 300));
    emit();
    return;
  }

  if (origin) {
    root.style.setProperty('--vt-x', `${origin.x}px`);
    root.style.setProperty('--vt-y', `${origin.y}px`);
  }

  // Suspend every other transition while the reveal plays.
  root.classList.add('harbour-theme-switching');

  const transition = doc.startViewTransition(() => {
    applyTheme(next);
    emit();
  });

  void transition.finished.finally(() => {
    root.classList.remove('harbour-theme-switching');
    root.style.removeProperty('--vt-x');
    root.style.removeProperty('--vt-y');
  });
}

/**
 * Applies the stored theme on boot and keeps it in step with the OS while the
 * mode is `system`. Returns a cleanup function.
 */
export function initTheme(): () => void {
  currentMode = readStoredMode();
  applyTheme(resolveTheme(currentMode));

  const media = window.matchMedia(DARK_QUERY);
  const onSystemChange = (): void => {
    if (readStoredMode() === 'system') {
      applyTheme(systemTheme());
    }
  };
  media.addEventListener('change', onSystemChange);

  return () => {
    media.removeEventListener('change', onSystemChange);
  };
}
