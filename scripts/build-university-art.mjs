/**
 * Build one animated concept-art SVG per university, into `public/logos/art/`.
 *
 * Each file is a self-contained "orbital badge": the institution's own mark,
 * copied in verbatim and left exactly as published, sitting inside an animated
 * gyroscope of torus rings, an orbiting node pair and a breathing glow.
 *
 * Two rules drive the shape of this script:
 *
 *   1. **The mark is never altered.** Spec §14 forbids recolouring, cropping or
 *      redrawing a logo. So the source file's own markup is inlined byte for
 *      byte (only whitespace *between* elements and inside `d=` is collapsed,
 *      which is a no-op for rendering), and only a `translate`/`scale` is
 *      applied to fit it. No fill, no stroke and no geometry is touched. CUHK's
 *      mark is a PNG, so its original bytes are embedded as a data URI — the
 *      most faithful option available, at the cost of file size.
 *
 *   2. **Motion is `transform` and `opacity` only.** Both are compositor-only
 *      properties, which matters because the picker mounts all eight at once.
 *      Nothing animates a stroke dash, a filter or a layout property. Every
 *      animation is switched off under `prefers-reduced-motion: reduce`.
 *
 * The accent colour per institution is its own brand colour, read out of the
 * mark itself (`fill` values in the source, or sampled from the CUHK raster).
 * The accent only ever paints the *decoration* — never the mark.
 *
 * Run with `npm run build:university-art`. Re-run after replacing a logo file.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const logosDir = path.join(root, 'public', 'logos');
const outDir = path.join(logosDir, 'art');

/**
 * `accent` is the institution's own colour, taken from the mark:
 * HKU #009CD5, HKUST #003974, PolyU #8F1329, CityU #9F0D43, HKBU #00529B,
 * Lingnan #D70023 and EdUHK #006532 are `fill` values in the source files;
 * CUHK #602060 is the dominant opaque colour sampled from `cuhk.png`.
 */
const UNIVERSITIES = [
  { id: 'hku', name: 'The University of Hong Kong', source: 'hku.svg', accent: '#009CD5', accent2: '#FFD300' },
  { id: 'cuhk', name: 'The Chinese University of Hong Kong', source: 'cuhk.png', accent: '#602060', accent2: '#D0A020' },
  { id: 'hkust', name: 'The Hong Kong University of Science and Technology', source: 'hkust.svg', accent: '#003974', accent2: '#A68137' },
  { id: 'polyu', name: 'The Hong Kong Polytechnic University', source: 'polyu.svg', accent: '#8F1329', accent2: '#D9A441' },
  { id: 'cityu', name: 'City University of Hong Kong', source: 'cityu.svg', accent: '#9F0D43', accent2: '#A40000' },
  { id: 'hkbu', name: 'Hong Kong Baptist University', source: 'hkbu.svg', accent: '#00529B', accent2: '#D3AF7E' },
  { id: 'lingnan', name: 'Lingnan University', source: 'lingnan.svg', accent: '#D70023', accent2: '#C2C2C2' },
  { id: 'eduhk', name: 'The Education University of Hong Kong', source: 'eduhk.svg', accent: '#006532', accent2: '#EB6100' },
];

/** The art canvas. Square, so it drops into a square plate without distortion. */
const SIZE = 200;
const CENTRE = SIZE / 2;
/** The mark is fitted inside this box; the rings live outside it. */
const MARK_BOX = 120;
/** The white bed the mark sits on. Sized to cover `MARK_BOX` exactly, so the
 *  innermost ring stays clear of it. */
const BED = MARK_BOX / 2;

/** Namespace prefixes the Inkscape-exported sources use. Undeclared prefixes
 *  make an SVG an XML error, so they must be re-declared on our root. */
const EXTRA_NAMESPACES = [
  'xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"',
  'xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"',
  'xmlns:svg="http://www.w3.org/2000/svg"',
].join(' ');

/** Read a length attribute that may carry a unit (`510px`, `62.000271mm`). */
function toNumber(value) {
  const n = Number.parseFloat(String(value ?? '').replace(/[a-z%]+$/i, ''));
  return Number.isFinite(n) ? n : null;
}

