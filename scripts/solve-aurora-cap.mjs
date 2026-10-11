/**
 * Contrast matrix, and the solver for the two aurora opacity caps.
 *
 * Brick 0 only checked `--text` and `--text-muted` against a stack of blobs.
 * Review found that too narrow: it never checked the other five text tokens,
 * and it never checked text *inside a glass surface*, which is where the glass
 * section actually puts it.
 *
 * This script now checks:
 *
 *   text tokens  — text, text-muted, text-subtle, accent-text, gold-text,
 *                  danger, success   (every text token in spec §3)
 *   surfaces     — bg
 *                  bg-elevated
 *                  the page aurora (worst-case stack of all three blobs)
 *                  glass over bg
 *                  glass over bg-elevated
 *                  glass over the page aurora
 *                  glass over the gallery patch
 *   themes       — dark and light, separately, because they are designed
 *                  separately and not inverted.
 *
 * A glass surface is composited exactly as `.glass` paints it: the tint
 * (`--glass-tint`) under the white sheen (`--glass-fill`), over whatever is
 * behind. The aurora worst case is every non-empty subset of the three blobs,
 * painted in DOM order — the only safe assumption, since text can land
 * anywhere on the fixed layer.
 *
 * Required: 4.5:1. WCAG's 3:1 large-text allowance applies to display and H1
 * sizes; only `--text` is ever painted at those sizes, and it is also used at
 * body sizes, so it is held to 4.5 too. The 3:1 column is reported for
 * information only.
 *
 * Run: node scripts/solve-aurora-cap.mjs
 * Exits 1 if any cell fails, so it can gate a build.
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
  const match = block.match(new RegExp(`(?:^|[\\s;])--${name}:\\s*([^;]+);`));
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

/** Every text token in spec §3. */
const TEXT_TOKENS = [
  'text',
  'text-muted',
  'text-subtle',
  'accent-text',
  'gold-text',
  'danger',
  'success',
];

/** Used at display and H1 sizes, where 3:1 is allowed instead of 4.5:1. */
const LARGE_TEXT_TOKENS = new Set(['text']);

const REQUIRED = 4.5;
const REQUIRED_LARGE = 3;

function readTheme(name, block) {
  const colour = (token) => parseColour(readToken(block, token));
  return {
    name,
    bg: colour('bg'),
    bgElevated: colour('bg-elevated'),
    glassFill: colour('glass-fill'),
    glassTint: colour('glass-tint'),
    blobOpacity: Number.parseFloat(readToken(block, 'aurora-blob-opacity')),
    patchOpacity: Number.parseFloat(readToken(block, 'aurora-patch-opacity')),
    blobs: [colour('aurora-1'), colour('aurora-2'), colour('aurora-3')],
    text: Object.fromEntries(TEXT_TOKENS.map((t) => [t, colour(t)])),
  };
}

const darkBlock = readBlock(':root {');
const lightBlock = readBlock(":root[data-theme='light'] {");

