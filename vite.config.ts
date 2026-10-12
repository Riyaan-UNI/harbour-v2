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
    },
  },
  // Bind to the IPv4 loopback explicitly: the default `localhost` resolves to
  // ::1 on some machines, which makes the Playwright webServer check (and any
  // 127.0.0.1 client) fail with a connection refused.
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
});
