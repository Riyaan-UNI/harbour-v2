import { Navigate, Route, Routes } from 'react-router-dom';
import { Aurora } from './components/Aurora';
import { Gallery } from './routes/dev/Gallery';

/**
 * Brick 0 has no product routes — the landing page, signup and app shell all
 * arrive in later bricks. The only real route is the dev gallery.
 *
 * Spec §12: the gallery sits behind a dev flag. It is on under `vite dev` and
 * can be forced on in a build with VITE_ENABLE_GALLERY.
 */
const galleryEnabled =
  import.meta.env.DEV || Boolean(import.meta.env.VITE_ENABLE_GALLERY);

function FoundationPlaceholder(): JSX.Element {
  return (
    <>
      <Aurora />
      <main className="layer-raised max-w-page mx-auto grid min-h-svh place-content-center px-4 text-center">
        <p className="type-label text-text-muted">Harbour</p>
        <h1 className="type-h2 text-text mt-3">Foundation in place</h1>
        <p className="type-body text-text-muted mx-auto mt-3">
          Brick 0 ships the token layer, theme engine, fonts and aurora. Product
          pages arrive in later bricks.
        </p>
      </main>
    </>
  );
}

export function App(): JSX.Element {
  return (
    <Routes>
      {galleryEnabled ? (
        <Route path="/dev/gallery" element={<Gallery />} />
      ) : null}
      <Route
        path="*"
        element={
          galleryEnabled ? (
            <Navigate to="/dev/gallery" replace />
          ) : (
            <FoundationPlaceholder />
          )
        }
      />
    </Routes>
  );
}
