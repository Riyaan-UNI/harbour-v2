/**
 * Close-range captures of the specific defects, at real device widths, so each
 * finding has a legible screenshot next to it in the report.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://127.0.0.1:5299';
const OUT = path.resolve('outputs/responsive-audit/closeups');
fs.mkdirSync(OUT, { recursive: true });

const SEED = {
  id: 'p_audit',
  name: 'Sam Okonkwo',
  country: 'GH',
  university: 'hku',
  socials: { instagram: 'sam.ok' },
  mascotId: 'whale',
  createdAt: '2026-01-01T00:00:00.000Z',
};

async function gotoWithRetry(page, url) {
  for (let i = 0; i < 4; i++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      return;
    } catch (e) {
      if (i === 3) throw e;
      await page.waitForTimeout(3000);
    }
  }
}

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file });
  return path.relative(process.cwd(), file).replace(/\\/g, '/');
}

async function run() {
  const browser = await chromium.launch({ args: ['--no-proxy-server'] });
  const made = [];

  /* 1 — /login at 320: the art block overlaps the panel heading. */
  {
    const ctx = await browser.newContext({
      viewport: { width: 320, height: 640 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    await gotoWithRetry(page, `${BASE}/login`);
    await page.waitForTimeout(3500);
    made.push(await shot(page, 'login_320_top'));
    // Scroll so the heading + art edge are both visible
    await page.evaluate(() => window.scrollTo(0, 120));
    await page.waitForTimeout(400);
    made.push(await shot(page, 'login_320_heading'));
    await ctx.close();
  }

  /* 2 — /app/chat at 360/390: composer + disclaimer under the tab bar. */
  for (const w of [360, 390]) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: w === 360 ? 740 : 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    await page.addInitScript((seed) => {
      window.localStorage.setItem('harbour:theme', 'dark');
      window.localStorage.setItem('harbour-profile', seed);
      window.localStorage.setItem(
        'harbour:v1:profiles',
        JSON.stringify([JSON.parse(seed)]),
      );
      window.localStorage.setItem('harbour:v1:activeProfileId', 'p_audit');
      window.localStorage.setItem('harbour-friends', '[]');
    }, JSON.stringify(SEED));
    await gotoWithRetry(page, `${BASE}/app/chat`);
    await page.waitForTimeout(3500);
    made.push(await shot(page, `chat_${w}_tail`));
    await ctx.close();
  }

  /* 3 — /app/translate at 320: title truncated with room to spare. */
  {
    const ctx = await browser.newContext({
      viewport: { width: 320, height: 640 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    await page.addInitScript((seed) => {
      window.localStorage.setItem('harbour:theme', 'dark');
      window.localStorage.setItem('harbour-profile', seed);
      window.localStorage.setItem(
        'harbour:v1:profiles',
        JSON.stringify([JSON.parse(seed)]),
      );
      window.localStorage.setItem('harbour:v1:activeProfileId', 'p_audit');
      window.localStorage.setItem('harbour-friends', '[]');
    }, JSON.stringify(SEED));
    await gotoWithRetry(page, `${BASE}/app/translate`);
    await page.waitForTimeout(3500);
    const nav = await page.$('.harbour-topnav');
    if (nav) {
      const file = path.join(OUT, 'translate_320_nav.png');
      await nav.screenshot({ path: file });
      made.push(path.relative(process.cwd(), file).replace(/\\/g, '/'));
    }
    await ctx.close();
  }

  /* 4 — /app/* top nav at 1024/1090: the profile chip escapes. */
  for (const w of [1024, 1090, 1150]) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: 800 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.addInitScript((seed) => {
      window.localStorage.setItem('harbour:theme', 'dark');
      window.localStorage.setItem('harbour-profile', seed);
      window.localStorage.setItem(
        'harbour:v1:profiles',
        JSON.stringify([JSON.parse(seed)]),
      );
      window.localStorage.setItem('harbour:v1:activeProfileId', 'p_audit');
      window.localStorage.setItem('harbour-friends', '[]');
    }, JSON.stringify(SEED));
    await gotoWithRetry(page, `${BASE}/app/home`);
    await page.waitForTimeout(3500);
    const file = path.join(OUT, `nav_${w}.png`);
    await page.screenshot({
      path: file,
      clip: { x: Math.max(0, w - 560), y: 0, width: Math.min(560, w), height: 110 },
    });
    made.push(path.relative(process.cwd(), file).replace(/\\/g, '/'));
    await ctx.close();
  }

  /* 5 — /app/home long name in the chip at 1024 (ellipsis mid-word). */
  {
    const ctx = await browser.newContext({
      viewport: { width: 1024, height: 800 },
      deviceScaleFactor: 3,
    });
    const page = await ctx.newPage();
    await page.addInitScript(
      ({ seed, name }) => {
        const p = { ...JSON.parse(seed), name };
        window.localStorage.setItem('harbour:theme', 'dark');
        window.localStorage.setItem('harbour-profile', JSON.stringify(p));
        window.localStorage.setItem('harbour:v1:profiles', JSON.stringify([p]));
        window.localStorage.setItem('harbour:v1:activeProfileId', 'p_audit');
        window.localStorage.setItem('harbour-friends', '[]');
      },
      { seed: JSON.stringify(SEED), name: 'Anastasia Konstantinopoulos' },
    );
    await gotoWithRetry(page, `${BASE}/app/home`);
    await page.waitForTimeout(3500);
    const chip = await page.$('.profile-chip');
    if (chip) {
      const file = path.join(OUT, 'chip_longname_1024.png');
      await chip.screenshot({ path: file });
      made.push(path.relative(process.cwd(), file).replace(/\\/g, '/'));
    }
    await ctx.close();
  }

  /* 6 — /signup at 320: step announcement + any clipping. */
  {
    const ctx = await browser.newContext({
      viewport: { width: 320, height: 640 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    await gotoWithRetry(page, `${BASE}/signup`);
    await page.waitForTimeout(3500);
    made.push(await shot(page, 'signup_320'));
    await ctx.close();
  }

  await browser.close();
  fs.writeFileSync(
    path.join(OUT, 'index.json'),
    JSON.stringify(made, null, 2),
  );
  console.log(made.join('\n'));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
