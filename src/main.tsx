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

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
