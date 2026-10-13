import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { initTheme } from './theme/theme';
import './styles/index.css';

// The pre-paint script in index.html has already set data-theme on <html>.
// This re-applies it through the engine so the store, the meta theme-color and
// the system-preference listener all agree from the first frame.
initTheme();

const container = document.getElementById('root');

if (!container) {
  throw new Error('Harbour: #root container is missing from index.html.');
}

/**
 * Boot splash handoff.
 *
 * The splash is plain HTML in index.html, so it is painted before this module
 * runs. Two rules keep it from being a nuisance:
 *
 *   - a floor of 600 ms, so it never flashes for a single frame; and
 *   - a ceiling of 1800 ms, armed from module load rather than from the first
 *     paint, so a bundle that never mounts cannot strand the user on it.
 *
 * Whichever arrives first starts the fade; the element is removed once the
 * fade ends, so it costs the document nothing afterwards. The timer is armed
 * here (not inside the effect) because module evaluation happens whether or
 * not React ever commits.
 */
const MIN_SPLASH_MS = 600;
const MAX_SPLASH_MS = 1800;

function dismissBootSplash(): void {
  const splash = document.getElementById('harbour-boot');
  if (!splash || splash.dataset.leaving === 'true') return;
  splash.dataset.leaving = 'true';
  splash.addEventListener('transitionend', () => splash.remove(), {
    once: true,
  });
  // Belt and braces: if the transition is skipped (reduced motion, a
  // stylesheet that failed to load), the element still goes away.
  window.setTimeout(() => splash.remove(), 600);
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

// Floor: the splash is up for at least 600 ms from module load.
window.setTimeout(dismissBootSplash, MIN_SPLASH_MS);
// Ceiling: whatever else happens, it comes down.
window.setTimeout(dismissBootSplash, MAX_SPLASH_MS);
