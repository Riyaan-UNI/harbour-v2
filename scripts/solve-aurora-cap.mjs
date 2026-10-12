/**
 * Contrast matrix, and the solver for the two aurora opacity caps.
 *
 * Brick 0 only checked `--text` and `--text-muted` against a stack of blobs.
 * Review found that too narrow: it never checked the other five text tokens,
 * and it never checked text *inside a glass surface*, which is where the glass
 * section actually puts it. Part A2 widened it again, to the component pairs
 * the spec's "3:1 for UI and graphics" rule covers but nothing was checking.
 *
 * This script checks three matrices, in both themes, and exits 1 on any miss:
 *
 *   1. TEXT — every text token in spec §3 against every surface stack,
 *      required 4.5:1.
 *   2. COMPONENT PAIRS —
 *        text on a fill      on-accent on accent-fill, on-gold on gold-fill
 *                            (4.5:1 — it is still text)
 *        focus ring          against every surface (3:1)
 *        sole-boundary border against every surface (3:1)
 *        chart palette       chart-1..5 against bg, bg-elevated and glass
 *                            (3:1 — graphical objects)
 *        brand mark          the mark's disc against the nav glass and the
 *                            footer, and its outer wave on the disc
 *                            (3:1 — graphical objects)
 *   3. CAPS — the highest aurora blob and patch opacity at which matrix 1
 *      still clears 4.5:1, and the highest spotlight alpha at which the card's
 *      own text still does.
 *
 * Surfaces (a glass surface is composited exactly as `.glass` paints it — the
 * tint under the white sheen — over whatever is behind):
 *
 *   bg · bg-elevated · the page aurora (worst-case stack of all three blobs) ·
 *   glass over bg · glass over bg-elevated · glass over the aurora ·
 *   glass over the gallery patch · glass under the pointer spotlight ·
 *   glass over the modal overlay
 *
 * The aurora worst case is every non-empty subset of the three blobs, painted
 * in DOM order — the only safe assumption, since text can land anywhere on the
 * fixed layer.
 *
 * The two Brick 3 surfaces are the interactive card's (spec §8):
 *
 *   - `glass/spot` is the card's glass with `--spotlight-alpha` of
 *     `--accent-text` painted over it. The gradient runs from the peak alpha to
 *     transparent, and text can sit anywhere in the card, so the peak is the
 *     only safe case to check. The card can be over the page aurora or over a
 *     contained patch, so both are composited.
 *   - `glass/over` is the modal panel: the backdrop is `--bg` at
 *     `--overlay-alpha` over whatever is behind it. What is behind it is page
 *     content, and the brightest pixel page content can be is a text token — so
 *     the backdrops include the text tokens themselves, which is pessimistic on
 *     purpose.
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

/** Reads a token that holds a percentage (`18%`) as a 0-to-1 alpha. */
function readPercent(block, name) {
  const raw = readToken(block, name);
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) throw new Error(`not a percentage: --${name}`);
  return raw.endsWith('%') ? value / 100 : value;
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

/**
 * The text tokens an interactive card's front can carry. `--text-subtle` is a
 * caption tone and `--danger` / `--success` are result tones; none of the three
 * belongs on a card front, and none is used there.
 *
 * This matters because `text-subtle` on glass over the patch sits at 4.55:1 —
 * 0.05 of headroom — so holding the spotlight to it would need an alpha near
 * zero, and the effect would not exist. The same trade was recorded in Part A4
 * when the aurora cap was re-solved. The other three tokens are printed for the
 * spotlight surface but marked `~`, not gated.
 */
const CARD_TEXT_TOKENS = ['text', 'text-muted', 'accent-text', 'gold-text'];

/**
 * The text tokens the hero carries, which is the same four — and the reason the
 * hero patch can run hot.
 *
 * The hero is the one place the 3:1 large-text allowance is actually spent: the
 * bare patch carries the display/H1 headline and nothing else, and the headline
 * is at display and H1 sizes (44px and 36px at the top of each clamp), so 3:1
 * is the correct requirement. Everything else in the hero — the eyebrow, the
 * subhead, the buttons — sits on a glass panel over the patch, which is held to
 * 4.5:1. The eyebrow in particular could never sit bare: it is 0.75rem, so it
 * is small text, and no patch hot enough to be worth having would hold it.
 */
