# Harbour Rebuild — Progress

Source of truth: `docs/DESIGN_SPEC.md` (Harbour Design Spec v1, 11 Oct 2026).
Package manager: **npm**. Scaffold: Vite + React 18 + TypeScript (strict).
Branch: **`brick-0-foundation`**.

---

## Brick 0 — Tokens, theme engine, fonts, aurora, gallery

**Status: COMPLETE. All gates green.**

| Gate | Command | Result |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | pass (both TS projects) |
| Lint | `npm run lint` | pass, 0 problems |
| Lint CSS | `npm run lint:css` | pass, 0 problems |
| Build | `npm run build` | pass — CSS 145.02 kB (gzip 53.74), JS 222.60 kB (gzip 72.51) |
| E2E + axe | `npm run test:e2e` | **17/17 pass** |

The 17 tests are: the 5-viewport × 2-theme matrix (10), a 200% zoom pass in both
themes at 1024 and 1440 (4), reduced motion (1), system mode (1), and a
keyboard-only pass over the theme toggle (1).

Builder rule 8's 200% zoom check is emulated by halving the CSS viewport — which
is what browser zoom actually does — because Playwright exposes no zoom API.
A 1440px window at 200% zoom lays out at 720px.

### What Brick 0 delivers

```
index.html                     pre-paint theme script (spec §11, verbatim)
src/styles/tokens.css          every token from spec §3–§7 + the @theme bridge
src/styles/fonts.css           Fontsource imports + metric-adjusted fallbacks
src/styles/base.css            reset, focus, selection, scrollbar, .glass, aurora, type roles
src/styles/index.css           entry: tailwind → fonts → tokens → base, dark variant
src/theme/theme.ts             mode store, resolution, meta theme-color, View Transitions
src/theme/useTheme.ts          React bindings (useThemeMode, useResolvedTheme)
src/components/Aurora.tsx      three blobs + noise + masked grid
src/components/ThemeToggle.tsx three-state segmented control (System / Light / Dark)
src/routes/dev/Gallery.tsx     /dev/gallery
src/lib/cn.ts                  clsx + tailwind-merge
eslint-rules/                  custom "no arbitrary Tailwind value" rule
scripts/                       font measurement, axe report, aurora cap solver
```

### Verify at install time (spec §14)

| Item the spec flagged as unverified | Result |
| --- | --- |
| Does `npm create vite` still default to React 19? | Yes — the scaffolder was **not** used. React is pinned by hand to **18.3.1** (`react`, `react-dom`), with `@types/react` 18.3.31 / `@types/react-dom` 18.3.7. Confirmed installed, not hoisted to 19. |
| Exact Fontsource variable package names | `@fontsource-variable/bricolage-grotesque` 5.3.0, `@fontsource-variable/geist` 5.3.0, `@fontsource-variable/geist-mono` 5.3.0, `@fontsource-variable/noto-sans-tc` 5.3.1. All four ship a variable build. Declared families: `Bricolage Grotesque Variable`, `Geist Variable`, `Geist Mono Variable`, `Noto Sans TC Variable`. |
| Tailwind v4 syntax | `@import "tailwindcss"`; dark variant `@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *))` — the data-attribute form from the v4 dark-mode docs, **verified to compile** to `.dark\:x:where([data-theme=dark],[data-theme=dark] *)`. `@theme static` (so every var is emitted to `:root` and `var(--radius-lg)` resolves) and `@theme static inline` for the colour bridge. `@utility` for the type roles and duration tokens. |
| Tailwind v4-compatible arbitrary-value plugin | None exists that supports v4, so the check is a **custom ESLint rule** (`eslint-rules/no-tailwind-arbitrary-values.mjs`). It flags arbitrary *values* (`w-[437px]`) and deliberately ignores arbitrary *variants* (`data-[state=open]:bg-accent`, `[&>svg]:size-4`). |
| Stylelint config | `stylelint` 17.16.0 + `stylelint-config-standard` 40.0.0. The px ban is a `declaration-property-value-disallowed-list` regex, because `unit-disallowed-list` cannot express "any px except 1px". |
| Playwright / axe | `@playwright/test` 1.64.0, `@axe-core/playwright` 4.13.0, Chromium only. |

Other pinned versions: `vite` 7.3.7, `@vitejs/plugin-react` 5.2.0, `typescript`
5.9.3, `tailwindcss` + `@tailwindcss/vite` 4.3.3, `react-router-dom` 7.18.4,
`clsx` 2.1.1, `tailwind-merge` 3.7.0, `eslint` 9.39.5, `typescript-eslint` 8.71.1.

### Quality gates, and proof each one fires

Every guard was proved against a deliberate failing sample, which was then
deleted. Nothing is disabled, skipped or excluded.

