import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';
import { useProfile } from '@legacy/context/ProfileContext.jsx';
import { Icon } from '@legacy/components/Icons.jsx';
import { HarbourMark } from '../ui/harbour-mark';
import { ToastHost } from '@legacy/components/Toast.jsx';
import { useViewTransitionNavigate } from '@legacy/hooks/useViewTransitionNavigate.js';
import { useShellTheme } from './shell-theme-context';
import { ArrivalTransition } from './ArrivalTransition';
import { AppShellRoutes } from './AppShellRoutes';

/**
 * AppShell — the ported legacy `Shell`, restyled.
 *
 * What came over unchanged from `client/src/App.jsx`: the destination tables,
 * the top nav, the mobile tab bar, the More panel, the calm-mode setting, the
 * scroll-progress bar and the view-transition navigation. The markup and class
 * names are the legacy ones on purpose — the compat layer is what makes them
 * render in v2's palette, and rewriting them would mean re-testing a shell that
 * already works.
 *
 * What changed, and why:
 *
 *   1. **Routes are re-based under `/app`.** The legacy shell rendered `/home`,
 *      `/shield` and so on at the root. It now renders them as `/app/home`,
 *      `/app/shield`, … so the marketing site keeps `/`, `/login` and
 *      `/signup`. Every legacy `Link`/`navigate` call is rewritten through
 *      `appPath()` below rather than by editing 16 ported pages.
 *
 *   2. **A `ThemeToggle` joined the top nav.** The legacy shell had a
 *      light/dark switch buried in the More panel; the whole app now has one
 *      theme engine and the compact control is reachable from the bar.
 *
 *   3. **The legacy Shell's own dark-mode state is gone.** It wrote
 *      `harbour-theme` and `data-theme` itself, which would have fought the v2
 *      engine. `useShellTheme` only reads.
 *
 *   4. **Calm mode stays.** It is a Harbour-wide preference with no v2 owner,
 *      and `CalmModeProvider` keeps `data-calm` on <html> — the legacy CSS
 *      still keys off it.
 *
 *   5. **`ArrivalTransition` is preserved exactly.** It is the protected
 *      ripple/ship intro and still fires only on a client-side navigation from
 *      the landing page into login or signup.
 */

/** Re-base a legacy root path onto the `/app` prefix. */
import { appPath } from '../../lib/app-path';

/* Main destinations — shared by the desktop links and the mobile tab bar.
   The paths are legacy roots (plus `/scam`, the v2 Scam Shield page's own
   address); `appPath` adds the `/app` prefix at render time. */
const links = [
  ['Home', '/home', 'home'],
  ['Scam X-ray', '/scam', 'shield'],
  ['Settle-in list', '/checklist', 'checklist'],
  ['Cantonese helper', '/translate', 'translate'],
  ['Ask Harbour', '/chat', 'chat'],
] as const;

const moreLinks = [
  ['Rental Shield', '/rental', 'lock'],
  ['Cantonese helper', '/translate', 'translate'],
  ['Dashboard', '/dashboard', 'dashboard'],
  ['Find people', '/people', 'users'],
  ['Community', '/community', 'globe'],
  ['Tide Bank', '/tide-bank', 'waves'],
  ['Voice SOS', '/voice-sos', 'sos'],
] as const;

/* Mobile tab bar keeps the four most-used destinations plus More. */
const tabLinks = [
  [links[0][0], links[0][1], links[0][2], 'Home'],
  [links[1][0], links[1][1], links[1][2], 'X-ray'],
  [links[2][0], links[2][1], links[2][2], 'Tasks'],
  [links[4][0], links[4][1], links[4][2], 'Ask'],
] as const;

const TITLES: Record<string, string> = {
  '/home': 'My Harbour',
  '/dashboard': 'My Harbour',
  '/profile': 'Your profile',
  '/people': 'Find people',
  '/community': 'Community',
  '/voice-sos': 'Voice SOS',
  '/tide-bank': 'Tide Bank',
  '/rental': 'Rental Shield',
};