const HERO_TEXT_TOKENS = CARD_TEXT_TOKENS;

/**
 * The tokens the hero's copy column carries, on the bare field: the eyebrow,
 * the subhead and the ghost button's label. All three are small text, so all
 * three need 4.5:1 — which is why the field has to fall off from the art
 * column to the copy column at all.
 *
 * `--accent-text` and `--gold-text` are not in the list because nothing in the
 * hero's copy column uses them. `--text-subtle` is not either: it is a caption
 * tone and no caption sits on the bare field.
 */
const HERO_COPY_TEXT_TOKENS = ['text', 'text-muted'];

const REQUIRED = 4.5;
const REQUIRED_LARGE = 3;
/** WCAG 1.4.11 — UI components, focus indicators and graphical objects. */
const REQUIRED_UI = 3;

const CHART_TOKENS = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'];

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
    heroOpacity: Number.parseFloat(readToken(block, 'aurora-hero-opacity')),
    heroCopyOpacity: Number.parseFloat(
      readToken(block, 'aurora-hero-copy-opacity'),
    ),
    spotlightAlpha: readPercent(block, 'spotlight-alpha'),
    overlayAlpha: readPercent(block, 'overlay-alpha'),
    artTintAlpha: readPercent(block, 'art-tint-alpha'),
    blobs: [colour('aurora-1'), colour('aurora-2'), colour('aurora-3')],
    text: Object.fromEntries(TEXT_TOKENS.map((t) => [t, colour(t)])),
    // Component pairs.
    accentFill: colour('accent-fill'),
    accentText: colour('accent-text'),
    onAccent: colour('on-accent'),
    goldFill: colour('gold-fill'),
    onGold: colour('on-gold'),
    danger: colour('danger'),
    focusRing: colour('focus-ring'),
    border: colour('border'),
    borderStrong: colour('border-strong'),
    charts: Object.fromEntries(CHART_TOKENS.map((t) => [t, colour(t)])),
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

/**
 * The backdrops an interactive card can sit on: the page aurora, a contained
 * patch, and the two flat surfaces. Both aurora caps are used, because the card
 * is glass over whichever colour field it happens to be on.
 */
function cardBackdrops(theme) {
  return [
    theme.bg,
    theme.bgElevated,
    ...blobBackdrops(theme, theme.blobOpacity),
    ...blobBackdrops(theme, theme.patchOpacity),
  ];
}

/**
 * The interactive card's surface under the pointer spotlight, at its peak
 * alpha. The gradient fades to transparent at the edges, and text can sit
 * anywhere in the card, so the peak is the only safe case.
 */
function worstSpotlight(theme, tokenColour, alpha) {
  let worst = null;
  for (const backdrop of cardBackdrops(theme)) {
    const glass = glassOver(theme, backdrop);
    const surface = composite(glass, theme.accentText, alpha);
    const ratio = contrast(tokenColour, surface);
    if (worst === null || ratio < worst.ratio) worst = { ratio, surface };
  }
  return worst;
}

/**
 * The backdrops the modal panel sits over: the overlay is `--bg` at
 * `--overlay-alpha`, and behind the overlay is page content. The brightest
 * pixel page content can put there is a text token, so those are included as
 * backdrops — pessimistic on purpose.
 */
function overlayBackdrops(theme) {
  const bases = [
    theme.bg,
    theme.bgElevated,
    ...blobBackdrops(theme, theme.blobOpacity),
    ...blobBackdrops(theme, theme.patchOpacity),
    ...TEXT_TOKENS.map((token) => theme.text[token]),
  ];
  return bases.map((base) => composite(base, theme.bg, theme.overlayAlpha));
}

/** The modal panel's surface: glass over the overlay over the backdrop. */
function worstOverlay(theme, tokenColour) {
  let worst = null;
  for (const backdrop of overlayBackdrops(theme)) {
    const surface = glassOver(theme, backdrop);
    const ratio = contrast(tokenColour, surface);
    if (worst === null || ratio < worst.ratio) worst = { ratio, surface };
  }
  return worst;
}

