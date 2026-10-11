/**
 * One-off diagnostic: prints the exact axe nodes failing on the gallery.
 * Run: node scripts/axe-report.mjs [width] [theme]
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const width = Number(process.argv[2] ?? 1440);
const theme = process.argv[3] ?? 'dark';
const url = 'http://127.0.0.1:5173/dev/gallery';

const browser = await chromium.launch({ args: ['--no-proxy-server'] });
const context = await browser.newContext({ viewport: { width, height: 900 } });
const page = await context.newPage();

await page.addInitScript((mode) => {
  window.localStorage.setItem('harbour:theme', mode);
}, theme);

await page.goto(url);
await page.waitForSelector('h1');

console.log(`theme=${theme} width=${width}`);

// Mirror the e2e sequence: overflow probe, then a full-page screenshot, which
// takes a while and lets the aurora drift move on.
const overflow = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
}));
console.log(`overflow: ${JSON.stringify(overflow)}`);

await page.screenshot({ fullPage: true });

for (const waitMs of [0, 5000, 5000, 5000, 5000, 5000]) {
  if (waitMs) await page.waitForTimeout(waitMs);
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  console.log(`\n=== after ${waitMs}ms more: ${serious.length} violation(s) ===`);
  for (const violation of serious) {
    console.log(`### ${violation.id} [${violation.impact}] ${violation.help}`);
    for (const node of violation.nodes) {
      console.log(`  target : ${node.target.join(' ')}`);
      console.log(`  html   : ${node.html.slice(0, 180)}`);
      console.log(
        `  why    : ${(node.failureSummary ?? '').replace(/\s+/g, ' ').slice(0, 300)}`,
      );
    }
  }
}

await browser.close();
