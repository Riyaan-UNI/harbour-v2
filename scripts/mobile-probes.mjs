/**
 * Targeted probes for the findings from the sweep — element-level screenshots
 * and measurements so each claim has visual evidence.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://127.0.0.1:5199';
const OUT = path.resolve('outputs/responsive-audit/probes');
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

async function newPage(browser, w, h) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 2,
    isMobile: w < 500,
    hasTouch: w < 900,
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
  return { ctx, page };
}


async function gotoWithRetry(page, url) {
  for (let i = 0; i < 3; i++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      return;
    } catch (e) {
      if (i === 2) throw e;
      await page.waitForTimeout(2500);
    }
  }
}

const results = {};

async function shot(page, name, opts = {}) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, ...opts });
  return path.relative(process.cwd(), file).replace(/\\/g, '/');
}

async function run() {
  const browser = await chromium.launch({ args: ['--no-proxy-server'] });

  /* ---- PROBE 1: /app/* top nav at 1024 — the shell switches to desktop
     links at exactly 1024 but "mobile" ends at 1023.98. Check whether the
     action cluster collides with the page title / nav links. ---- */
  for (const w of [1023, 1024, 1100, 1280]) {
    const { ctx, page } = await newPage(browser, w, 800);
    await gotoWithRetry(page, `${BASE}/app/home`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const probe = await page.evaluate(() => {
      const rect = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          x: Math.round(r.x),
          right: Math.round(r.right),
          w: Math.round(r.width),
          display: cs.display,
          text: (el.textContent || '').trim().slice(0, 30),
        };
      };
      const nav = document.querySelector('.harbour-topnav');
      const nr = nav.getBoundingClientRect();
      const items = [...nav.children].map((el) => {
        const r = el.getBoundingClientRect();
        return {
          cls: (typeof el.className === 'string' ? el.className : '')
            .split(/\s+/)
            .slice(0, 2)
            .join('.'),
          x: Math.round(r.x),
          right: Math.round(r.right),
          w: Math.round(r.width),
          display: getComputedStyle(el).display,
        };
      });
      // Overlap between the title and the action cluster
      const title = document.querySelector('.harbour-title');
      const actions = document.querySelector('.harbour-topnav-actions');
      let overlap = 0;
      if (title && actions) {
        const t = title.getBoundingClientRect();
        const a = actions.getBoundingClientRect();
        overlap = Math.max(0, Math.round(t.right - a.left));
      }
      return {
        navWidth: Math.round(nr.width),
        navRight: Math.round(nr.right),
        innerWidth: window.innerWidth,
        docScrollW: document.documentElement.scrollWidth,
        items,
        title: rect('.harbour-title'),
        navlinks: rect('.harbour-navlinks'),
        actions: rect('.harbour-topnav-actions'),
        profileChip: rect('.profile-chip'),
        titleActionsOverlap: overlap,
        actionsOverflow: actions
          ? Math.round(actions.getBoundingClientRect().right - window.innerWidth)
          : null,
      };
    });
    results[`topnav_${w}`] = probe;
    await page.screenshot({
      path: path.join(OUT, `topnav_${w}.png`),
      clip: { x: 0, y: 0, width: w, height: 120 },
    });
    await ctx.close();
  }

  /* ---- PROBE 2: landing tool deck at 320/390 — cards escaping right.
     Is it a deliberate horizontal scroll-snap rail, or a broken grid? ---- */
  for (const w of [320, 390]) {
    const { ctx, page } = await newPage(browser, w, 844);
    await gotoWithRetry(page, `${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const probe = await page.evaluate(() => {
      const deck = document.querySelector('.tool-deck');
      if (!deck) return { found: false };
      const cs = getComputedStyle(deck);
      const r = deck.getBoundingClientRect();
      return {
        found: true,
        display: cs.display,
        overflowX: cs.overflowX,
        scrollSnapType: cs.scrollSnapType,
        clientW: deck.clientWidth,
        scrollW: deck.scrollWidth,
        deckX: Math.round(r.x),
        deckW: Math.round(r.width),
        canScroll: deck.scrollWidth > deck.clientWidth + 2,
        docScrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
      };
    });
    results[`tooldeck_${w}`] = probe;
    const deckEl = await page.$('.tool-deck');
    if (deckEl) {
      await deckEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await deckEl.screenshot({ path: path.join(OUT, `tooldeck_${w}.png`) });
    }
    await ctx.close();
  }

  /* ---- PROBE 3: /login h1 "A good place to begin" — non-monotonic font
     size, and the screenshot at 320 showed the heading sliding under the
     art card. Measure the h1 vs the art block. ---- */
  for (const w of [320, 390, 768, 1024]) {
    const { ctx, page } = await newPage(browser, w, 900);
    await gotoWithRetry(page, `${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const probe = await page.evaluate(() => {
      const out = {};
      for (const sel of [
        'h1',
        '.login-visual',
        '.login-panel',
        '.entry-area',
        '.login-art-torus',
      ]) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        out[sel] = {
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.width),
          h: Math.round(r.height),
          fontSize: cs.fontSize,
          lineHeight: cs.lineHeight,
          position: cs.position,
          overflow: cs.overflow,
        };
      }
      return out;
    });
    results[`login_${w}`] = probe;
    await ctx.close();
  }

  /* ---- PROBE 4: /app/people drifter mascots escaping at 320/390 ---- */
  for (const w of [320, 390]) {
    const { ctx, page } = await newPage(browser, w, 844);
    await gotoWithRetry(page, `${BASE}/app/people`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const probe = await page.evaluate(() => {
      const els = [
        ...document.querySelectorAll(
          '.app-people-drifter, .app-people-card, .app-people-grid',
        ),
      ].slice(0, 6);
      return els.map((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          cls: (typeof el.className === 'string' ? el.className : '')
            .split(/\s+/)
            .slice(0, 2)
            .join('.'),
          x: Math.round(r.x),
          right: Math.round(r.right),
          w: Math.round(r.width),
          overflow: cs.overflow,
          position: cs.position,
        };
      });
    });
    results[`people_${w}`] = probe;
    await ctx.close();
  }

  /* ---- PROBE 5: /app/voice-sos signal waves at 320/390 ---- */
  for (const w of [320, 390]) {
    const { ctx, page } = await newPage(browser, w, 844);
    await gotoWithRetry(page, `${BASE}/app/voice-sos`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const probe = await page.evaluate(() => {
      const el = document.querySelector('.vos-signal-wave');
      const page1 = document.querySelector('.vos-page, .portal-main');
      const cs = el ? getComputedStyle(el) : null;
      return {
        wave: el
          ? {
              x: Math.round(el.getBoundingClientRect().x),
              w: Math.round(el.getBoundingClientRect().width),
              position: cs.position,
              overflow: cs.overflow,
            }
          : null,
        mainOverflowX: page1 ? getComputedStyle(page1).overflowX : null,
        docScrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
      };
    });
    results[`vos_${w}`] = probe;
    await ctx.close();
  }

  /* ---- PROBE 6: /app/translate title clipping at 320 ---- */
  {
    const { ctx, page } = await newPage(browser, 320, 640);
    await gotoWithRetry(page, `${BASE}/app/translate`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const probe = await page.evaluate(() => {
      const t = document.querySelector('.harbour-title');
      const nav = document.querySelector('.harbour-topnav');
      const brand = document.querySelector('.harbour-topnav .brand');
      const actions = document.querySelector('.harbour-topnav-actions');
      const box = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          x: Math.round(r.x),
          right: Math.round(r.right),
          w: Math.round(r.width),
          scrollW: el.scrollWidth,
          clientW: el.clientWidth,
          overflow: cs.overflow,
          whiteSpace: cs.whiteSpace,
          textOverflow: cs.textOverflow,
          text: (el.textContent || '').trim().slice(0, 30),
        };
      };
      return {
        title: box(t),
        brand: box(brand),
        actions: box(actions),
        navW: Math.round(nav.getBoundingClientRect().width),
        titleText: t ? t.textContent : null,
      };
    });
    results[`translate320`] = probe;
    await page.screenshot({
      path: path.join(OUT, `translate320_nav.png`),
      clip: { x: 0, y: 0, width: 320, height: 100 },
    });
    await ctx.close();
  }

  /* ---- PROBE 7: /app/home "Sam Okonkwo" clipped strong at 1024 ---- */
  {
    const { ctx, page } = await newPage(browser, 1024, 768);
    await gotoWithRetry(page, `${BASE}/app/home`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const probe = await page.evaluate(() => {
      const strongs = [...document.querySelectorAll('.profile-chip strong')];
      return strongs.map((el) => {
        const cs = getComputedStyle(el);
        return {
          w: el.clientWidth,
          scrollW: el.scrollWidth,
          text: el.textContent,
          whiteSpace: cs.whiteSpace,
          overflow: cs.overflow,
          textOverflow: cs.textOverflow,
        };
      });
    });
    results['home_strong_1024'] = probe;
    const chip = await page.$('.profile-chip');
    if (chip) await chip.screenshot({ path: path.join(OUT, 'profile_chip_1024.png') });
    await ctx.close();
  }

  fs.writeFileSync(
    path.join(OUT, 'probes.json'),
    JSON.stringify(results, null, 2),
  );
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
