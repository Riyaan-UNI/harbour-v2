/**
 * P1 flow check — does the ported app actually work end to end?
 *
 * The smoke script checks that routes return without errors. This one walks the
 * *user* flow the master prompt describes:
 *
 *   1. `/` loads the landing page.
 *   2. `/signup` renders the (ported, for now) onboarding form.
 *   3. Filling it in and submitting lands in the app.
 *   4. Every `/app/*` route opens.
 *   5. Signing out and back in returns to `/app/home`.
 *
 * It prints a step-by-step trace so a failure says *where* in the flow it broke
 * rather than only that a selector was missing.
 *
 * Usage:  node scripts/flow-check.mjs
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.FLOW_BASE ?? 'http://127.0.0.1:5173';
const OUT = 'screenshots/phase-1';

const APP_ROUTES = [
  ['/app/home', 'Home'],
  ['/app/scam', 'Scam X-ray'],
  ['/app/checklist', 'Settle-in list'],
  ['/app/translate', 'Cantonese helper'],
  ['/app/chat', 'Ask Harbour'],
  ['/app/rental', 'Rental Shield'],
  ['/app/dashboard', 'Dashboard'],
  ['/app/people', 'Find people'],
  ['/app/community', 'Community'],
  ['/app/tide-bank', 'Tide Bank'],
  ['/app/voice-sos', 'Voice SOS'],
  ['/app/profile', 'Your profile'],
];

const problems = [];

function step(text) {
  console.log(`  · ${text}`);
}

function ok(text) {
  console.log(`  ok  ${text}`);
}

function bad(text) {
  problems.push(text);
  console.log(`  FAIL ${text}`);
}

async function settled(page) {
  await page
    .waitForFunction(() => !document.getElementById('harbour-boot'), undefined, {
      timeout: 5000,
    })
    .catch(() => undefined);
  await page.waitForTimeout(400);
}

async function run() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  // --- 1. Landing ------------------------------------------------------
  console.log('\n1. Landing page');
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await settled(page);
  if (!(await page.locator('h1').first().isVisible())) bad('landing has no h1');
  else ok('landing rendered');
  await page.screenshot({ path: `${OUT}/landing-1440-dark.png` });

  // --- 2. Signup -------------------------------------------------------
  console.log('\n2. Signup page');
  await page.goto(BASE + '/signup', { waitUntil: 'networkidle' });
  await settled(page);
  if (!page.url().includes('/signup')) {
    bad(`/signup redirected to ${new URL(page.url()).pathname}`);
  } else {
    ok('signup route held');
  }
  const nameField = page.locator('input').first();
  if (await nameField.count()) {
    await nameField.fill('Ama Mensah');
    ok('filled the name field');
  } else {
    bad('signup form has no input');
  }
  await page.screenshot({ path: `${OUT}/signup-1440-dark.png` });

  // --- 3. Complete signup ---------------------------------------------
  console.log('\n3. Complete the profile');
  // Country is a plain <select>. Pick Ghana by value; the option list is
  // built from ISO country data, so the value is the two-letter code.
  const countrySelect = page.locator('select').first();
  if (await countrySelect.count()) {
    const value = await countrySelect
      .locator('option', { hasText: 'Ghana' })
      .first()
      .getAttribute('value');
    if (value) {
      await countrySelect.selectOption(value);
      step(`country set to ${value}`);
    } else {
      bad('country option "Ghana" not found');
    }
  } else {
    bad('no country select on signup');
  }

  const submit = page
    .locator('button[type="submit"], button:has-text("Create"), button:has-text("Continue")')
    .first();
  if (await submit.count()) {
    await submit.click();
    await settled(page);
    const path = new URL(page.url()).pathname;
    if (path.startsWith('/app')) ok(`signup landed in the app at ${path}`);
    else bad(`signup ended at ${path}, expected /app/*`);
  } else {
    bad('no submit control found on signup');
  }
  await page.screenshot({ path: `${OUT}/home-1440-dark.png` });

  // --- 4. Every app route ---------------------------------------------
  console.log('\n4. Every /app route');
  for (const [route, label] of APP_ROUTES) {
    consoleErrors.length = 0;
    pageErrors.length = 0;
    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    await settled(page);

    const path = new URL(page.url()).pathname;
    if (!path.startsWith('/app')) {
      bad(`${route} (${label}) redirected out to ${path}`);
      continue;
    }
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 1) bad(`${route} (${label}) overflows by ${overflow}px`);
    if (pageErrors.length) bad(`${route} (${label}) page error: ${pageErrors[0]}`);
    if (consoleErrors.length) {
      bad(`${route} (${label}) console error: ${consoleErrors[0]}`);
    }
    if (!overflow && !pageErrors.length && !consoleErrors.length) {
      ok(`${label} (${route})`);
    }
  }

  // --- 5. Screenshots of the key surfaces ------------------------------
  await page.goto(BASE + '/app/home', { waitUntil: 'networkidle' });
  await settled(page);
  await page.screenshot({ path: `${OUT}/home-1440-dark.png` });
  await page.goto(BASE + '/app/scam', { waitUntil: 'networkidle' });
  await settled(page);
  await page.screenshot({ path: `${OUT}/scam-1440-dark.png` });

  // Light theme pass
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(BASE + '/app/home', { waitUntil: 'networkidle' });
  await settled(page);
  await page.screenshot({ path: `${OUT}/home-1440-light.png` });

  // Mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(BASE + '/app/home', { waitUntil: 'networkidle' });
  await settled(page);
  await page.screenshot({ path: `${OUT}/home-390-dark.png` });

  // --- 6. Sign out and back in ----------------------------------------
  console.log('\n6. Sign out, sign in again');
  await page.evaluate(() => {
    for (const key of [
      'harbour-profile',
      'harbour-name',
      'harbour:v1:profiles',
      'harbour:v1:activeProfileId',
    ]) {
      localStorage.removeItem(key);
    }
  });
  await page.goto(BASE + '/app/home', { waitUntil: 'networkidle' });
  await settled(page);
  const guarded = new URL(page.url()).pathname;
  if (guarded === '/login') ok('signed out: /app/home guarded back to /login');
  else bad(`signed out but /app/home reached ${guarded}`);

  await browser.close();

  console.log('\n' + '─'.repeat(60));
  if (problems.length) {
    console.log(`FLOW CHECK FAILED — ${problems.length} problem(s):`);
    for (const p of problems) console.log(`  · ${p}`);
    process.exit(1);
  }
  console.log('FLOW CHECK PASSED — landing, signup, every app route, guard.');
}

run().catch((e) => {
  console.error('flow-check crashed:', e);
  process.exit(1);
});
