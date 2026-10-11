# Harbour — project memory

## Sources of truth

- `docs/DESIGN_SPEC.md` — concrete token values, components, quality gates. **Never invent a value that is not in it — ask.**
- `.impeccable.md` — design *intent* (users, personality, aesthetic direction).
- `docs/PROGRESS.md` — brick-by-brick build plan and status. Brick 0 is **done**; it records every deviation and token change.

## Project conventions

- **Stack:** Vite 7 + React 18.3.1 (pinned by hand) + TypeScript 5.9 strict. Tailwind CSS v4.3, CSS-first (`@tailwindcss/vite`, no `tailwind.config.js`). shadcn/ui copied into the repo, from Brick 2.
- **Package manager:** npm. Pin exact versions, add one dependency at a time.
- **Tokens only.** No raw hex/rgb/hsl outside `src/styles/tokens.css`; no `px` except 1px hairlines; spacing only from the spec scale.
- **Gates (all must pass):** `npm run typecheck`, `lint`, `lint:css`, `build`, `test:e2e` (Playwright + axe, 17 tests).
- **Two gates enforce the rules:** a custom ESLint rule flags arbitrary Tailwind *values* (`w-[437px]`) but allows arbitrary *variants*; Stylelint bans px-except-1px and raw colour functions outside `tokens.css`.
- **Theme:** dark is the default; dark and light are designed separately, never auto-inverted. `data-theme` + `color-scheme` live on `<html>` so Radix/shadcn portals inherit them.
- **Theme storage:** the mode is a **raw string** under `harbour:theme` (`system` | `light` | `dark`) — deliberately not Zustand-persisted JSON, so the pre-paint script in `index.html` can read it and avoid a flash.
- **Profile storage keys:** `harbour:v1:profiles`, `harbour:v1:activeProfileId`, `harbour:theme`.
- **Motion:** animate `transform` and `opacity` only; GSAP for landing/scroll/SVG scenes, Motion for component state, Lenis on the landing page only.
- **Never:** a card inside a card; glass on glass; more than three glass surfaces on screen.
- **Added tokens (not in the spec yet — §3 should absorb them):** `--glass-tint`, `--aurora-blob-opacity`, `--mask-opaque`. The aurora cap exists because text can land on a blob; it is *solved* by `scripts/solve-aurora-cap.mjs`, never guessed.
- **Vite `server.host` is pinned to `127.0.0.1`** (Vite's `localhost` resolves to `[::1]` here and breaks `127.0.0.1` clients). Use `npm run dev:lan` for real-device testing.
- **This environment blocks bulk deletes:** `vite build` empties `dist/` and Playwright empties its output dir. Use `--outDir <temp>` and `--output <fresh-dir>`.

## Definition of done for every brick

Both themes · 360/390/768/1024/1440 px · 200% zoom · keyboard only · reduced motion · no `px` beyond hairlines · no raw colours · axe clean · `scrollWidth <= clientWidth` · screenshots shown before moving on.

## Skills

- `.workbuddy-ai/skills/harbour-ui/` — enforces the design spec on any UI work. Contains the builder rules, a verification checklist, and a read-only token audit script.

## Open questions

- Radius token mapping — **proposed** md 0.5 / lg 1 / xl 1.5 rem; needs sign-off, and the spec should record it.
- Spacing naming — **decided**: Tailwind's default numeric scale is kept (it matches the spec's ten values exactly) plus `--space-1..10`. Off-scale steps are not yet blocked.
- Heading font — **Bricolage Grotesque is live**; the one-token swap to Geist 600 is still available.
- Gallery dev-flag — **decided**: `import.meta.env.DEV`, overridable by `VITE_ENABLE_GALLERY`.
- Cantonese strings need a native-speaker check before shipping.
- Noto Sans TC costs ~112 kB of CSS (≈ 20 kB gzip) on every page; consider deferring its import to Brick 5.
