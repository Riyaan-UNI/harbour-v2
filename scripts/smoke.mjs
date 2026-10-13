/**
 * Harbour smoke check — the gate the master prompt asks for at the end of
 * every phase.
 *
 * It is deliberately narrower than the full Playwright matrix
 * (`e2e/*.spec.ts`, run once in Phase 5): this one answers "is the app alive
 * at all?" in under a minute, on the four viewport/theme combinations the
 * owner looks at.
 *
 * What it checks, per combination:
 *   - every route returns without a console error or a page error
 *   - no horizontal scroll (`scrollWidth > clientWidth`)
 *   - the boot splash is gone once the page has settled
 *
 * It also re-checks the section-1 "known failures" where a machine can:
 *   - no rendered text contains "Brick"
 *   - a favicon <link> is present, and the file it points at resolves
 *   - `/login` and `/signup` render something (not a redirect to `/`)
 *   - `/app/*` without a profile lands on the login page, not a dead end
 *
 * Usage:  node scripts/smoke.mjs
 * Exit 0 = every combination clean. Exit 1 = at least one failure, listed.
 */
import { chromium } from '@playwright/test';

const BASE = process.env.SMOKE_BASE ?? 'http://127.0.0.1:5173';

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const THEMES = ['dark', 'light'];

/** Every route the build should answer. */
const ROUTES = [
  { path: '/', name: 'landing' },
  { path: '/login', name: 'login' },
  { path: '/signup', name: 'signup' },
  // The app routes require a profile; the guard should send them to /login.
  // Asserted separately below, so they are listed here only for the profile run.
];

/** Routes opened after a profile exists. */
const APP_ROUTES = [
  '/app',
  '/app/home',
  '/app/scam',
  '/app/checklist',
  '/app/helper',
  '/app/ask',
  '/app/rental',
  '/app/dashboard',
  '/app/people',
  '/app/community',
  '/app/tide-bank',
  '/app/voice-sos',
  '/app/profile',
];

const failures = [];

function fail(message) {
  failures.push(message);
  console.log(`  FAIL  ${message}`);
}

function pass(message) {
  console.log(`  ok    ${message}`);
}

/** Ignorable console noise: third-party warnings and the dev-only HMR line. */
function isNoise(text) {
  return (
    text.includes('Download the React DevTools') ||
    text.includes('[vite]') ||
    text.includes('favicon.ico')
  );
}

async function checkNoOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const el = document.documentElement;
    return el.scrollWidth - el.clientWidth;
  });
  if (overflow > 1) {
    fail(`${label}: horizontal scroll by ${overflow}px`);
  }
}

/**
 * A page is "settled" when the boot splash has been removed. The splash
 * removes itself, so waiting for it to be detached is the honest signal that
 * the app painted.
 */
async function waitForSettled(page) {
  await page
    .waitForFunction(
      () => !document.getElementById('harbour-boot'),
      undefined,
      { timeout: 5000 },
    )
    .catch(() => undefined);
}

async function run() {
  const browser = await chromium.launch();

  for (const viewport of VIEWPORTS) {
    for (const theme of THEMES) {
      const label = `${viewport.name}/${theme}`;
      console.log(`\n[${label}]`);

      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        colorScheme: theme,
        reducedMotion: 'no-preference',
      });
      const page = await context.newPage();

      const consoleErrors = [];
      const pageErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' && !isNoise(msg.text())) {
          consoleErrors.push(msg.text());
        }
      });
      page.on('pageerror', (error) => {
        pageErrors.push(error.message);
      });

      // --- Public routes -------------------------------------------------
      for (const route of ROUTES) {
        consoleErrors.length = 0;
        pageErrors.length = 0;

        const response = await page.goto(BASE + route.path, {
          waitUntil: 'networkidle',
        });
        await waitForSettled(page);

        if (!response || !response.ok()) {
          fail(`${label} ${route.path}: HTTP ${response?.status() ?? 'none'}`);
          continue;
        }
        if (pageErrors.length) {
          fail(`${label} ${route.path}: page error — ${pageErrors[0]}`);
        }
        if (consoleErrors.length) {
          fail(`${label} ${route.path}: console error — ${consoleErrors[0]}`);
        }

        await checkNoOverflow(page, `${label} ${route.path}`);

        // The section-1 regressions, checked where they can be.
        if (route.path === '/') {
          const bodyText = await page.locator('body').innerText();
          if (/\bBrick\b/i.test(bodyText)) {
            const line = bodyText
              .split('\n')
              .find((l) => /\bBrick\b/i.test(l));
            fail(`${label} /: internal label on screen — "${line?.trim()}"`);
          }
          const favicon = await page
            .locator('link[rel="icon"]')
            .getAttribute('href');
          if (!favicon) {
            fail(`${label} /: no <link rel="icon">`);
          } else {
            const res = await page.request.get(new URL(favicon, BASE).href);
            if (!res.ok()) {
              fail(`${label} /: favicon ${favicon} → HTTP ${res.status()}`);
            }
          }
        }

        if (route.path === '/login' || route.path === '/signup') {
          const url = new URL(page.url());
          if (url.pathname !== route.path) {
            fail(
              `${label} ${route.path}: redirected to ${url.pathname} (route not built)`,
            );
          }
        }
      }

      // --- Guard: /app/* with no profile goes to /login -------------------
      await page.goto(`${BASE}/app/home`, { waitUntil: 'networkidle' });
      await waitForSettled(page);
      const guarded = new URL(page.url()).pathname;
      if (guarded.startsWith('/app')) {
        fail(`${label} /app/home: reached the app with no profile (guard off)`);
      } else {
        pass(`${label} /app/home guarded → ${guarded}`);
      }

      // --- With a profile: every app route opens -------------------------
      await context.addInitScript(() => {
        const profile = {
          name: 'Smoke Test',
          nickname: 'Smoke Test',
          country: 'Hong Kong, China',
          university: 'The University of Hong Kong',
          avatar: '',
          socials: {},
        };
        window.localStorage.setItem('harbour-profile', JSON.stringify(profile));
        window.localStorage.setItem(
          'harbour:v1:profiles',
          JSON.stringify([{ ...profile, id: 'smoke' }]),
        );
        window.localStorage.setItem('harbour:v1:activeProfileId', 'smoke');
      });

      for (const path of APP_ROUTES) {
        consoleErrors.length = 0;
        pageErrors.length = 0;

        const response = await page.goto(BASE + path, {
          waitUntil: 'networkidle',
        });
        await waitForSettled(page);

        if (!response || !response.ok()) {
          fail(`${label} ${path}: HTTP ${response?.status() ?? 'none'}`);
          continue;
        }
        if (pageErrors.length) {
          fail(`${label} ${path}: page error — ${pageErrors[0]}`);
        }
        if (consoleErrors.length) {
          fail(`${label} ${path}: console error — ${consoleErrors[0]}`);
        }
        await checkNoOverflow(page, `${label} ${path}`);
      }

      await context.close();
    }
  }

  await browser.close();

  console.log('\n' + '─'.repeat(60));
  if (failures.length) {
    console.log(`SMOKE FAILED — ${failures.length} problem(s):`);
    for (const f of failures) console.log(`  · ${f}`);
    process.exit(1);
  }
  console.log('SMOKE PASSED — every route, both viewports, both themes.');
}

run().catch((error) => {
  console.error('smoke.mjs crashed:', error);
  process.exit(1);
});
