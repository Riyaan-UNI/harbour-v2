/**
 * publicUrl — resolve a file in `public/` against the deploy base.
 *
 * Harbour is served from the site root in dev (`/`) but from a sub-path on
 * GitHub Pages (`/harbour-v2/`). Vite rewrites asset URLs it can see (CSS
 * `url()`, `index.html`, `import`ed files) but it cannot see a path written as
 * a string in code, such as `'/logos/hku.svg'`. Wrap those in `publicUrl()`.
 *
 * At the root base this returns its input unchanged, so dev and tests behave
 * exactly as before.
 *
 *   publicUrl('/logos/hku.svg')  // '/logos/hku.svg'  or  '/harbour-v2/logos/hku.svg'
 *
 * Anything that is not a root-relative path (a full URL, a `data:` URI, a
 * protocol-relative `//host/x`) is returned untouched.
 */
export function publicUrl(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return `${base}${path}`;
}
