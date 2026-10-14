import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Stack, Text } from './components/layout';
import { Toaster } from './components/ui';
import { ProfileProvider } from '@legacy/context/ProfileContext.jsx';

const Landing = lazy(() =>
  import('./routes/Landing').then((module) => ({ default: module.Landing })),
);
const LoginRoute = lazy(() =>
  import('./routes/entry').then((module) => ({ default: module.LoginRoute })),
);
const SignupRoute = lazy(() =>
  import('./routes/entry').then((module) => ({ default: module.SignupRoute })),
);
const ArrivalStoryRoute = lazy(() =>
  import('./routes/entry').then((module) => ({
    default: module.ArrivalStoryRoute,
  })),
);
const GuardedApp = lazy(() =>
  import('./components/app/AppGuard').then((module) => ({
    default: module.GuardedApp,
  })),
);

/**
 * Routing.
 *
 * Three lanes, in one table:
 *
 *   - `/` plus the dev pages — the v2 lane.
 *   - `/login`, `/signup`, and `/arrival` — local profile selection, onboarding,
 *     and the post-signup story.
 *   - `/app/*` — the ported legacy app, behind `AppGuard`, which sends an
 *     unauthenticated visit to `/login`.
 *
 * Spec §12: dev pages sit behind a dev flag. They are on under `vite dev` and
 * can be forced on in a build with VITE_ENABLE_GALLERY.
 *
 * `ProfileProvider` wraps everything rather than only the app lane, because
 * `/login` and `/signup` read the same profile the app does — one store, one
 * context, so "signed in" cannot mean two different things on two routes.
 */
const devPagesEnabled =
  import.meta.env.DEV || Boolean(import.meta.env.VITE_ENABLE_GALLERY);

/**
 * The four dev pages are `lazy`, so Rollup emits them as their own chunks and
 * a production build does not carry them. Their named exports are mapped to a
 * default here, which keeps each page file exporting only what it renders.
 */
const Gallery = lazy(() =>
  import('./routes/dev/Gallery').then((module) => ({
    default: module.Gallery,
  })),
);
const Primitives = lazy(() =>
  import('./routes/dev/Primitives').then((module) => ({
    default: module.Primitives,
  })),
);
const Components = lazy(() =>
  import('./routes/dev/Components').then((module) => ({
    default: module.Components,
  })),
);
const DevHub = lazy(() =>
  import('./routes/dev/DevHub').then((module) => ({
    default: module.DevHub,
  })),
);

/**
 * A calm placeholder while a lazily loaded route arrives. It is deliberately
 * plain: on a dev page it is on screen for a few frames, and in production it
 * is never reached at all.
 */
function RouteFallback(): JSX.Element {
  return (
    <main className="layer-raised grid min-h-svh place-content-center px-4">
      <Stack gap={2} align="center">
        <Text role="label" tone="muted">
          Harbour
        </Text>
        <Text role="small" tone="muted">
          Loading…
        </Text>
      </Stack>
    </main>
  );
}

export function App(): JSX.Element {
  return (
    <ProfileProvider>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />

          {/* The entry lane. Both routes own their full-viewport shell. */}
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/signup" element={<SignupRoute />} />
          <Route path="/arrival" element={<ArrivalStoryRoute />} />
          {/* The old build called it `/onboarding`; the link lives on in case a
              bookmark or an old internal link still points at it. */}
          <Route
            path="/onboarding"
            element={<Navigate to="/signup" replace />}
          />

          {/* The ported app, guarded. One route covering `/app` and everything
              under it, so the shell mounts once and its own route table handles
              the sub-paths. */}
          <Route path="/app/*" element={<GuardedApp />} />

          {devPagesEnabled ? (
            <>
              <Route
                path="/dev"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <DevHub />
                  </Suspense>
                }
              />
              <Route
                path="/dev/gallery"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <Gallery />
                  </Suspense>
                }
              />
              <Route
                path="/dev/primitives"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <Primitives />
                  </Suspense>
                }
              />
              <Route
                path="/dev/components"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <Components />
                  </Suspense>
                }
              />
            </>
          ) : null}

          {/* An unknown path goes back to the landing page rather than to a
              dead end. The routes above still win because they match first. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* One Toaster for the whole app, so a toast never has two homes. */}
      <Toaster />
    </ProfileProvider>
  );
}
