/**
 * The `/app` path prefix, in one place.
 *
 * The ported legacy pages link to each other with their **legacy root paths**
 * (`/home`, `/shield`, `/dashboard`) because that is how they were written. The
 * v2 app serves them under `/app/...`, so every link has to be re-based.
 *
 * Doing that with `appPath()` at the render site — rather than by editing the
 * ported pages — is what keeps the legacy lane unmodified: if the old build
 * ever needs to be diffed against this one, the pages still match.
 *
 * `appPath('/')` returns `/` unchanged, so a legacy "back to the public site"
 * link keeps working.
 */
export function appPath(path: string): string {
  if (path === '/' || path === '') return '/';
  if (path.startsWith('/app')) return path;
  return `/app${path}`;
}