| Guard | Sample | Observed |
| --- | --- | --- |
| px except 1px | `width: 437px`, `margin-block: 13px`, `padding: 1px` | `437px` and `13px` flagged; `1px` **not** flagged |
| raw hex | `color: #ff0000` | flagged |
| raw rgb/hsl | `background: rgba(0, 0, 0, 0.5)` | flagged |
| arbitrary Tailwind value | `className="w-[437px] p-[13px] bg-[#ffffff] data-[state=open]:bg-accent [&>svg]:size-4"` | 3 errors for the values, **0** for the two variants |

`src/styles/tokens.css` is the single exemption from the colour rules, because
the spec's colour table is the one place raw values belong.

### The axe run, and the one fix it forced

First full run: **6 of 12 tests failed**, all `color-contrast`, all in dark
theme. Light passed everywhere. Nine individual failing nodes:

| route | vp | theme | selector | fg | bg | ratio | required |
| --- | --- | --- | --- | --- | --- | --- | --- |
| /dev/gallery | 360 | dark | `div:nth-child(2) … .text-text.type-label.block` | `#eaf5f3` | `#1aa89b` | 2.64 | 4.5:1 |
| /dev/gallery | 360 | dark | `div:nth-child(2) … .break-all.type-small.block` | `#a9c4c0` | `#1aa89b` | 1.59 | 4.5:1 |
| /dev/gallery | 360 | dark | `div:nth-child(3) > h3` | `#eaf5f3` | `#1aa89b` | 2.64 | 4.5:1 |
| /dev/gallery | 390 | dark | `div:nth-child(2) … .break-all.type-small.block` | `#a9c4c0` | `#1aa89b` | 1.59 | 4.5:1 |
| /dev/gallery | 390 | dark | `div:nth-child(3) > h3` | `#eaf5f3` | `#1aa89b` | 2.64 | 4.5:1 |
| /dev/gallery | 390 | dark | `div:nth-child(3) … .text-text.type-label.block` | `#eaf5f3` | `#1aa89b` | 2.64 | 4.5:1 |
| /dev/gallery | 768 | dark | `div:nth-child(6) > h3` | `#eaf5f3` | `#1aa89b` | 2.64 | 4.5:1 |
| /dev/gallery | 768 | dark | `div:nth-child(6) … .text-text.type-label.block` | `#eaf5f3` | `#1aa89b` | 2.64 | 4.5:1 |
| /dev/gallery | 1024 | dark | `div:nth-child(6) … .break-all.type-small.block` | `#a9c4c0` | `#1aa89b` | 1.59 | 4.5:1 |

**Step 2 — with the aurora layer hidden, the count went to zero.** Every one of
them disappeared.

**Step 3 — classification.** All nine are class **(C): text over a bright aurora
region.** Evidence: axe reports the background as `#1aa89b`, which is
`--aurora-2` exactly; the failing selectors are ordinary gallery text with no
specimen defect; and the failing set moves with viewport because the blob
geometry changes (at 1440px no blob sat behind text, so that width passed).
None were class (A) — no `on-*` token was misused and no chip was unlabelled —
and none were class (B): no *existing* token value was wrong.

**Step 4 — fix.** Both parts of the class-C remedy:

1. `--aurora-blob-opacity` — the blobs now carry an opacity cap. The value is
   **solved, not guessed**: `scripts/solve-aurora-cap.mjs` composites every
   non-empty stack of the three blobs over the page background and finds the
   highest cap that keeps both `--text` and `--text-muted` at 4.5:1.
   - dark: cap **1.0 → 0.22** (worst-case `--text-muted` 1.52 → 5.36)
   - light: cap **1.0 → 1.0** (worst case already 5.17; the token is a no-op)
2. `--glass-tint` — added, and `.glass` now paints it *under* the spec's white
   sheen, so a glass surface is legible whatever is behind it.

The gallery markup was **not** touched. No colour token was retuned to dodge a
contrast failure. Nothing was excluded from axe, and no rule was loosened.

### Token changes — before and after

**No pre-existing token value was changed.** The failures were class (C), so the
remedy is additions, not retunes. Everything below is new.

| Token | Theme | Before | After |
| --- | --- | --- | --- |
| `--aurora-blob-opacity` | dark | *did not exist* | `0.22` |
| `--aurora-blob-opacity` | light | *did not exist* | `1` |
| `--glass-tint` | dark | *did not exist* | `rgba(6, 27, 26, 0.55)` |
| `--glass-tint` | light | *did not exist* | `rgba(247, 243, 233, 0.55)` |
| `--mask-opaque` | both | *did not exist* | `#000` (mask stop only, never painted) |

`.glass` background: `var(--glass-fill)` → `var(--glass-tint)` +
`linear-gradient(var(--glass-fill), var(--glass-fill))` (sheen over tint).
That is a deviation from the spec's verbatim CSS — see below.