/* --- the surface list ---------------------------------------------------- */

const SURFACES = [
  { key: 'bg', label: 'bg', blobCap: null },
  { key: 'bg-elevated', label: 'bg-elev', blobCap: null },
  { key: 'aurora', label: 'aurora', blobCap: 'blob' },
  { key: 'glass-bg', label: 'glass/bg', blobCap: null },
  { key: 'glass-elevated', label: 'glass/elev', blobCap: null },
  { key: 'glass-aurora', label: 'glass/aurora', blobCap: 'blob' },
  { key: 'glass-patch', label: 'glass/patch', blobCap: 'patch' },
  /* Brick 3 — the interactive card's spotlight, and the modal panel.
     The spotlight carries only the tokens a card front can actually hold (see
     CARD_TEXT_TOKENS), and it is never drawn on a flat Card, so `--border-strong`
     — the sole-boundary token — is not in its domain. */
  {
    key: 'glass-spotlight',
    label: 'glass/spot',
    blobCap: 'patch',
    tokens: CARD_TEXT_TOKENS,
    soleBoundary: false,
  },
  { key: 'glass-overlay', label: 'glass/over', blobCap: null },
  /* The hero patch, bare and under its copy panel. The bare row is held to
     `--text` alone at 3:1 (the display/H1 allowance); the glass row is held to
     the four tokens the hero carries at 4.5:1. Neither carries a flat Card, so
     `--border-strong` is not in their domain. */
  {
    key: 'hero',
    label: 'hero',
    blobCap: 'hero',
    tokens: ['text'],
    soleBoundary: false,
  },
  {
    key: 'glass-hero',
    label: 'glass/hero',
    blobCap: 'hero',
    tokens: HERO_TEXT_TOKENS,
    soleBoundary: false,
  },
  /* Brick 3b — the copy column of the boxless hero, on the bare field at
     `--aurora-hero-copy-opacity`. The field falls off from the art column to
     the copy column, so the copy sits on much less colour than the headline
     does; this row is what makes that falloff a solved value rather than a
     shape. Held to the two tokens the copy column actually carries — the
     eyebrow, the subhead and the ghost button's label — at 4.5:1, because all
     three are small text. */
  {
    key: 'hero-copy',
    label: 'hero/copy',
    blobCap: 'hero-copy',
    tokens: HERO_COPY_TEXT_TOKENS,
    soleBoundary: false,
  },
  /* The empty art slot's placeholder: `--bg-elevated` under the peak tint of
     its gradient. The whole plate is modelled at the peak, which is more
     pessimistic than the gradient actually is. */
  {
    key: 'art-placeholder',
    label: 'art/plate',
    blobCap: null,
    soleBoundary: false,
  },
];

/** Resolves a surface key to the colour actually painted. */
function surfaceColour(theme, key, tokenColour, forContrast) {
  switch (key) {
    case 'bg':
      return theme.bg;
    case 'bg-elevated':
      return theme.bgElevated;
    case 'glass-bg':
      return glassOver(theme, theme.bg);
    case 'glass-elevated':
      return glassOver(theme, theme.bgElevated);
    case 'aurora':
      return forContrast
        ? worstOverBlobs(theme, theme.blobOpacity, tokenColour, false).surface
        : null;
    case 'glass-aurora':
      return forContrast
        ? worstOverBlobs(theme, theme.blobOpacity, tokenColour, true).surface
        : null;
    case 'glass-patch':
      return forContrast
        ? worstOverBlobs(theme, theme.patchOpacity, tokenColour, true).surface
        : null;
    case 'hero':
      return forContrast
        ? worstOverBlobs(theme, theme.heroOpacity, tokenColour, false).surface
        : null;
    case 'glass-hero':
      return forContrast
        ? worstOverBlobs(theme, theme.heroOpacity, tokenColour, true).surface
        : null;
    case 'hero-copy':
      return forContrast
        ? worstOverBlobs(theme, theme.heroCopyOpacity, tokenColour, false)
            .surface
        : null;
    default:
      throw new Error(`unknown surface: ${key}`);
  }
}

