# Build and deployment

## GitHub Pages

The Pages site is built for `https://riyaan-uni.github.io/harbour-v2/`.
`vite.config.ts` defaults to `/` for local development and validates
`VITE_BASE`; the Pages workflow sets it to `/harbour-v2/`. `publicUrl()` and
`BrowserRouter` use Vite's base so public files, route links, and nested route
refreshes share the same prefix.

The Pages workflow runs lint, CSS lint, type-checking, unit tests, end-to-end
tests, public-asset URL checks, and the production build. It copies
`dist/index.html` to `dist/404.html` for GitHub Pages deep-link fallback and
adds `.nojekyll` before validating and uploading the artifact. It does not
deploy the Express backend.

## Backend API

The API must be deployed separately; this repository does not define its
production hostname. After an HTTPS backend origin exists, add a repository
Actions **variable** named `VITE_API_URL` with that origin (for example,
`https://api.example.org`, with no path, query, fragment, credentials, or
trailing slash). This value is embedded in the frontend bundle and is public;
never put API keys or other credentials in it. An unset or invalid value makes
production `/api/...` requests fail explicitly instead of sending them to the
GitHub Pages host.

On the backend, set `ALLOWED_ORIGINS` to include the exact frontend origin
`https://riyaan-uni.github.io` (no repository path). For multiple origins, use
a comma-separated list. The server also permits localhost and Vercel origins,
but GitHub Pages is allowed only when configured explicitly. Do not put
backend-only credentials in `VITE_*` variables; keep them in the server's
environment. `server/.env.example` contains only safe configuration examples,
not production credentials.

Set `TRUST_PROXY` to the number of trusted reverse-proxy hops in front of the
backend. It defaults to `0` so untrusted `X-Forwarded-For` headers cannot
change per-IP rate-limit keys; configure the actual hop count only after
confirming the hosting topology.

For local full-stack development, install both lockfiles:

```sh
npm ci
npm ci --prefix server
```

Keep server credentials in the ignored `server/.env` file. `npm run dev` starts
the Express server and Vite; Vite proxies `/api` to `http://127.0.0.1:5000`.
`npm run dev:web` starts only the frontend. No production API hostname is
configured in this repository yet.

## Local checks

```sh
npm run lint
npm run lint:css
npm run typecheck
npm test
npm run check:public-assets
npm ci --prefix server
npx playwright install chromium
npm run test:e2e
$env:VITE_BASE = '/harbour-v2/'
npm run build
Copy-Item dist\index.html dist\404.html
New-Item -ItemType File -Force dist\.nojekyll
npm run check:pages-build
```

On macOS/Linux, set `VITE_BASE=/harbour-v2/` for the build and use `cp`/`touch`
for the Pages fallback files.

The public-asset check parses TypeScript/JavaScript syntax, so comments,
external URLs, `/api` endpoints, test/spec fixtures, and helper-wrapped paths
are not reported. It preserves the university-logo manifest's already-reviewed
`publicUrl()` mapping. Like any static scan, it cannot prove the value of paths
assembled solely from runtime data or detect every alias of the helper; browser
tests and the built-artifact check complement it.