export function AppShell(): JSX.Element {
  const { profile } = useProfile();
  const navigate = useViewTransitionNavigate();
  const { pathname } = useLocation();
  const { dark } = useShellTheme();

  const [moreOpen, setMoreOpen] = useState(false);
  const [calmMode, setCalmMode] = useState(() => {
    try {
      const saved = localStorage.getItem('harbour-calm-mode');
      return saved
        ? saved === 'on'
        : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });
  const [arriving, setArriving] = useState(false);

  const previousPath = useRef(pathname);

  useLayoutEffect(() => {
    document.documentElement.dataset.calm = calmMode ? 'true' : 'false';
    try {
      localStorage.setItem('harbour-calm-mode', calmMode ? 'on' : 'off');
    } catch {
      /* Calm mode remains available for this visit. */
    }
  }, [calmMode]);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    setMoreOpen(false);
    previousPath.current = pathname;
  }, [pathname]);

  /**
   * The arrival ripple.
   *
   * The legacy rule was: play the protected ripple intro when the user arrives
   * at the app by a **client-side navigation from the landing page**, never on
   * a cold load or a deep link. That is preserved exactly — `fromLanding` is
   * true only when the previous route was `/`, and a deep link to `/app/home`
   * has no previous route at all, so it never fires. Reduced motion suppresses
   * it, as before.
   *
   * The old build fired it on `/login` and `/onboarding`; those are now v2
   * pages on their own routes, so the equivalent moment is the landing page
   * handing over to the app.
   */
  useEffect(() => {
    const fromLanding = previousPath.current === '/';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setArriving(fromLanding && !reduced);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return undefined;
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setMoreOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [moreOpen]);

  const closeMore = (): void => setMoreOpen(false);

  const currentTitle =
    TITLES[pathname] ??
    links.find(([, path]) => appPath(path) === pathname)?.[0] ??
    'Harbour';

  return (
    <div className="portal-shell">
      <a className="skip-link" href="#portal-main">
        Skip to main content
      </a>

      {/* Full-width glass backdrop behind the top nav pill, so the pill's
          sides aren't left out against a busy scene backdrop. Sits at
          z-index var(--z-raised), behind the pill's z-sticky and above the
          page content. pointer-events: none so it never intercepts clicks. */}
      <div className="portal-topnav-glass" aria-hidden="true" />

      <header className="harbour-topnav">
        <button
          type="button"
          className="brand"
          onClick={() => navigate(appPath('/home'))}
          aria-label="Harbour home"
        >
          <span className="brand-mark">
            <HarbourMark />
          </span>
          <span>Harbour</span>
        </button>

        <span className="harbour-title">{currentTitle}</span>

        <nav className="harbour-navlinks" aria-label="Harbour navigation">
          {links.map(([label, path, icon]) => (
            <NavLink
              end
              key={path}
              to={appPath(path)}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <Icon name={icon} size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="harbour-topnav-actions">
          <ThemeToggle variant="compact" />

          <button
            type="button"
            className="icon-button is-alert"
            onClick={() => navigate(appPath('/voice-sos'))}
            aria-label="Open Voice SOS"
          >
            <Icon name="sos" size={20} />
          </button>

          <button
            type="button"
            className="icon-button harbour-more-desktop"
            onClick={() => setMoreOpen(!moreOpen)}
            aria-label={
              moreOpen ? 'Close more destinations' : 'Open more destinations'
            }
            aria-expanded={moreOpen}
            aria-controls="harbour-more-panel"
          >
            <Icon name={moreOpen ? 'close' : 'more'} size={20} />
          </button>

          <button
            type="button"
            className="profile-chip"
            onClick={() => navigate(appPath('/dashboard'))}
            aria-label={`Open ${profile?.name || 'your'} dashboard`}
          >
            {profile?.photo || profile?.avatar ? (
              <img src={profile.photo || profile.avatar} alt="" />
            ) : (
              <span>{profile?.name?.[0]?.toUpperCase() || 'S'}</span>
            )}
            <strong>{profile?.name || 'Your profile'}</strong>
          </button>
        </div>
      </header>

      {moreOpen && (
        <button
          type="button"
          className="nav-scrim"
          aria-label="Close more destinations"
          onClick={closeMore}
        />
      )}

      {moreOpen && (
        <nav
          className="nav-more-panel"
          id="harbour-more-panel"
          aria-label="More destinations"
        >
          <span className="nav-group-label">MORE TO EXPLORE</span>
          {moreLinks.map(([label, path, icon]) => (
            <NavLink
              end
              key={path}
              to={appPath(path)}
              onClick={closeMore}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <span>
                <Icon name={icon} size={20} />
              </span>
              {label}
            </NavLink>
          ))}
          <NavLink
            end
            to={appPath('/profile')}
            onClick={closeMore}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <span>
              <Icon name="user" size={20} />
            </span>
            Your profile
          </NavLink>

          <section className="nav-display-settings" aria-label="Display settings">
            <span className="nav-group-label">MAKE HARBOUR COMFORTABLE</span>
            <button
              className="nav-setting-button"
              type="button"
              aria-pressed={calmMode}
              onClick={() => setCalmMode((value) => !value)}
            >
              <Icon name="waves" size={20} />
              <span>
                <strong>Reduce motion · {calmMode ? 'on' : 'off'}</strong>
                <small>
                  {calmMode
                    ? 'Pause decorative movement'
                    : 'Keep Harbour’s gentle motion'}
                </small>
              </span>
            </button>
          </section>

          <div className="nav-panel-footer">
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                closeMore();
                navigate('/');
              }}
              style={{ width: '100%' }}
            >
              <Icon
                name="chevronRight"
                size={18}
                style={{ transform: 'rotate(180deg)' }}
              />
              Back to public site
            </button>
          </div>
        </nav>
      )}

      <main className="portal-main" id="portal-main" tabIndex={-1}>
        <AppShellRoutes />
      </main>

      <nav className="harbour-tabs" aria-label="Primary destinations">
        {tabLinks.map(([label, path, icon, short]) => (
          <NavLink
            end
            key={path}
            to={appPath(path)}
            aria-label={label}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <Icon name={icon} size={22} />
            <span>{short || label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(!moreOpen)}
          aria-expanded={moreOpen}
          aria-controls="harbour-more-panel"
          aria-label={
            moreOpen ? 'Close more destinations' : 'Open more destinations'
          }
        >
          <Icon name={moreOpen ? 'close' : 'more'} size={22} />
          More
        </button>
      </nav>

      <ToastHost />

      {arriving && <ArrivalTransition onDone={() => setArriving(false)} />}

      {/* `dark` is read so the shell re-renders if the engine flips the theme
          from outside and any ported page that still branches on it stays in
          step. It is not the source of truth. */}
      <span hidden aria-hidden="true" data-shell-theme={dark ? 'dark' : 'light'} />
    </div>
  );
}