### Deviations from the spec

| # | Spec says | We do | Why |
| --- | --- | --- | --- |
| 1 | `.glass` background is `var(--glass-fill)` (§4, verbatim) | tint under sheen | Forced by the axe run above. |
| 2 | Aurora blobs painted at full strength (§4) | capped by `--aurora-blob-opacity` | Forced by the axe run above. |
| 3 | px only for 1px hairlines (§0.2), but the focus ring is "2px ring, 2px offset" (§3) | focus ring is `0.125rem` (= 2px) | The two spec rules conflict; rem keeps builder rule 2 intact and renders identically. |
| 4 | Spacing is `space-1..space-10` (§6) | Tailwind's default numeric scale is kept, and the ten values are *also* exposed as `--space-1..--space-10` | The spec's ten values are exactly Tailwind's defaults at 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, so no remap is needed and no muscle memory breaks. **Enforcement gap:** Tailwind still offers off-scale steps (5, 7, 9, 10, 11, …); nothing currently blocks them. |
| 5 | Breakpoints 40 / 48 / 64 / 80 em (§6) | mapped to `sm`/`md`/`lg`/`xl` in **em**; Tailwind's default `2xl` removed | The spec names no breakpoint tokens; Tailwind's defaults are the same numbers in **rem**, which diverge under a changed browser base size. |
| 6 | Radii 0.5 / 1 / 1.5 rem + pill (§6) | `--radius-md` 0.5, `--radius-lg` 1, `--radius-xl` 1.5, `--radius-pill` 9999rem | **Proposed mapping.** `--radius-lg` is used by `.glass` and "radius md" by `UniversityLogo` (a 2–3 rem box); md 0.5 / lg 1 is the only mapping that makes both sensible. Needs confirmation. |
| 7 | Noto Sans TC as CJK fallback (§5) | imported in full | Its CSS is ~112 kB (≈ 20 kB gzip) and `dist/` gains ~4.4 MB of unicode-range subsets. Nothing downloads until a CJK glyph renders, but the CSS weight is paid on every page. **Consider deferring this import to Brick 5**, when Cantonese copy first appears. |
| 8 | — | `server.host` pinned to `127.0.0.1` | Vite's default `localhost` bound to `[::1]` on this machine, which made `127.0.0.1` unreachable and hung Playwright. `npm run dev:lan` overrides it for real-device testing. |

### Values proposed where the spec is silent

Aurora blob geometry (sizes in `vmax`, corner offsets in `%`), noise opacity
`0.035` ("3 to 4%"), grid opacity `0.04` ("about 4%"), grid cell `4rem` (no value
given), drift durations `30s` / `40s` / `50s` ("30 to 50 seconds"), heading
weights 700 for display/H1 and 600 for H2/H3 (spec allows 600–700). All are
marked `PROPOSED` in `tokens.css`.

The two metric-adjusted font fallbacks are **measured**, not proposed —
`scripts/measure-font-fallbacks.mjs` loads each woff2 in Chromium and computes
`size-adjust` / `ascent-override` / `descent-override` against Arial.

### Residual risk

- **Glass over the aurora is inherently position-dependent.** The cap makes the
  worst case provable, but any future surface that puts text over a brighter
  field must be re-checked. `scripts/axe-matrix-report.mjs` is the tool.
- The cap makes the dark aurora considerably subtler than the spec's colours
  alone would render. That is the a11y/visual trade-off. If the team wants a
  stronger aurora, the lever is the aurora token *values*, not the cap.
- Playwright's `test-results/` accumulates trace chunks on a failing run. On a
  filesystem with a bulk-delete guard this blocks the next run's cleanup; pass
  `--output <fresh-dir>` if that happens.
- The gallery switcher is the real three-state `ThemeToggle` (System / Light /
  Dark), so the spec's Brick 2 component is already built and covered by tests.
  Brick 2 should reuse it rather than rebuild it.

### What Brick 1 needs

1. **Layout primitives** — Container, Section, Stack, Cluster, Grid, Bento
   (spec §6). `--container-max-inline-size`, `--container-padding-inline` (with
   its 40em/64em steps) and `--section-padding-block` already exist and are
   bridged as `max-w-page` / `max-w-measure`.
2. **Settle the radius mapping (deviation 6) and the spacing enforcement gap
   (deviation 4)** before primitives hard-code any of it.
3. **Card container queries** — spec §6 wants `container-type: inline-size` on
   the card wrapper, not viewport breakpoints. Nothing in Brick 0 assumes
   otherwise.
4. `z-index` is tokenised but not bridged to Tailwind (v4 has no z namespace);
   primitives that need stacking should use the `.layer-raised` pattern or a
   local class rather than `z-10`.
5. `docs/DESIGN_SPEC.md` §3 should be updated with the five added tokens above,
   so it stays the single source of truth.
