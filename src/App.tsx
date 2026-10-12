import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Stack, Text } from './components/layout';
import { Toaster } from './components/ui';
import { Landing } from './routes/Landing';

/**
 * Routing.
 *
 * Brick 0 to 2a had no product routes — the landing page, signup and app shell
 * all arrive in later bricks, so the only real routes were the dev pages.
 * Brick 3 adds `/`, and the dev pages load on demand.
 *
 * Spec §12: dev pages sit behind a dev flag. They are on under `vite dev` and
 * can be forced on in a build with VITE_ENABLE_GALLERY.
 */
const devPagesEnabled =
  import.meta.env.DEV || Boolean(import.meta.env.VITE_ENABLE_GALLERY);

/**
 * The three dev pages are `lazy`, so Rollup emits them as their own chunks and
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
    <>
      <Routes>
        <Route path="/" element={<Landing />} />

        {devPagesEnabled ? (
          <>
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

        {/* Signup, login and the app shell arrive in Bricks 5 to 9. Until then
            an unknown path goes back to the landing page rather than to a dead
            end. The dev routes above still win, because they are declared first
            and match exactly. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* One Toaster for the whole app, so a toast never has two homes. */}
      <Toaster />
    </>
  );
}
