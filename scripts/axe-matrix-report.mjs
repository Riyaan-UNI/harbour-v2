/**
 * Prints every serious/critical axe node on the gallery as a table.
 *
 * Run:
 *   node scripts/axe-matrix-report.mjs                  # full matrix
 *   node scripts/axe-matrix-report.mjs --hide-aurora    # aurora layer hidden
 *   node scripts/axe-matrix-report.mjs --theme=dark
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const URL = 'http://127.0.0.1:5173/dev/gallery';
const THEMES = ['dark', 'light'];
const WIDTHS = [360, 390, 768, 1024, 1440];

const hideAurora = process.argv.includes('--hide-aurora');
const themeArg = process.argv.find((a) => a.startsWith('--theme='));
const onlyTheme = themeArg ? themeArg.split('=')[1] : null;

function pickData(node) {
  const checks = [...(node.any ?? []), ...(node.all ?? []), ...(node.none ?? [])];
  for (const check of checks) {
    const data = check?.data;
    if (data && (data.fgColor || data.contrastRatio)) return data;
  }
  return {};
}

const browser = await chromium.launch({ args: ['--no-proxy-server'] });
const rows = [];

for (const theme of THEMES) {
  if (onlyTheme && theme !== onlyTheme) continue;

  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
    });
    const page = await context.newPage();

    await page.addInitScript((mode) => {
      window.localStorage.setItem('harbour:theme', mode);
    }, theme);

    await page.goto(URL);
    await page.waitForSelector('h1');

    if (hideAurora) {
      await page.addStyleTag({
        content: '.aurora { display: none !important; }',
      });
    }

    await page.waitForTimeout(400);

    const results = await new AxeBuilder({ page }).analyze();

    for (const violation of results.violations) {
      if (violation.impact !== 'serious' && violation.impact !== 'critical') {
        continue;
      }
      for (const node of violation.nodes) {
        const data = pickData(node);
        rows.push({
          route: '/dev/gallery',
          viewport: `${width}`,
          theme,
          rule: violation.id,
          selector: node.target.join(' '),
          fg: data.fgColor ?? '-',
          bg: data.bgColor ?? '-',
          ratio: data.contrastRatio ?? '-',
          required: data.expectedContrastRatio ?? '-',
        });
      }
    }

    await context.close();
  }
}

await browser.close();

if (rows.length === 0) {
  console.log(
    `\nNo serious/critical violations.${hideAurora ? ' (aurora hidden)' : ''}`,
  );
  process.exit(0);
}

const headers = [
  'route',
  'vp',
  'theme',
  'rule',
  'selector',
  'fg',
  'bg',
  'ratio',
  'required',
];
const table = rows.map((row) => [
  row.route,
  row.viewport,
  row.theme,
  row.rule,
  row.selector,
  row.fg,
  row.bg,
  String(row.ratio),
  String(row.required),
]);

const widths = headers.map((_, i) =>
  Math.max(headers[i].length, ...table.map((r) => r[i].length)),
);

const line = (cells) =>
  cells.map((cell, i) => cell.padEnd(widths[i])).join('  ');

console.log(`\n${rows.length} failing node(s)${hideAurora ? ' (aurora hidden)' : ''}\n`);
console.log(line(headers));
console.log(widths.map((w) => '-'.repeat(w)).join('  '));
for (const row of table) console.log(line(row));

const unique = [...new Set(rows.map((r) => r.selector))];
console.log(`\nDistinct selectors (${unique.length}):`);
for (const selector of unique) console.log(`  ${selector}`);
