import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
const base = process.env['VITE_BASE'] || '/';

if (!base.startsWith('/') || base.startsWith('//') || !base.endsWith('/')) {
  throw new Error('VITE_BASE must be a root-relative path that starts and ends with "/".');
}

async function requireFile(relativePath) {
  const file = path.join(dist, relativePath);
  const metadata = await stat(file).catch(() => null);
  if (!metadata?.isFile()) throw new Error(`Missing build output: dist/${relativePath}`);
  return file;
}

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(file) : [file];
    }),
  );
  return nested.flat();
}

const indexPath = await requireFile('index.html');
const fallbackPath = await requireFile('404.html');
await requireFile('.nojekyll');

const [indexHtml, fallbackHtml] = await Promise.all([
  readFile(indexPath, 'utf8'),
  readFile(fallbackPath, 'utf8'),
]);
if (indexHtml !== fallbackHtml) {
  throw new Error('dist/404.html must be an exact copy of dist/index.html for SPA route fallback.');
}

const htmlAssets = [...indexHtml.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)]
  .map((match) => match[1])
  .filter((url) => url && !/^(?:[a-z]+:|\/\/|#|data:)/i.test(url));

for (const assetUrl of htmlAssets) {
  const urlPath = decodeURIComponent(assetUrl.split(/[?#]/, 1)[0]);
  if (urlPath.startsWith('/') && !urlPath.startsWith(base)) {
    throw new Error(`HTML asset path does not use VITE_BASE (${base}): ${assetUrl}`);
  }
  const relativePath = urlPath.startsWith(base) ? urlPath.slice(base.length) : urlPath;
  const outputPath = path.resolve(dist, relativePath);
  if (!outputPath.startsWith(`${dist}${path.sep}`)) {
    throw new Error(`HTML asset path escapes dist/: ${assetUrl}`);
  }
  await requireFile(path.relative(dist, outputPath));
}

for (const publicAsset of [
  'art/harbour-scene-1.svg',
  'art/arrival-storm.webp',
  'flags/hk.svg',
  'logos/hku.svg',
]) {
  await requireFile(publicAsset);
}

const jsFiles = (await filesUnder(path.join(dist, 'assets'))).filter((file) =>
  file.endsWith('.js'),
);
if (!jsFiles.length) throw new Error('No JavaScript bundles found in dist/assets/.');
const bundle = (await Promise.all(jsFiles.map((file) => readFile(file, 'utf8')))).join('\n');
if (!bundle.includes(JSON.stringify(base))) {
  throw new Error(`JavaScript bundles do not contain the configured Vite base ${base}.`);
}
if (!bundle.includes('Harbour API is not configured for this production build')) {
  throw new Error('Production bundles do not include the explicit missing-API configuration error.');
}
if (base !== '/' && bundle.includes(`${base}${base.slice(1)}`)) {
  throw new Error(`JavaScript bundles contain a doubled Vite base (${base}).`);
}

console.log(
  `Pages build validated for ${base}: HTML assets, SPA fallback, public assets, and bundle base.`,
);
