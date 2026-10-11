/**
 * Solves for the aurora opacity cap that keeps text legible over the worst
 * possible stack of blobs, in both themes.
 *
 * The blobs are decorative and sit beneath content, so any text can land on top
 * of them. The only safe assumption is the worst case: every blob stacked.
 *
 * Run: node scripts/solve-aurora-cap.mjs
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const tokensPath = path.resolve(here, '..', 'src', 'styles', 'tokens.css');
const css = await readFile(tokensPath, 'utf8');

/* --- pull the values we need straight out of tokens.css ------------------ */

function readBlock(selector) {
  const index = css.indexOf(selector);
  if (index === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf('{', index);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

function readToken(block, name) {
  const match = block.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`token not found: --${name}`);
  return match[1].trim();
}

function parseColour(value) {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  const rgba = value.match(/rgba?\(([^)]+)\)/);
  if (rgba) {
    const parts = rgba[1].split(',').map((p) => Number.parseFloat(p.trim()));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
  }
  throw new Error(`cannot parse colour: ${value}`);
}

const dark = readBlock(':root {');
const light = readBlock(":root[data-theme='light'] {");

const THEMES = [
  {
    name: 'dark',
    bg: parseColour(readToken(dark, 'bg')),
    text: parseColour(readToken(dark, 'text')),
    textMuted: parseColour(readToken(dark, 'text-muted')),
    blobs: [
      parseColour(readToken(dark, 'aurora-1')),
      parseColour(readToken(dark, 'aurora-2')),
      parseColour(readToken(dark, 'aurora-3')),
    ],
  },
  {
    name: 'light',
    bg: parseColour(readToken(light, 'bg')),
    text: parseColour(readToken(light, 'text')),
    textMuted: parseColour(readToken(light, 'text-muted')),
    blobs: [
      parseColour(readToken(light, 'aurora-1')),
      parseColour(readToken(light, 'aurora-2')),
      parseColour(readToken(light, 'aurora-3')),
    ],
  },
];

/* --- colour maths -------------------------------------------------------- */

function composite(base, top, alpha) {
  return {
    r: base.r + alpha * (top.r - base.r),
    g: base.g + alpha * (top.g - base.g),
    b: base.b + alpha * (top.b - base.b),
  };
}

function luminance({ r, g, b }) {
  const channel = (value) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Every non-empty subset of blobs, painted in DOM order. */
function worstCaseBackground(theme, cap) {
  let worst = null;

  for (let mask = 1; mask < 1 << theme.blobs.length; mask += 1) {
    let colour = { ...theme.bg };
    for (let i = 0; i < theme.blobs.length; i += 1) {
      if ((mask & (1 << i)) === 0) continue;
      const blob = theme.blobs[i];
      colour = composite(colour, blob, blob.a * cap);
    }
    const ratios = {
      text: contrast(theme.text, colour),
      'text-muted': contrast(theme.textMuted, colour),
    };
    const min = Math.min(ratios.text, ratios['text-muted']);
    if (worst === null || min < worst.min) {
      worst = { mask, colour, ratios, min };
    }
  }

  return worst;
}

/* --- report -------------------------------------------------------------- */

const CAPS = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.18, 0.15, 0.12, 0.1];

console.log('Worst-case contrast over any stack of aurora blobs\n');
console.log('theme  cap    worst-bg          text    text-muted   verdict');

const recommendations = {};

for (const theme of THEMES) {
  let best = null;
  for (const cap of CAPS) {
    const worst = worstCaseBackground(theme, cap);
    const passes = worst.min >= 4.5;
    if (passes && (best === null || cap > best.cap)) best = { cap, worst };

    const rgb = `rgb(${Math.round(worst.colour.r)}, ${Math.round(worst.colour.g)}, ${Math.round(worst.colour.b)})`;
    console.log(
      `${theme.name.padEnd(6)} ${String(cap).padEnd(6)} ${rgb.padEnd(17)} ` +
        `${worst.ratios.text.toFixed(2).padEnd(7)} ${worst.ratios['text-muted'].toFixed(2).padEnd(12)} ` +
        `${passes ? 'ok' : 'FAIL'}`,
    );
  }
  recommendations[theme.name] = best;
  console.log('');
}

console.log('Highest passing cap per theme:');
for (const theme of THEMES) {
  const best = recommendations[theme.name];
  console.log(
    `  ${theme.name.padEnd(6)} cap = ${best.cap}  (text-muted ${best.worst.ratios['text-muted'].toFixed(2)}, text ${best.worst.ratios.text.toFixed(2)})`,
  );
}
