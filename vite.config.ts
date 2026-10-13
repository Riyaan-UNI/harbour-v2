import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Brick 0 keeps the Vite config deliberately thin: React, Tailwind v4 via its
// first-party Vite plugin (CSS-first, no tailwind.config.js), and fixed ports so
// the Playwright webServer can find the dev server predictably.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // shadcn/ui resolves its imports through `@/`; components.json declares the
  // same alias so a future `npx shadcn add` lands in the right place.
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // The ported legacy lane. Its files are excluded from the TS project, so
      // this alias is what keeps the specifier out of tsc's relative-path
      // resolution while Vite still finds the real file.
      '@legacy': fileURLToPath(new URL('./src/legacy', import.meta.url)),
    },
  },
  // Bind to the IPv4 loopback explicitly: the default `localhost` resolves to
  // ::1 on some machines, which makes the Playwright webServer check (and any
  // 127.0.0.1 client) fail with a connection refused.
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    open: '/dev',
    // The legacy Express lane runs on 5000. Proxying `/api` here means the
    // ported client's relative `fetch('/api/...')` calls work in dev with no
    // change to legacy code, and the browser sees one origin.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
});
