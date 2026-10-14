/**
 * api-base — point the front end at a backend on another origin.
 *
 * In dev, `/api/...` is proxied by Vite to the Express server on port 5000, so
 * the app calls relative URLs. On GitHub Pages there is no server and no
 * proxy: `/api/...` would hit github.io and 404. The backend lives somewhere
 * else, and its HTTPS address is supplied at build time as `VITE_API_URL`
 * (for example `https://harbour-api.example.com`, no trailing slash needed).
 *
 * Rather than edit every call site (the ported legacy client and the v2 pages
 * both call `fetch('/api/...')`), `installApiBase()` wraps `window.fetch` once
 * at startup. A request whose URL is a string starting with `/api/` is sent to
 * `VITE_API_URL` instead. Every other request passes through untouched.
 *
 * When `VITE_API_URL` is empty in development, Vite's `/api` proxy is used. A
 * production request without the setting is rejected with an explicit error
 * rather than falling through to the GitHub Pages origin.
 *
 * Limits, on purpose: only string URLs are rewritten, not `URL` or `Request`
 * objects. New code that builds a `Request` should call `apiUrl()` itself.
 */
const RAW = (import.meta.env.VITE_API_URL ?? '').trim();
const IS_PRODUCTION = import.meta.env.PROD;
let API_ORIGIN = '';
let API_CONFIGURATION_ERROR = '';

if (RAW) {
  try {
    const configuredUrl = new URL(RAW);
    if (
      !['http:', 'https:'].includes(configuredUrl.protocol) ||
      configuredUrl.username ||
      configuredUrl.password ||
      configuredUrl.pathname !== '/' ||
      configuredUrl.search ||
      configuredUrl.hash ||
      (IS_PRODUCTION && configuredUrl.protocol !== 'https:')
    ) {
      throw new Error();
    }
    API_ORIGIN = configuredUrl.origin;
  } catch {
    API_CONFIGURATION_ERROR =
      'VITE_API_URL must be an HTTP(S) origin without credentials, a path, query, or fragment; production requires HTTPS.';
  }
}

/** The full URL for an API path such as `/api/chat`. */
export function apiUrl(path: string): string {
  if (!path.startsWith('/api/')) return path;
  if (API_CONFIGURATION_ERROR) throw new Error(API_CONFIGURATION_ERROR);
  if (!API_ORIGIN) {
    if (IS_PRODUCTION) {
      throw new Error(
        'Harbour API is not configured for this production build. Set VITE_API_URL to the HTTPS backend origin.',
      );
    }
    return path;
  }
  return `${API_ORIGIN}${path}`;
}

let installed = false;

export function installApiBase(): void {
  if (
    installed ||
    typeof window === 'undefined' ||
    (!API_ORIGIN && !API_CONFIGURATION_ERROR && !IS_PRODUCTION)
  ) {
    return;
  }
  installed = true;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input !== 'string') return nativeFetch(input, init);
    try {
      return nativeFetch(apiUrl(input), init);
    } catch (error) {
      return Promise.reject(error);
    }
  };
}