/**
 * The source's own coordinate system, as `[x, y, w, h]`.
 *
 * `viewBox` wins when present; otherwise the root's `width`/`height` are used,
 * which is what the Lingnan export relies on (it has no `viewBox` at all).
 */
function readViewBox(svgTag) {
  const vb = svgTag.match(/viewBox\s*=\s*"([^"]+)"/i);
  if (vb) {
    const parts = vb[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every(Number.isFinite)) return parts;
  }
  const w = toNumber(svgTag.match(/\bwidth\s*=\s*"([^"]+)"/i)?.[1]);
  const h = toNumber(svgTag.match(/\bheight\s*=\s*"([^"]+)"/i)?.[1]);
  if (w && h) return [0, 0, w, h];
  throw new Error('No viewBox and no usable width/height.');
}

/**
 * The mark's own markup, with the wrapper and the exporter's scaffolding
 * removed. Anything that would either duplicate our root element or carry
 * document-level metadata (which is invalid nested inside another document)
 * comes out; every drawing element stays.
 */
function readMarkup(source) {
  const svgTag = source.match(/<svg\b[^>]*>/i)?.[0];
  if (!svgTag) throw new Error('No <svg> root found.');

  const inner = source
    .slice(source.indexOf(svgTag) + svgTag.length)
    .replace(/<\/svg\s*>\s*$/i, '');

  const cleaned = inner
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<metadata\b[\s\S]*?<\/metadata>/gi, '')
    .replace(/<sodipodi:namedview\b[\s\S]*?(\/>|<\/sodipodi:namedview>)/gi, '')
    /* Whitespace *between* elements and inside `d=` is not significant, so
       collapsing it is a rendering no-op. Whitespace inside text nodes is left
       alone, because the HKU export sets `xml:space="preserve"`. */
    .replace(/>\s+</g, '><')
    .replace(/\sd="([^"]*)"/g, (_m, d) => ` d="${d.replace(/\s+/g, ' ').trim()}"`)
    .trim();

  return { viewBox: readViewBox(svgTag), cleaned };
}

/** The `translate`/`scale` that centres the mark in `MARK_BOX`. */
function fitTransform([vx, vy, vw, vh]) {
  const scale = Math.min(MARK_BOX / vw, MARK_BOX / vh);
  const tx = CENTRE - (vx + vw / 2) * scale;
  const ty = CENTRE - (vy + vh / 2) * scale;
  const round = (n) => Number(n.toFixed(3));
  return `translate(${round(tx)} ${round(ty)}) scale(${round(scale)})`;
}

