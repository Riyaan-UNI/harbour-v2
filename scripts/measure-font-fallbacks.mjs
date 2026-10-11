/**
 * Measures metric-adjusted fallback values for the two primary Harbour fonts.
 *
 * Spec §5 asks for "size-adjusted fallbacks to avoid layout shift". The
 * adjustments have to come from the real font metrics, so rather than guessing
 * them we load each woff2 in a headless Chromium, measure it against the local
 * fallback, and print the @font-face blocks to paste into src/styles/fonts.css.
 *
 * Run:  node scripts/measure-font-fallbacks.mjs
 * Read-only: it writes nothing.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

/** The two primary files the spec says to preload. */
const TARGETS = [
  {
    label: 'Bricolage Grotesque (headings)',
    cssFamily: 'Bricolage Grotesque Variable',
    fallbackFamily: 'Bricolage Grotesque Fallback',
    local: 'Arial',
    file: 'node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2',
  },
  {
    label: 'Geist (body)',
    cssFamily: 'Geist Variable',
    fallbackFamily: 'Geist Fallback',
    local: 'Arial',
    file: 'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2',
  },
];

/** A string whose average advance width approximates running text. */
const SAMPLE =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,;:!?';

const FONT_SIZE = 100;

const pct = (n) => `${(n * 100).toFixed(2)}%`;

async function measure(page, family) {
  return page.evaluate(
    async ({ family, sample, size }) => {
      await document.fonts.load(`${size}px "${family}"`, sample);
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.font = `${size}px "${family}"`;
      const m = ctx.measureText(sample);
      return {
        width: m.width,
        ascent: m.fontBoundingBoxAscent,
        descent: m.fontBoundingBoxDescent,
      };
    },
    { family, sample: SAMPLE, size: FONT_SIZE },
  );
}

const browser = await chromium.launch();
const page = await browser.newPage();

const blocks = [];

for (const target of TARGETS) {
  const woff2 = await readFile(path.join(root, target.file));
  const dataUri = `data:font/woff2;base64,${woff2.toString('base64')}`;

  await page.setContent(`<!doctype html><html><head><style>
    @font-face {
      font-family: "${target.cssFamily}";
      src: url("${dataUri}") format("woff2-variations");
      font-weight: 200 800;
      font-display: block;
    }
  </style></head><body></body></html>`);

  const web = await measure(page, target.cssFamily);
  const fallback = await measure(page, target.local);

  const sizeAdjust = fallback.width / web.width;
  const ascentOverride = web.ascent / FONT_SIZE / sizeAdjust;
  const descentOverride = web.descent / FONT_SIZE / sizeAdjust;

  console.log(`\n/* ${target.label} vs ${target.local} */`);
  console.log(`web      width=${web.width.toFixed(2)} ascent=${web.ascent.toFixed(2)} descent=${web.descent.toFixed(2)}`);
  console.log(`fallback width=${fallback.width.toFixed(2)} ascent=${fallback.ascent.toFixed(2)} descent=${fallback.descent.toFixed(2)}`);

  const block = `@font-face {
  font-family: '${target.fallbackFamily}';
  src: local('${target.local}');
  size-adjust: ${pct(sizeAdjust)};
  ascent-override: ${pct(ascentOverride)};
  descent-override: ${pct(descentOverride)};
  line-gap-override: 0%;
}`;
  console.log(block);
  blocks.push(block);
}

await browser.close();

console.log('\n--- paste into src/styles/fonts.css ---\n');
console.log(blocks.join('\n\n'));
