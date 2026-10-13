/**
 * Screenshot pack — one script, parameterised by phase.
 *
 * Usage:  node scripts/shots.mjs <phase>      (e.g. node scripts/shots.mjs 0)
 *
 * Writes to `screenshots/phase-<n>/`. Each shot is named
 * `<surface>-<width>-<theme>.png` so the owner can see at a glance what a
 * given file is.
 *
 * If a cover image is needed (the hero's above-the-fold state), the script
 * scrolls to the very top first — a screenshot after any scroll would show the
 * nav in its glass state rather than its bare one.
 */
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const phase = process.argv[2] ?? '0';
const BASE = process.env.SHOTS_BASE ?? 'http://127.0.0.1:5173';
const OUT = `screenshots/phase-${phase}`;

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const THEMES = ['dark', 'light'];

/**
 * Each surface: a name, the route, and whether a profile must be present.
 * `scroll` scrolls to a section before shooting — used for the below-fold
 * sections so the pack shows them rather than a viewport of hero.
 */
const SURFACES = [
  { name: 'landing', path: '/', needsProfile: false },
  { name: 'login', path: '/login', needsProfile: false },
  { name: 'signup', path: '/signup', needsProfile: false },
  { name: 'home', path: '/app/home', needsProfile: true },
  { name: 'tools', path: '/#tools', needsProfile: false },
  { name: 'how-it-works', path: '/#how-it-works', needsProfile: false },
];

const PROFILE = {
  name: 'Ama Mensah',
  nickname: 'Ama',
  country: 'Ghana',
  university: 'The University of Hong Kong',
  avatar: '',
  socials: {},
};

async function waitForSettled(page) {
  await page
    .waitForFunction(() => !document.getElementById('harbour-boot'), undefined, {
      timeout: 5000,
    })
    .catch(() => undefined);
  // Let entrance tweens land so the shot is the final state, not a frame of it.
  await page.waitForTimeout(1600);
}

async function run() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();

  for (const viewport of VIEWPORTS) {
    for (const theme of THEMES) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        colorScheme: theme,
        reducedMotion: 'no-preference',
      });
      const page = await context.newPage();

      for (const surface of SURFACES) {
        if (surface.needsProfile) {
          await context.addInitScript(
            (profile) => {
              window.localStorage.setItem(
                'harbour-profile',
                JSON.stringify(profile),
              );
              window.localStorage.setItem(
                'harbour:v1:profiles',
                JSON.stringify([{ ...profile, id: 'shot' }]),
              );
              window.localStorage.setItem('harbour:v1:activeProfileId', 'shot');
            },
            PROFILE,
          );
        }

        try {
          await page.goto(BASE + surface.path, { waitUntil: 'networkidle' });
          await waitForSettled(page);
          // An anchor route needs the target actually in view.
          if (surface.path.includes('#')) {
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.waitForTimeout(400);
          }
          const file = `${OUT}/${surface.name}-${viewport.width}-${theme}.png`;
          await page.screenshot({ path: file, fullPage: false });
          console.log(`  ${file}`);
        } catch (error) {
          console.log(`  SKIP  ${surface.name} (${error.message})`);
        }
      }

      await context.close();
    }
  }

  await browser.close();
  console.log(`\nScreenshots written to ${OUT}/`);
}

run().catch((error) => {
  console.error('shots.mjs crashed:', error);
  process.exit(1);
});