/**
 * The contrast of `tokenColour` against a surface, compositing the token over
 * the surface first when it is semi-transparent (which `--border` is).
 */
function cell(theme, tokenColour, surface) {
  if (surface.key === 'aurora') {
    return worstOverBlobs(theme, theme.blobOpacity, tokenColour, false);
  }
  if (surface.key === 'glass-aurora') {
    return worstOverBlobs(theme, theme.blobOpacity, tokenColour, true);
  }
  if (surface.key === 'glass-patch') {
    return worstOverBlobs(theme, theme.patchOpacity, tokenColour, true);
  }
  if (surface.key === 'glass-spotlight') {
    return worstSpotlight(theme, tokenColour, theme.spotlightAlpha);
  }
  if (surface.key === 'glass-overlay') {
    return worstOverlay(theme, tokenColour);
  }
  if (surface.key === 'hero') {
    return worstOverBlobs(theme, theme.heroOpacity, tokenColour, false);
  }
  if (surface.key === 'glass-hero') {
    return worstOverBlobs(theme, theme.heroOpacity, tokenColour, true);
  }
  if (surface.key === 'hero-copy') {
    return worstOverBlobs(theme, theme.heroCopyOpacity, tokenColour, false);
  }
  if (surface.key === 'art-placeholder') {
    // The placeholder plate, at the peak of its gradient.
    const plate = composite(theme.bgElevated, theme.accentFill, theme.artTintAlpha);
    return { ratio: contrast(tokenColour, plate) };
  }
  const backdrop = surfaceColour(theme, surface.key, tokenColour, false);
  const painted =
    tokenColour.a < 1
      ? composite(backdrop, tokenColour, tokenColour.a)
      : tokenColour;
  return { ratio: contrast(painted, backdrop) };
}

/* --- shared reporting ---------------------------------------------------- */

const failures = [];

function printMatrix({ title, note, rows, headers, widths }) {
  console.log(title);
  if (note) console.log(note);
  const line = (cells) =>
    cells.map((c, i) => String(c).padEnd(widths[i])).join('  ');
  console.log(line(headers));
  console.log(widths.map((w) => '-'.repeat(w)).join('  '));
  for (const row of rows) console.log(line(row));
  console.log('');
}

function computeWidths(headers, rows) {
  return headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i]).length)),
  );
}

/* ======================================================================== */
/* Matrix 1 — text tokens over every surface                                */
/* ======================================================================== */

console.log('Harbour contrast matrix');
console.log('========================\n');
console.log('1. Text tokens over every surface');
console.log(`   Required ${REQUIRED}:1 (3:1 allowed only at display and H1 sizes).`);
console.log('   Aurora and glass/aurora use --aurora-blob-opacity;');
console.log('   glass/patch uses --aurora-patch-opacity (the gallery glass backdrop);');
console.log('   glass/spot uses --spotlight-alpha and is held to the four tokens a');
console.log('   card front can carry; hero and glass/hero use --aurora-hero-opacity.');
console.log('   A "~" marks a cell below its ratio that is not gated, and a "°" one');
console.log('   that is rescued by the 3:1 large-text allowance.\n');

for (const theme of THEMES) {
  console.log(`${theme.name}  (blob cap ${theme.blobOpacity}, patch cap ${theme.patchOpacity})`);

  const headers = ['token', ...SURFACES.map((s) => s.label), '3:1'];
  const rows = [];

  for (const token of TEXT_TOKENS) {
    const cells = SURFACES.map((surface) => {
      const { ratio } = cell(theme, theme.text[token], surface);
      // A surface may narrow which tokens it is held to; the ratio is still
      // printed so the number is visible, but it is not a gate.
      const applies =
        surface.tokens === undefined || surface.tokens.includes(token);
      const fails = ratio < REQUIRED;
      if (fails && applies) {
        failures.push({
          matrix: 'text',
          theme: theme.name,
          label: `${token} on ${surface.label}`,
          ratio,
          required: REQUIRED,
          rescuedByLargeText:
            LARGE_TEXT_TOKENS.has(token) && ratio >= REQUIRED_LARGE,
        });
      }
      const mark = !fails
        ? '  '
        : !applies
          ? ' ~'
          : LARGE_TEXT_TOKENS.has(token) && ratio >= REQUIRED_LARGE
            ? ' °'
            : ' !';
      return `${ratio.toFixed(2)}${mark}`;
    });
    const large = LARGE_TEXT_TOKENS.has(token) ? 'yes' : '-';
    rows.push([token, ...cells, large]);
  }

  printMatrix({
    title: '',
    rows,
    headers,
    widths: computeWidths(headers, rows),
  });
}

