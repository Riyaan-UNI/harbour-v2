import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Aurora } from './components/Aurora';
import { Toaster } from './components/ui';
import { Stack, Text } from './components/layout';

/**
 * Routing.
 *
 * Brick 0 to 2a had no product routes — the landing page, signup and app shell
 * all arrive in later bricks, so the only real routes were the dev pages.
 * Brick 3 adds `/` (Part C) and makes the dev pages load on demand.
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

function FoundationPlaceholder(): JSX.Element {
  return (
    <>
      <Aurora />
      <main className="layer-raised max-w-page mx-auto grid min-h-svh place-content-center px-4 text-center">
        <p className="type-label text-text-muted">Harbour</p>
        <h1 className="type-h2 text-text mt-3">Foundation in place</h1>
        <p className="type-body text-text-muted mx-auto mt-3">
          Bricks 0 to 2a ship the token layer, theme engine, fonts, aurora and
          the shared components. The landing page arrives in Brick 3.
        </p>
      </main>
    </>
  );
}

export function App(): JSX.Element {
  return (
    <>
      <Routes>
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
        <Route
          path="*"
          element={
            devPagesEnabled ? (
              <Navigate to="/dev/gallery" replace />
            ) : (
              <FoundationPlaceholder />
            )
          }
        />
      </Routes>
      {/* One Toaster for the whole app, so a toast never has two homes. */}
      <Toaster />
    </>
  );
}
