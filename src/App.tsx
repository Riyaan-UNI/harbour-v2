import { Navigate, Route, Routes } from 'react-router-dom';
import { Aurora } from './components/Aurora';
import { Components } from './routes/dev/Components';
import { Gallery } from './routes/dev/Gallery';
import { Primitives } from './routes/dev/Primitives';

/**
 * Brick 0, 1 and 2a have no product routes — the landing page, signup and app
 * shell all arrive in later bricks. The real routes are the dev pages.
 *
 * Spec §12: dev pages sit behind a dev flag. They are on under `vite dev` and
 * can be forced on in a build with VITE_ENABLE_GALLERY.
 */
const devPagesEnabled =
  import.meta.env.DEV || Boolean(import.meta.env.VITE_ENABLE_GALLERY);

function FoundationPlaceholder(): JSX.Element {
  return (
    <>
      <Aurora />
      <main className="layer-raised max-w-page mx-auto grid min-h-svh place-content-center px-4 text-center">
        <p className="type-label text-text-muted">Harbour</p>
        <h1 className="type-h2 text-text mt-3">Foundation in place</h1>
        <p className="type-body text-text-muted mx-auto mt-3">
          Brick 0 ships the token layer, theme engine, fonts and aurora. Brick 1
          ships the layout primitives. Product pages arrive in later bricks.
        </p>
      </main>
    </>
  );
}

export function App(): JSX.Element {
  return (
    <Routes>
      {devPagesEnabled ? (
        <>
          <Route path="/dev/gallery" element={<Gallery />} />
          <Route path="/dev/primitives" element={<Primitives />} />
          <Route path="/dev/components" element={<Components />} />
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
  );
}