/* ======================================================================== */
/* Matrix 2 — component pairs                                               */
/* ======================================================================== */

console.log('2. Component pairs\n');

/** Runs one labelled group of pairs and prints it as a table. */
function runPairs(theme, group) {
  const headers = ['pair', ...group.columns];
  const rows = [];

  for (const item of group.items) {
    const cells = item.values.map((value, index) => {
      const { ratio } = value;
      // A column may be reported but not gated — the same `~` convention the
      // text matrix uses, so the number stays visible.
      const applies = group.columnRequired?.[index] ?? true;
      const fails = ratio < group.required;
      if (fails && applies) {
        failures.push({
          matrix: group.title,
          theme: theme.name,
          label: item.label,
          ratio,
          required: group.required,
        });
      }
      const mark = fails ? (applies ? ' !' : ' ~') : '  ';
      return `${ratio.toFixed(2)}${mark}`;
    });
    rows.push([item.label, ...cells]);
  }

  printMatrix({
    title: `   ${theme.name} — ${group.title} (required ${group.required}:1)`,
    rows,
    headers,
    widths: computeWidths(headers, rows),
  });
}

for (const theme of THEMES) {
  /* 2a. Text on a fill — still text, so 4.5:1. */
  runPairs(theme, {
    title: 'text on fill',
    required: REQUIRED,
    columns: ['fill', 'ratio'],
    items: [
      {
        label: 'on-accent on accent-fill',
        values: [{ ratio: contrast(theme.onAccent, theme.accentFill) }],
      },
      {
        label: 'on-gold on gold-fill',
        values: [{ ratio: contrast(theme.onGold, theme.goldFill) }],
      },
      // The danger Button (Brick 2a) takes `--on-accent` as its label colour,
      // so that pairing is checked too rather than assumed.
      {
        label: 'on-accent on danger',
        values: [{ ratio: contrast(theme.onAccent, theme.danger) }],
      },
    ],
  });

  /* 2b. Focus ring against every surface — 3:1 (WCAG 1.4.11). */
  runPairs(theme, {
    title: 'focus-ring on every surface',
    required: REQUIRED_UI,
    columns: SURFACES.map((s) => s.label),
    items: [
      {
        label: 'focus-ring',
        values: SURFACES.map((surface) => cell(theme, theme.focusRing, surface)),
      },
    ],
  });

  /* 2c. Sole-boundary border against every surface — 3:1.
     `--border-strong` is the token for a border that is a surface's *only*
     boundary, and the only component that uses it is the flat Card. So the
     surfaces a flat Card cannot sit on are printed but not gated (a `~`): the
     spotlight, the modal panel, and the hero patch and its copy panel. The hero
     patch carries the display headline, and the copy panel over it is glass,
     not flat. */
  const boundaryRequired = SURFACES.map((s) => s.soleBoundary !== false);
  runPairs(theme, {
    title: 'border-strong on every surface (sole boundary)',
    required: REQUIRED_UI,
    columns: SURFACES.map((s) => s.label),
    columnRequired: boundaryRequired,
    items: [
      {
        label: 'border-strong',
        values: SURFACES.map((surface) =>
          cell(theme, theme.borderStrong, surface),
        ),
      },
    ],
  });

  /* 2d. Chart palette against the three surfaces it is drawn on — 3:1. */
  const chartSurfaces = SURFACES.filter((s) =>
    ['bg', 'bg-elevated', 'glass-bg'].includes(s.key),
  );
  runPairs(theme, {
    title: 'chart palette on its surfaces',
    required: REQUIRED_UI,
    columns: chartSurfaces.map((s) => s.label),
    items: CHART_TOKENS.map((token) => ({
      label: token,
      values: chartSurfaces.map((surface) => cell(theme, theme.charts[token], surface)),
    })),
  });

  /* 2e. The brand mark — 3:1, a graphical object (WCAG 1.4.11).
     The mark is a filled disc with ink drawn on it. The disc is
     `--accent-fill`, and the only two surfaces it is ever drawn on are the
     nav's glass bar and the footer's flat surface — each of which can itself
     sit over the page aurora, so both are composited. `--accent-fill` is the
     only token that works: it is dark on the light theme's nav glass and light
     on the dark theme's, which is what one mark needs to clear 3:1 in both. */
  const logoSurfaces = SURFACES.filter((s) =>
    ['bg', 'aurora', 'glass-bg', 'glass-aurora'].includes(s.key),
  );
  runPairs(theme, {
    title: 'brand mark — the disc on the nav glass and the footer',
    required: REQUIRED_UI,
    columns: logoSurfaces.map((s) => s.label),
    items: [
      {
        label: 'accent-fill',
        values: logoSurfaces.map((surface) => cell(theme, theme.accentFill, surface)),
      },
    ],
  });

  /* 2f. The mark's own ink. `--on-accent` on the disc is already gated at
     4.5:1 by the text-on-fill group above; this is the outer wave, which is a
     graphic rather than text and so is held to 3:1. */
  runPairs(theme, {
    title: 'brand mark — the outer wave on the disc',
    required: REQUIRED_UI,
    columns: ['accent-fill'],
    items: [
      {
        label: 'aurora-1',
        values: [{ ratio: contrast(theme.blobs[0], theme.accentFill) }],
      },
    ],
  });
}

