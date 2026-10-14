/**
 * Probe: fixed chrome vs page content.
 *
 * The app shell has a fixed bottom tab bar (`--tabs-h`) and a fixed top nav
 * (`--topnav-h`). `.portal-main` is supposed to reserve both. This probe checks,
 * on every `/app/*` route at phone and tablet widths:
 *
 *   - whether the last piece of real content is *under* the tab bar
 *     (bottom edge of the last visible text node vs the tab bar's top edge);
 *   - whether the first piece of content is under the top nav;
 *   - whether a page's own fixed/sticky footer collides with the tab bar.
 */

import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://127.0.0.1:5299';
const OUT = path.resolve('outputs/responsive-audit');
const SHOTS = path.join(OUT, 'chrome');
fs.mkdirSync(SHOTS, { recursive: true });

const SEED = {
  id: 'p_audit',
  name: 'Sam Okonkwo',
  country: 'GH',
  university: 'hku',
  socials: { instagram: 'sam.ok' },
  mascotId: 'whale',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const ROUTES = [
  '/app/home',
  '/app/scam',
  '/app/checklist',
  '/app/translate',
  '/app/chat',
  '/app/community',
  '/app/voice-sos',
  '/app/tide-bank',
  '/app/profile',
  '/app/people',
  '/app/dashboard',
  '/app/rental',
];

const VPS = [
  { key: 'p360', width: 360, height: 740 },
  { key: 'p390', width: 390, height: 844 },
  { key: 'p768', width: 768, height: 1024 },
];

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

const PROBE = () => {
  const rectOf = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      top: Math.round(r.top + window.scrollY),
      bottom: Math.round(r.bottom + window.scrollY),
      h: Math.round(r.height),
      display: getComputedStyle(el).display,
    };
  };

  const tabs = document.querySelector('.harbour-tabs');
  const tabsVisible = tabs && getComputedStyle(tabs).display !== 'none';
  const tabsRect = tabsVisible ? tabs.getBoundingClientRect() : null;

  // The last real text on the page, in document coordinates.
  let lastText = null;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const t = n.textContent.replace(/\s+/g, ' ').trim();
    if (t.length < 2) continue;
    const el = n.parentElement;
    if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (el.closest('.harbour-tabs, .harbour-topnav, .nav-more-panel, .nav-scrim'))
      continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    const bottom = r.bottom + window.scrollY;
    if (!lastText || bottom > lastText.bottom) {
      lastText = {
        bottom: Math.round(bottom),
        tag: el.tagName.toLowerCase(),
        text: t.slice(0, 45),
      };
    }
  }

  const main = document.querySelector('.portal-main');
  const mainRect = main ? main.getBoundingClientRect() : null;
  const mainStyle = main ? getComputedStyle(main) : null;

  return {
    innerH: window.innerHeight,
    docH: document.documentElement.scrollHeight,
    tabsVisible: Boolean(tabsVisible),
    tabsTopViewport: tabsRect ? Math.round(tabsRect.top) : null,
    tabsH: tabsRect ? Math.round(tabsRect.height) : null,
    topnav: rectOf('.harbour-topnav'),
    mainPaddingTop: mainStyle?.paddingTop,
    mainPaddingBottom: mainStyle?.paddingBottom,
    mainScrollH: main?.scrollHeight,
    mainClientH: main?.clientHeight,
    lastText,
    // Distance from the last text baseline to the viewport bottom, at the
    // very bottom of the scroll.
    tailGap: null,
  };
};

async function run() {
  const browser = await chromium.launch({ args: ['--no-proxy-server'] });
  const OUT_JSON = path.join(OUT, 'chrome-report.json');
  const out = fs.existsSync(OUT_JSON) ? JSON.parse(fs.readFileSync(OUT_JSON, 'utf8')) : {};

  for (const route of ROUTES.filter((r) => !ONLY.length || ONLY.some((o) => r.includes(o)))) {
    for (const vp of VPS) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
        isMobile: vp.width < 500,
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

      try {
        await gotoWithRetry(page, BASE + route);
        await page.waitForTimeout(3000);
        // Scroll to the very bottom so the tail is measurable.
        await page.evaluate(async () => {
          const step = window.innerHeight * 0.9;
          for (let y = 0; y < document.body.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 80));
          }
          window.scrollTo(0, document.body.scrollHeight);
          await new Promise((r) => setTimeout(r, 500));
        });

        const probe = await page.evaluate(PROBE);
        // At the very bottom, how much of the tail sits under the tab bar?
        const tail = await page.evaluate(() => {
          const tabs = document.querySelector('.harbour-tabs');
          if (!tabs || getComputedStyle(tabs).display === 'none') return null;
          const tr = tabs.getBoundingClientRect();
          let worst = null;
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
          );
          let n;
          while ((n = walker.nextNode())) {
            const t = n.textContent.replace(/\s+/g, ' ').trim();
            if (t.length < 2) continue;
            const el = n.parentElement;
            if (!el) continue;
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            if (
              el.closest(
                '.harbour-tabs, .harbour-topnav, .nav-more-panel, .nav-scrim',
              )
            )
              continue;
            const r = el.getBoundingClientRect();
            if (r.width < 4 || r.height < 4) continue;
            // Overlaps the tab bar's band?
            const overlap = Math.round(Math.min(r.bottom, tr.bottom) - Math.max(r.top, tr.top));
            if (overlap > 0 && (!worst || overlap > worst.overlap)) {
              worst = {
                overlap,
                tag: el.tagName.toLowerCase(),
                cls:
                  typeof el.className === 'string'
                    ? el.className.split(/\s+/).filter(Boolean).slice(0, 2).join('.')
                    : '',
                text: t.slice(0, 45),
              };
            }
          }
          return worst;
        });

        const slug = route.replace(/[^a-z0-9]+/gi, '_');
        const shot = path.join(SHOTS, `${slug}__${vp.key}.png`);
        await page.screenshot({ path: shot, fullPage: true });

        out[`${route}@${vp.key}`] = {
          ...probe,
          underTabBar: tail,
          shot: path.relative(process.cwd(), shot).replace(/\\/g, '/'),
        };
      } catch (e) {
        out[`${route}@${vp.key}`] = { failed: String(e).slice(0, 200) };
      }
      await ctx.close();
      process.stdout.write(`  ${route} @ ${vp.key}\n`);
    }
  }

  fs.writeFileSync(
    OUT_JSON,
    JSON.stringify(out, null, 2),
  );
  await browser.close();
  console.log('\n--- content hidden behind the tab bar ---');
  for (const [k, v] of Object.entries(out)) {
    if (v.underTabBar) {
      console.log(
        `${k.padEnd(26)} overlap=${String(v.underTabBar.overlap).padStart(4)}px  ${v.underTabBar.tag}.${v.underTabBar.cls}  "${v.underTabBar.text}"`,
      );
    }
  }
  console.log('\n--- top nav reservation ---');
  for (const [k, v] of Object.entries(out)) {
    if (v.mainPaddingTop) console.log(`${k.padEnd(26)} padTop=${v.mainPaddingTop} padBottom=${v.mainPaddingBottom}`);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
