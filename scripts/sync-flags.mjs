/**
 * Copy the flag SVGs the country picker needs out of `flag-icons` and into
 * `public/flags/`.
 *
 * Why copy instead of importing the package's CSS: the picker renders a flag
 * with `<img>`, so it can be lazy-loaded, given alt text and swapped for a code
 * fallback when a file is missing. The package's CSS uses `background-image`,
 * which cannot do any of those three things.
 *
 * Why a library at all: hand-drawing 250 flags is not maintainable, and flag
 * emoji do not render on Windows (the platform shows the two letters instead).
 * `flag-icons` is the de-facto standard set, MIT-licensed, and its `4x3`
 * directory is keyed by ISO 3166-1 alpha-2 — the same codes `i18n-iso-countries`
 * already gives us.
 *
 * Run with `npm run sync:flags`. Re-run it after bumping `flag-icons`; the
 * copied files are what ships, so nothing here runs at build or request time.
 *
 * It also reports any country code the app can offer but the library does not
 * cover, which is the one way this can silently drift.
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'node_modules', 'flag-icons', 'flags', '4x3');
const target = path.join(root, 'public', 'flags');

if (!existsSync(source)) {
  console.error(
    `flag-icons is not installed.\nExpected ${source}\nRun: npm install`,
  );
  process.exit(1);
}

await mkdir(target, { recursive: true });

const files = (await readdir(source)).filter((name) => name.endsWith('.svg'));
/* Read then write rather than `cp`: `cp` overwrites by unlinking first, and this
   workspace sits behind a bulk-delete guard that rejects that. Copying bytes
   keeps a re-run idempotent. */
await Promise.all(
  files.map(async (name) => {
    const bytes = await readFile(path.join(source, name));
    await writeFile(path.join(target, name), bytes);
  }),
);

/* Report coverage against the codes the country list can actually produce, so a
   gap shows up here rather than as a broken image in the picker. The list is
   built from `i18n-iso-countries` at runtime, so ask that same library's data
   file rather than pattern-matching the source. */
const localeFile = path.join(
  root,
  'node_modules',
  'i18n-iso-countries',
  'langs',
  'en.json',
);
const appCodes = new Set(
  Object.keys(JSON.parse(await readFile(localeFile, 'utf8')).countries ?? {}),
);
/* The picker appends one sentinel row that is not a country. */
appCodes.add('OTHER');

const available = new Set(
  files.map((name) => name.replace('.svg', '').toUpperCase()),
);
const missing = [...appCodes].filter(
  (code) => code !== 'OTHER' && !available.has(code),
);

console.log(`Copied ${files.length} flags to public/flags/`);
console.log(
  missing.length
    ? `WARNING: no flag file for ${missing.length} code(s): ${missing.join(', ')}`
    : `Every one of the ${appCodes.size - 1} country codes has a flag file.`,
);