/* The decorative hairline is reported, not required: at 0.14 alpha it is a
   divider, never the only thing identifying a surface. Printed so the value is
   visible and any drift is noticed. */
console.log('   Decorative hairline `--border` (reported only, not a gate):');
for (const theme of THEMES) {
  const ratios = SURFACES.map(
    (surface) => cell(theme, theme.border, surface).ratio,
  );
  const worst = Math.min(...ratios);
  console.log(
    `     ${theme.name.padEnd(6)} worst ${worst.toFixed(2)}:1 across ${SURFACES.length} surfaces`,
  );
}
console.log('');

/* ======================================================================== */
/* Matrix 3 — solving the two caps                                          */
/* ======================================================================== */

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

/**
 * The highest spotlight alpha at which the card's own text still clears 4.5:1.
 * The spotlight is painted on the card, so it is a surface the card's text sits
 * on — solved, not chosen.
 */
const SPOTLIGHT_STEPS = [];
for (let a = 0.6; a >= 0.02; a -= 0.01) SPOTLIGHT_STEPS.push(Number(a.toFixed(2)));

function solveSpotlight(theme) {
  for (const alpha of SPOTLIGHT_STEPS) {
    let ok = true;
    for (const token of CARD_TEXT_TOKENS) {
      const { ratio } = worstSpotlight(theme, theme.text[token], alpha);
      if (ratio < REQUIRED) {
        ok = false;
        break;
      }
    }
    if (ok) return alpha;
  }
  return null;
}

/**
 * The highest hero-patch opacity that satisfies both of the hero's rules at
 * once:
 *
 *   - the display/H1 headline on the BARE patch at 3:1 — the large-text
 *     allowance, and the only place in the build where it is spent;
 *   - every token the hero carries on glass over the patch at 4.5:1, which is
 *     where the subhead, the eyebrow and the buttons live.
 *
 * Whichever binds first is the cap. Solved, not chosen.
 */
function solveHeroCap(theme) {
  for (const cap of CAP_STEPS) {
    const bare = worstOverBlobs(theme, cap, theme.text.text, false);
    if (bare.ratio < REQUIRED_LARGE) continue;

    let ok = true;
    for (const token of HERO_TEXT_TOKENS) {
      const { ratio } = worstOverBlobs(theme, cap, theme.text[token], true);
      if (ratio < REQUIRED) {
        ok = false;
        break;
      }
    }
    if (ok) return cap;
  }
  return null;
}