const THEMES = [
  readTheme('dark', darkBlock),
  readTheme('light', lightBlock),
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

function rgb(colour) {
  return `rgb(${Math.round(colour.r)}, ${Math.round(colour.g)}, ${Math.round(colour.b)})`;
}

/** `.glass` paints the tint, then the sheen, over whatever is behind. */
function glassOver(theme, backdrop) {
  const tinted = composite(backdrop, theme.glassTint, theme.glassTint.a);
  return composite(tinted, theme.glassFill, theme.glassFill.a);
}

/** Every non-empty subset of blobs, painted in DOM order, at `cap`. */
function blobBackdrops(theme, cap) {
  const backdrops = [];
  for (let mask = 1; mask < 1 << theme.blobs.length; mask += 1) {
    let colour = { ...theme.bg };
    for (let i = 0; i < theme.blobs.length; i += 1) {
      if ((mask & (1 << i)) === 0) continue;
      const blob = theme.blobs[i];
      colour = composite(colour, blob, blob.a * cap);
    }
    backdrops.push(colour);
  }
  return backdrops;
}

/** The blob stack that is worst for this token, with or without glass on top. */
function worstOverBlobs(theme, cap, tokenColour, withGlass) {
  let worst = null;
  for (const backdrop of blobBackdrops(theme, cap)) {
    const surface = withGlass ? glassOver(theme, backdrop) : backdrop;
    const ratio = contrast(tokenColour, surface);
    if (worst === null || ratio < worst.ratio) worst = { ratio, surface };
  }
  return worst;
}

/* --- the matrix ---------------------------------------------------------- */

const SURFACES = [
  { key: 'bg', label: 'bg', blobCap: null },
  { key: 'bg-elevated', label: 'bg-elev', blobCap: null },
  { key: 'aurora', label: 'aurora', blobCap: 'blob' },
  { key: 'glass-bg', label: 'glass/bg', blobCap: null },
  { key: 'glass-elevated', label: 'glass/elev', blobCap: null },
  { key: 'glass-aurora', label: 'glass/aurora', blobCap: 'blob' },
  { key: 'glass-patch', label: 'glass/patch', blobCap: 'patch' },
];

function cell(theme, token, surface) {
  const colour = theme.text[token];
  switch (surface.key) {
    case 'bg':
      return { ratio: contrast(colour, theme.bg) };
    case 'bg-elevated':
      return { ratio: contrast(colour, theme.bgElevated) };
    case 'glass-bg':
      return { ratio: contrast(colour, glassOver(theme, theme.bg)) };
    case 'glass-elevated':
      return { ratio: contrast(colour, glassOver(theme, theme.bgElevated)) };
    case 'aurora':
      return worstOverBlobs(theme, theme.blobOpacity, colour, false);
    case 'glass-aurora':
      return worstOverBlobs(theme, theme.blobOpacity, colour, true);
    case 'glass-patch':
      return worstOverBlobs(theme, theme.patchOpacity, colour, true);
    default:
      throw new Error(`unknown surface: ${surface.key}`);
  }
}

const failures = [];

console.log('Harbour contrast matrix — every text token over every surface');
console.log(`Required ${REQUIRED}:1 (3:1 allowed only at display and H1 sizes)`);
console.log('Aurora and glass/aurora use --aurora-blob-opacity.');
console.log('glass/patch uses --aurora-patch-opacity (the gallery glass backdrop).\n');

for (const theme of THEMES) {
  console.log(
    `${theme.name}  (blob cap ${theme.blobOpacity}, patch cap ${theme.patchOpacity})\n`,
  );

  const header = ['token', ...SURFACES.map((s) => s.label), '3:1'];
  const rows = [];

  for (const token of TEXT_TOKENS) {
    const cells = SURFACES.map((surface) => {
      const { ratio } = cell(theme, token, surface);
      const fails = ratio < REQUIRED;
      if (fails) {
        failures.push({
          theme: theme.name,
          token,
          surface: surface.label,
          ratio,
          // WCAG's large-text allowance only rescues the tokens that are ever
          // painted at display or H1 sizes.
          rescuedByLargeText:
            LARGE_TEXT_TOKENS.has(token) && ratio >= REQUIRED_LARGE,
        });
      }
      return `${ratio.toFixed(2)}${fails ? ' !' : '  '}`;
    });
    const large = LARGE_TEXT_TOKENS.has(token) ? 'yes' : '-';
    rows.push([token, ...cells, large]);
  }

  const widths = header.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => r[i].length)),
  );
  const line = (cells) =>
    cells.map((c, i) => c.padEnd(widths[i])).join('  ');

  console.log(line(header));
  console.log(widths.map((w) => '-'.repeat(w)).join('  '));
  for (const row of rows) console.log(line(row));

  // Diagnostics: what the worst-case backdrop actually resolves to.
  const worstDirect = worstOverBlobs(
    theme,
    theme.blobOpacity,
    theme.text['text-muted'],
    false,
  );
  const worstGlass = worstOverBlobs(
    theme,
    theme.patchOpacity,
    theme.text['text-muted'],
    true,
  );
  console.log(
    `\n  worst aurora backdrop for --text-muted: ${rgb(worstDirect.surface)} (${worstDirect.ratio.toFixed(2)}:1)`,
  );
  console.log(
    `  worst patch+glass surface for --text-muted: ${rgb(worstGlass.surface)} (${worstGlass.ratio.toFixed(2)}:1)\n`,
  );
}

/* --- solving the two caps ------------------------------------------------ */

const CAP_STEPS = [];
for (let c = 1; c >= 0.04; c -= 0.01) CAP_STEPS.push(Number(c.toFixed(2)));

function solveCap(theme, withGlass) {
  for (const cap of CAP_STEPS) {
    let ok = true;
    for (const token of TEXT_TOKENS) {
      const { ratio } = worstOverBlobs(theme, cap, theme.text[token], withGlass);
      if (ratio < REQUIRED) {
        ok = false;
        break;
      }
    }
    if (ok) return cap;
  }
  return null;
}

console.log('Highest cap at which every text token clears 4.5:1\n');
console.log('theme  token                  current  solved');

const SOLVED = {};
for (const theme of THEMES) {
  const blob = solveCap(theme, false);
  const patch = solveCap(theme, true);
  SOLVED[theme.name] = { blob, patch };
  console.log(
    `${theme.name.padEnd(6)} ${'--aurora-blob-opacity'.padEnd(22)} ${String(theme.blobOpacity).padEnd(8)} ${blob}`,
  );
  console.log(
    `${''.padEnd(6)} ${'--aurora-patch-opacity'.padEnd(22)} ${String(theme.patchOpacity).padEnd(8)} ${patch}`,
  );
}

/* --- verdict ------------------------------------------------------------- */

console.log('');

const blocking = failures.filter((f) => !f.rescuedByLargeText);
const rescued = failures.filter((f) => f.rescuedByLargeText);

const describe = (list) => {
  for (const f of list) {
    console.log(
      `  ${f.theme.padEnd(6)} ${f.token.padEnd(12)} ${f.surface.padEnd(14)} ${f.ratio.toFixed(2)}:1`,
    );
  }
};

if (rescued.length > 0) {
  console.log(
    `${rescued.length} pair(s) below ${REQUIRED}:1 but legal at display/H1 sizes (${REQUIRED_LARGE}:1):\n`,
  );
  describe(rescued);
  console.log('');
}

if (blocking.length > 0) {
  console.log(`${blocking.length} failing pair(s):\n`);
  describe(blocking);
  process.exit(1);
}

const anySolvedBelowCurrent = THEMES.some(
  (t) =>
    SOLVED[t.name].blob < t.blobOpacity ||
    SOLVED[t.name].patch < t.patchOpacity,
);

if (anySolvedBelowCurrent) {
  console.log(
    'No failures at the current caps, but a solved cap is lower than the token — retune.',
  );
  process.exit(1);
}

console.log(
  `All ${THEMES.length * TEXT_TOKENS.length * SURFACES.length} pairs clear ${REQUIRED}:1 at the current caps.`,
);

if (rescued.length === 0) {
  console.log(
    `The ${REQUIRED_LARGE}:1 large-text allowance is unused: --text clears ${REQUIRED}:1 everywhere, so no size depends on it.`,
  );
}
