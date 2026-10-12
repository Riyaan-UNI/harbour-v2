import { defineConfig } from '@playwright/test';

/**
 * Playwright config — spec §12.
 *
 * The gallery is dev-only (`import.meta.env.DEV`), so the suite runs against
 * the Vite dev server rather than a production build.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: 0,
  // The matrix takes a full-page screenshot of a long page at every viewport.
  // On a slow or networked filesystem that is heavy enough that context
  // teardown can exceed a 30s budget, so give each test room and keep the
  // worker count modest. Brick 2a raised this from 60s to 90s: the components
  // page is ~7,400px tall at 1024px and the PNG write to a mapped drive
  // occasionally took longer than 60s on its own. The assertions are unchanged
  // — only the budget.
  timeout: 90_000,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    launchOptions: {
      // Some environments export HTTP_PROXY. Without this, Chromium routes even
      // loopback requests through it and the dev server is unreachable.
      args: ['--no-proxy-server'],
    },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        // Each test sets its own viewport; this is just a starting size.
        viewport: { width: 1440, height: 900 },
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5173/dev/gallery',
    reuseExistingServer: true,
    timeout: 180_000,
    env: {
      NO_PROXY: '127.0.0.1,localhost',
      no_proxy: '127.0.0.1,localhost',
    },
  },
});