/** The animated stage. `markup` is dropped in last so the mark paints on top. */
function buildArt({ name, accent, accent2, markup }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" ${EXTRA_NAMESPACES} viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="${name}">
<title>${name}</title>
<defs>
<linearGradient id="ua-field" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${accent}" stop-opacity=".30"/>
<stop offset=".52" stop-color="#ffffff" stop-opacity=".90"/>
<stop offset="1" stop-color="${accent2}" stop-opacity=".30"/>
</linearGradient>
<!-- A ring-shaped bloom, not a disc: the colour peaks *around* the mark so it
     never tints the mark itself. Institutions whose own colour matches their
     accent (Lingnan's red, CityU's maroon) were washing out under a solid glow. -->
<radialGradient id="ua-halo" cx="50%" cy="50%" r="50%">
<stop offset="0" stop-color="${accent}" stop-opacity="0"/>
<stop offset=".34" stop-color="${accent}" stop-opacity=".12"/>
<stop offset=".68" stop-color="${accent}" stop-opacity=".46"/>
<stop offset="1" stop-color="${accent2}" stop-opacity="0"/>
</radialGradient>
<!-- A near-white bed under the mark, so the mark reads the same on every
     accent. Fades out at its own edge and stops short of the inner ring. -->
<radialGradient id="ua-bed" cx="50%" cy="50%" r="50%">
<stop offset="0" stop-color="#ffffff" stop-opacity=".97"/>
<stop offset=".62" stop-color="#ffffff" stop-opacity=".86"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</radialGradient>
<linearGradient id="ua-ring" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${accent}" stop-opacity=".95"/>
<stop offset="1" stop-color="${accent2}" stop-opacity=".7"/>
</linearGradient>
</defs>
<style>
@keyframes ua-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes ua-spin-rev{from{transform:rotate(360deg)}to{transform:rotate(0deg)}}
@keyframes ua-breathe{0%,100%{opacity:.5;transform:scale(.94)}50%{opacity:1;transform:scale(1.07)}}
@keyframes ua-blink{0%,100%{opacity:.2}50%{opacity:.85}}
.ua-spin,.ua-spin-rev,.ua-breathe,.ua-blink{transform-box:view-box;transform-origin:${CENTRE}px ${CENTRE}px}
.ua-spin{animation:ua-spin 19s linear infinite}
.ua-spin-rev{animation:ua-spin-rev 29s linear infinite}
.ua-breathe{animation:ua-breathe 7s ease-in-out infinite}
.ua-blink{animation:ua-blink 5s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.ua-spin,.ua-spin-rev,.ua-breathe,.ua-blink{animation:none}}
</style>
<rect width="${SIZE}" height="${SIZE}" fill="url(#ua-field)"/>
<circle class="ua-breathe" cx="${CENTRE}" cy="${CENTRE}" r="88" fill="url(#ua-halo)"/>
<g fill="none" stroke="url(#ua-ring)">
<circle cx="${CENTRE}" cy="${CENTRE}" r="90" stroke-opacity=".30" stroke-width="1"/>
<ellipse cx="${CENTRE}" cy="${CENTRE}" rx="90" ry="34" stroke-opacity=".62" stroke-width="1.3" transform="rotate(-19 ${CENTRE} ${CENTRE})"/>
<ellipse cx="${CENTRE}" cy="${CENTRE}" rx="90" ry="34" stroke-opacity=".42" stroke-width="1.3" transform="rotate(41 ${CENTRE} ${CENTRE})"/>
<circle cx="${CENTRE}" cy="${CENTRE}" r="68" stroke-opacity=".26" stroke-width="1"/>
</g>
<circle cx="${CENTRE}" cy="${CENTRE}" r="${BED}" fill="url(#ua-bed)"/>
<g class="ua-spin">
<circle cx="190" cy="100" r="3.6" fill="${accent}"/>
<circle cx="10" cy="100" r="2.2" fill="${accent2}" opacity=".85"/>
</g>
<g class="ua-spin-rev">
<circle cx="100" cy="10" r="2.8" fill="${accent2}"/>
<circle cx="100" cy="190" r="1.9" fill="${accent}" opacity=".75"/>
</g>
<g class="ua-blink"><circle cx="${CENTRE}" cy="${CENTRE}" r="96" fill="none" stroke="${accent}" stroke-opacity=".4" stroke-width="1"/></g>
${markup}
</svg>
`;
}

await mkdir(outDir, { recursive: true });

let total = 0;
for (const uni of UNIVERSITIES) {
  const sourcePath = path.join(logosDir, uni.source);
  const source = await readFile(sourcePath);
  const isRaster = uni.source.endsWith('.png');

  let markup;
  if (isRaster) {
    /* The mark is a PNG. Embedding the original bytes is the only faithful
       option — tracing it to paths would be "redrawing", which §14 forbids. */
    markup = `<image x="${CENTRE - 56}" y="${CENTRE - 44}" width="112" height="88" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${source.toString('base64')}"/>`;
  } else {
    const { viewBox, cleaned } = readMarkup(source.toString('utf8'));
    markup = `<g transform="${fitTransform(viewBox)}">${cleaned}</g>`;
  }

  const art = buildArt({ name: uni.name, accent: uni.accent, accent2: uni.accent2, markup });
  const outPath = path.join(outDir, `${uni.id}.svg`);
  await writeFile(outPath, art);
  total += Buffer.byteLength(art);
  console.log(`${uni.id.padEnd(8)} ${String(Math.round(Buffer.byteLength(art) / 1024)).padStart(4)} kB  ${isRaster ? '(raster mark embedded)' : ''}`);
}

console.log(`\nWrote ${UNIVERSITIES.length} concept-art files to public/logos/art/ (${Math.round(total / 1024)} kB total).`);
