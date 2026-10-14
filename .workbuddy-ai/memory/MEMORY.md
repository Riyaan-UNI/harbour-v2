# Harbour — project memory

## Sources of truth
- `docs/DESIGN_SPEC.md` — tokens, components, gates. **Never invent a value not in it — ask.** §2–§6, §12 record deviations. `.impeccable.md` — design intent. `docs/PROGRESS.md` — brick status.

## Status
Bricks 0–3b done; landing sections = Brick 4; `/app/people` rebuilt as Instagram-style person cards with per-person mascots. **Brick 9 done: Scam Shield at `/app/scam`** — hero + Tabs(X-ray|Drill) + SAMPLE read + recovery + final call, engines under `src/lib/features/{redact.ts,scam/*}`, lane `src/styles/scam-shield.css`, `e2e/scam-shield.spec.ts` (20/20). Legacy `/app/shield` route removed — `/app/scam` is the tool's one address.
- **Brick 2b leftovers now:** `Tabs` exists (`ui/tabs.tsx` + `tabs-variants.ts`, hand-rolled ARIA). Still unbuilt: Combobox/CountryCombobox, Dialog, ProgressBar.

## Conventions
- **Sample people live in exactly one place**: `src/lib/sample-people.ts` (`SAMPLE_PEOPLE`, 12 people, `SamplePerson`, `samplePersonById`). `/app/people` (`routes/People.tsx`) and the legacy `legacy/pages/Profile.jsx` (`directory = SAMPLE_PEOPLE`, so `/app/profile/:id`) both read it. **Ids are stable — `harbour-friends` keys on them; never rename or reuse.** Never re-introduce a local copy of the roster.
- Vite 7 + React 18.3.1 + TS 5.9 strict; Tailwind v4.3 CSS-first; shadcn vendored; npm exact pins.- **Tokens only:** no raw colour outside `src/styles/tokens.css`; no px except 1px hairlines; spacing only from ten spec steps.
- **Gates:** typecheck|lint|lint:css|build|test:e2e. ESLint bans arbitrary Tailwind *values* + off-scale spacing; Stylelint bans px-except-1px, raw colours, non-var spacing.
- **Use existing primitives** (`src/components/layout/*`, `src/components/ui/*`); only Heading/Text set font sizes. Icons = lucide via `ui/icons.tsx` (px `size` unexposed — §2 deviation); social/utility set extended (Heart·MessageCircle·Search·MapPin·Share2·Star). **`ui/mascot.tsx`** = 12 token-driven mascots (body `currentColor`, ink `var(--bg)`), one unique kind per sample person; every sample pfp and `/app/profile/:id`. **Stylelint bans any non-token spacing/inset value — even `calc(var(--space-N) * -1)` — and percentages.** For an off-scale offset add a scoped token family in `tokens.css` **plus** a matching alternative to `SPACING_VALUE` in `stylelint.config.mjs` (see `--drifter-pull-*`).
- `--border-strong` = sole-boundary border; `--border` decorative. Dark default; `data-theme` + `color-scheme` on `<html>`.
- Motion: transform/opacity only; GSAP landing/scroll/SVG, Motion state, Lenis landing only.
- **Recharts** via CSS class overrides. **Per-scene namespaced SVG gradient ids** when multiple inline SVGs share a page. **Parallel class namespace** when redesigning a legacy page whose base styles are still reused. **Scoped token families** in `tokens.css` (e.g. `--arrival-*`).
- **Scene backdrop + glass-behind-text pattern**: `--glass-tint` background + `backdrop-filter: blur(var(--glass-blur)) saturate(140%)` on `.app-home-glass-text` plates wraps every text-bearing region that is not already a Card surface; scene sits at `position: absolute; inset: 0; z-index: -1` inside an isolated parent so it never escapes. **Cards are NEVER nested inside a glass-text plate** (glass on glass). The top nav and More panel sit in `src/styles/app-shell.css`, imported AFTER the legacy lane so its unlayered class selectors win ties against the ported nav styles.

## Traps (cost real debugging time)
- **Self-referential CSS vars** = invalid cycle → silent fallback. **Tailwind colour bridge is frozen** (`--color-text: var(--text)` computes where declared, then inherits): re-declare `--color-*` in the same scope.
- **Unlayered legacy CSS beats Tailwind utilities** regardless of specificity — beat with class selectors in a v2 sheet, never edit the legacy lane.
- **`gsap/CustomEase` has a default export only** — named import is `undefined` at runtime; module-scope `create` kills the bundle.
- **Vite `server.host` = `127.0.0.1`**; `npm run dev:lan` for devices. **`vite build` on R: fails at `prepare-outDir`** — `genie-trash` shim times out on the mapped drive; bypass with `--outDir "C:/Users/patan/AppData/Local/Temp/harbour-build"`. **`CODEBUDDY_SAFE_DELETE_ENABLED=0`** is the env-var bypass that lets `rmSync` go native and skip the shim entirely (newer than the `--outDir` workaround). **Playwright `outputDir`** must point to `tmpdir()` (not the workspace) — trash cleanup fails after hundreds of files.
- **Stylelint flags `0px` inside `env(safe-area-inset-top, 0px)`** as off-scale even though it's the canonical safe-area fallback idiom. Use `env(safe-area-inset-top, 0)` (no unit) — `0` is a valid `<length>` and the regex `/(?:\d*\.\d+|\d{2,}|[02-9])px/` doesn't match it.
- **Concurrent agents** may collide on shared files (`MEMORY.md`, `tokens.css`); coordinate or scope edits. A second agent works here on `Translate.tsx` / `entry-story.css` / `app-people.css` — **filter gate output by path** before assuming a failure is yours.
- **`<Navigate to="home">` inside the `/app/*` splat resolves relative to the splat** → an unknown subpath walks to `/app/x/home`, `/app/x/home/home`… Use absolute `to="/app/home"`.
- **`useId` ids contain colons** (`:r3:`) → never `page.locator('#' + id)`; compare ids as strings or use `getByRole`.
- **A `<button>` has no `.value` unless set**: a component that destructures a `value` prop out of DOM props must expose it as `data-value` for DOM-side handlers.
- **Unit tests:** `vitest` 5.0.4 (node env, `npm test`), first used by the Brick 9 engines.
- **Artwork:** Brick 9's `ScamXrayScene` is original hand-drawn SVG (token fills via CSS classes, `aria-hidden`, transform/opacity, static under reduced motion + `data-calm`). The standing rule "hero art last, ask before generating art" was not triggered — generating assets remains a separate call.
- **`fetchPriority` on `<img>` warns in React 18** — `fetchPriority="high"` produces `Warning: React does not recognize the fetchPriority prop…`. Project convention (per `ArtSlot.tsx`): drop the prop; `loading="eager"` + `decoding="async"` carry the above-the-fold hint. The static `index.html` boot images use lowercase `fetchpriority="high"` (correct HTML, no React warning).

## Aurora caps
- **Solved, not guessed** by `scripts/solve-aurora-cap.mjs` (covers all `--aurora-*` caps). Rejects caps above solved max.

## Open questions
- **Safety numbers UNVERIFIED** (`ui/safety-contacts.ts`): 999 / 18222 / 2824 6111 / HA 2300 6555 — do not ship unconfirmed.
- Cantonese strings need a native-speaker check; Noto Sans TC deferred (prefer Noto Sans HK variable). Dev pages: `import.meta.env.DEV`.
- **Brand assets in `public/`** untracked + unreadable on dark; need dark variants before use.