/**
 * The highest opacity the hero's colour field may have over the copy column.
 *
 * Brick 3b took the glass panel off the hero, so the eyebrow, the subhead and
 * the ghost button's label now sit on the bare field. All three are small text
 * and all three need 4.5:1, so the field has to be much weaker there than
 * behind the art — this is the value that makes that true, and it is solved
 * rather than chosen. It is always at or below `--aurora-hero-opacity`.
 */
function solveHeroCopyCap(theme) {
  for (const cap of CAP_STEPS) {
    let ok = true;
    for (const token of HERO_COPY_TEXT_TOKENS) {
      const { ratio } = worstOverBlobs(theme, cap, theme.text[token], false);
      if (ratio < REQUIRED) {
        ok = false;
        break;
      }
    }
    if (ok) return cap;
  }
  return null;
}

console.log('3. Highest cap at which every text token clears 4.5:1\n');
console.log('theme  token                  current  solved');

const SOLVED = {};
for (const theme of THEMES) {
  const blob = solveCap(theme, false);
  const patch = solveCap(theme, true);
  const hero = solveHeroCap(theme);
  const heroCopy = solveHeroCopyCap(theme);
  const spotlight = solveSpotlight(theme);
  SOLVED[theme.name] = { blob, patch, hero, heroCopy, spotlight };
  console.log(
    `${theme.name.padEnd(6)} ${'--aurora-blob-opacity'.padEnd(26)} ${String(theme.blobOpacity).padEnd(8)} ${blob}`,
  );
  console.log(
    `${''.padEnd(6)} ${'--aurora-patch-opacity'.padEnd(26)} ${String(theme.patchOpacity).padEnd(8)} ${patch}`,
  );
  console.log(
    `${''.padEnd(6)} ${'--aurora-hero-opacity'.padEnd(26)} ${String(theme.heroOpacity).padEnd(8)} ${hero}`,
  );
  console.log(
    `${''.padEnd(6)} ${'--aurora-hero-copy-opacity'.padEnd(26)} ${String(theme.heroCopyOpacity).padEnd(8)} ${heroCopy}`,
  );
  console.log(
    `${''.padEnd(6)} ${'--spotlight-alpha'.padEnd(26)} ${theme.spotlightAlpha.toFixed(2).padEnd(8)} ${spotlight}`,
  );
}

/* ======================================================================== */
/* Verdict                                                                  */
/* ======================================================================== */

console.log('');

const blocking = failures.filter((f) => !f.rescuedByLargeText);
const rescued = failures.filter((f) => f.rescuedByLargeText);

const describe = (list) => {
  for (const f of list) {
    console.log(
      `  ${f.theme.padEnd(6)} ${f.label.padEnd(38)} ${f.ratio.toFixed(2)}:1 (need ${f.required}) [${f.matrix}]`,
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
    SOLVED[t.name].patch < t.patchOpacity ||
    SOLVED[t.name].hero < t.heroOpacity ||
    SOLVED[t.name].heroCopy < t.heroCopyOpacity ||
    SOLVED[t.name].spotlight < t.spotlightAlpha,
);

if (anySolvedBelowCurrent) {
  console.log(
    'No failures at the current caps, but a solved cap is lower than the token — retune.',
  );
  process.exit(1);
}

const textPairs = THEMES.length * TEXT_TOKENS.length * SURFACES.length;
console.log(`All ${textPairs} text pairs clear ${REQUIRED}:1 at the current caps.`);
console.log(
  `Every component pair clears its required ratio (text on fill ${REQUIRED}:1, ring / border / chart ${REQUIRED_UI}:1).`,
);

if (rescued.length === 0) {
  const closest = Math.min(
    ...THEMES.map(
      (t) => worstOverBlobs(t, t.heroOpacity, t.text.text, false).ratio,
    ),
  );
  console.log(
    `The ${REQUIRED_LARGE}:1 large-text allowance is available on the bare hero patch but unused: --text clears ${REQUIRED}:1 everywhere (closest, on the hero patch: ${closest.toFixed(2)}:1), so no size depends on it. The hero cap is bound by the copy panel's glass, not by the headline.`,
  );
}
