/**
 * The legacy lane's router surface.
 *
 * Every ported page imports `Link` or `useNavigate` from `"react-router-dom"`.
 * Those pages were written when the app owned the whole origin, so they navigate
 * to **root paths** (`/home`, `/shield`, `/`), while the v2 app serves them under
 * `/app/...`.
 *
 * Rather than edit ~40 call sites across 16 ported files — which would break the
 * "the legacy lane's logic is not rewritten" rule and make a future diff against
 * the old build meaningless — every legacy file's router import is re-pointed at
 * this module. It exports the same names with the same signatures, so **not one
 * call site changes**; the re-basing happens inside.
 *
 * This file is plain `.jsx` (no type annotations) like the rest of the legacy
 * lane, because it lives under `src/legacy/` and is outside the TS project.
 */
import {
  Link as RouterLink,
  useNavigate as useRouterNavigate,
} from 'react-router-dom';

export {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom';

/** The root-level routes that are NOT part of the app lane. */
const ENTRY_ROUTES = new Set(['/login', '/signup', '/onboarding']);

/**
 * Re-base one legacy destination.
 *
 * Passed through untouched when it is:
 *   - already under `/app`;
 *   - one of the entry routes, which live at the root by design;
 *   - an in-page anchor (`#tools`) or an external scheme (`tel:999`,
 *     `https://…`), neither of which is a router path.
 */
export function legacyPath(to) {
  if (!to) return '/';
  if (to.startsWith('/app')) return to;
  if (ENTRY_ROUTES.has(to)) return to;
  if (to.startsWith('#')) return to;
  if (/^[a-z][a-z0-9+.-]*:/i.test(to)) return to;
  if (to === '/') return '/';
  return '/app' + to;
}

/** `useNavigate`, with legacy root paths re-based. */
export function useNavigate() {
  const navigate = useRouterNavigate();
  return (to, options) => navigate(legacyPath(to), options);
}

/**
 * `Link`, with legacy root paths re-based.
 *
 * It stays a real anchor rather than becoming a click handler, so middle-click
 * and "open in new tab" keep working on every ported link.
 */
export function Link({ to, ...rest }) {
  return <RouterLink to={legacyPath(to)} {...rest} />;
}
