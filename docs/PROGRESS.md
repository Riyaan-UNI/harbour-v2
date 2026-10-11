# Harbour Rebuild — Progress

Source of truth: `docs/DESIGN_SPEC.md` (Harbour Design Spec v1, 11 Oct 2026 — now the
canonical copy in this repo, updated in Part A).
Package manager: **npm**. Scaffold: Vite 7 + React 18.3.1 + TypeScript 5.9 strict.
Branches: `brick-0-foundation` (done), **`brick-1-primitives`** (current).

---

## Brick 0 — Tokens, theme engine, fonts, aurora, gallery

**Status: COMPLETE.** Vite + React 18.3.1 + TS strict; `src/styles/tokens.css` holds
every spec §3–§7 token plus the `@theme static` / `@theme static inline` bridge that
turns them into Tailwind utilities; `src/theme/theme.ts` resolves the mode from a raw
string under `harbour:theme`, writes `data-theme` + `color-scheme` on `<html>`, keeps
`meta[name=theme-color]` in step and switches through the View Transitions API with a
circular reveal; Fontsource variable fonts ship with **measured** metric-adjusted
fallbacks; the aurora is three blurred blobs with a noise overlay and a masked 1px grid;
`/dev/gallery` renders every token and surface behind a dev flag. The one real bug it
found — nine `color-contrast` failures, all text over a bright aurora region — was fixed
by adding `--glass-tint` and capping the blobs, not by touching the markup. Full detail
is in the Brick 0 commit (`975248f`).

---

## Part A — Brick 0 review follow-ups

Seven fixes, in the order given. Commit `d2520c1`.

### A1 — Radii renamed

`--radius-sm` 0.5rem, `--radius-md` 1rem, `--radius-lg` 1.5rem, `--radius-pill`.
`--radius-xl` removed: the spec defines three radii plus pill and no more. `.glass`
keeps `--radius-lg`, which is now 1.5rem. Gallery captions updated, and the small
decorative chips moved from `rounded-md` to `rounded-sm`, because a 1rem radius on a
2rem box is a circle.

### A2 — The spacing trap, closed by two gates

Tailwind's step numbers are **not** the spec's names. Spec `space-5` is 1.5rem, which is
Tailwind `p-6`; `p-5` silently means 1.25rem, a value the spec forbids. Two gates now
enforce the mapping table in spec §6:

- **ESLint `harbour/no-off-scale-spacing`** — a second rule in the existing
  `eslint-rules/no-tailwind-arbitrary-values.mjs`, because both rules share the class-token
  walk. It polices `p*`, `m*`, `gap*` and `space-*` and allows only steps 0, px, 1, 2, 3,
  4, 6, 8, 12, 16, 24, 32, plus the keywords `auto` and `reverse`. Negative and responsive
  variants are handled by stripping variants first, so `md:-mx-5` is reported as `-mx-5`.
- **Stylelint** — padding, margin, gap and inset declarations may only take
  `var(--space-*)`, `0`, `auto`, `var(--section-padding-block)`,
  `var(--container-padding-inline)`, or the aurora blob geometry tokens.

**Proof, then deletion.** A sample file with nine deliberate class errors produced three
`arbitrary` and six `off-scale` findings — and no findings for `p-6`, `gap-4`, `mx-auto`,
`p-0`, `p-px`, `m-auto`, `gap-32`, `data-[state=open]:bg-accent` or `[&>svg]:size-4`. A
sample stylesheet flagged `padding: 1rem`, `margin-inline: 3%`, `gap: 12px` and
`inset-block-start: -20%`, and left `var(--space-4)`, `var(--section-padding-block)`,
`var(--container-padding-inline)`, `auto`, `0`, `inset: 0`, a two-value shorthand and
`var(--aurora-blob-1-block-start)` alone. Both samples were then deleted.

Two existing gallery classes were off-scale and are fixed: `mt-10` → `mt-12`, `p-5` → `p-6`.

**One consequence worth naming.** The six aurora blob corner offsets were raw
percentages in `base.css`. Rather than exempt a file from the new rule, they moved into
`tokens.css` as `--aurora-blob-1-block-start` … `--aurora-blob-3-inline-start`. The rule
is absolute; no file is excused from it.

### A3 — CJK font deferred

`@import '@fontsource-variable/noto-sans-tc'` is gone from `src/styles/fonts.css`. The
font stack still lists `Noto Sans TC Variable`, so a CJK glyph falls through to
`system-ui`, and `lang="zh-HK"` still selects the right glyphs from whatever the OS has.
Brick 5 adds it back as a lazy import, preferring **Noto Sans HK** if Fontsource ships a
variable build of it.

| | Before | After |
| --- | --- | --- |
| CSS | 145.02 kB (gzip 53.74) | **30.75 kB (gzip 7.15)** |
| JS | 222.60 kB (gzip 72.51) | 223.32 kB (gzip 72.68) |
| `dist/` font files | 119 | 14 |

The package stays in `package.json` — it is needed again in Brick 5.

### A4 — The contrast matrix

`solve-aurora-cap.mjs` used to check two text tokens against one surface. It now checks
**every** text token in spec §3 against **every** surface stack, in both themes, and
exits 1 on any failure. Glass is composited exactly as `.glass` paints it — the tint
under the white sheen — over each backdrop. The aurora worst case is every non-empty
subset of the three blobs, painted in DOM order.

It found **eight pairs** that the two-token check missed.

**Before (Brick 0 values) — the failures:**

| Theme | Token | Surface | Ratio |
| --- | --- | --- | --- |
| dark | text-subtle | aurora | 3.42 |
| dark | text-subtle | glass over aurora | 4.10 |
| dark | text-subtle | glass over patch | 2.67 |
| dark | text-muted | glass over patch | 4.17 |
| dark | danger | aurora | 4.34 |
| dark | danger | glass over patch | 3.38 |
| light | text-subtle | aurora | 4.12 |
| light | success | aurora | 3.95 |

**How they were fixed.** No single lever could do it without a visible regression. The
dark cap would have to fall from 0.22 to 0.12 for `--text-subtle` alone (a 45% dimmer
aurora, in a theme the review already called subtle); retuning `--text-subtle` at cap
0.22 would need a 24% lightening, which would compress the three text levels until muted
and subtle were hard to tell apart. So **both levers moved a little**: the dark cap went
to 0.18 (re-solved, not re-chosen), and `--text-subtle` moved 14.8%. The sweep behind that
choice is in the commit message.

**After — the full matrix.** All 98 pairs clear 4.5:1. `--aurora-blob-opacity` and
`--aurora-patch-opacity` sit at exactly their solved maxima.

**dark** — blob cap 0.18, patch cap 0.29

| token | bg | bg-elev | aurora | glass/bg | glass/elev | glass/aurora | glass/patch |
| --- | --- | --- | --- | --- | --- | --- | --- |
| text | 15.99 | 14.32 | 9.95 | 13.71 | 12.97 | 11.13 | 9.85 |
| text-muted | 9.62 | 8.61 | 5.98 | 8.25 | 7.81 | 6.69 | 5.93 |
| text-subtle | 7.37 | 6.60 | 4.59 | 6.33 | 5.98 | 5.13 | 4.55 |
| accent-text | 11.22 | 10.05 | 6.98 | 9.62 | 9.10 | 7.81 | 6.92 |
| gold-text | 11.30 | 10.12 | 7.03 | 9.69 | 9.17 | 7.86 | 6.96 |
| danger | 7.80 | 6.99 | 4.85 | 6.69 | 6.33 | 5.43 | 4.81 |
| success | 11.57 | 10.36 | 7.20 | 9.92 | 9.39 | 8.05 | 7.13 |

**light** — blob cap 1, patch cap 1

| token | bg | bg-elev | aurora | glass/bg | glass/elev | glass/aurora | glass/patch |
| --- | --- | --- | --- | --- | --- | --- | --- |
| text | 13.63 | 15.10 | 11.16 | 14.53 | 14.79 | 14.06 | 14.06 |
| text-muted | 6.32 | 7.00 | 5.17 | 6.74 | 6.86 | 6.52 | 6.52 |
| text-subtle | 5.64 | 6.25 | 4.62 | 6.01 | 6.12 | 5.82 | 5.82 |
| accent-text | 6.08 | 6.74 | 4.98 | 6.48 | 6.60 | 6.27 | 6.27 |
| gold-text | 5.76 | 6.38 | 4.72 | 6.14 | 6.25 | 5.94 | 5.94 |
| danger | 5.90 | 6.54 | 4.83 | 6.29 | 6.40 | 6.08 | 6.08 |
| success | 5.65 | 6.26 | 4.63 | 6.03 | 6.13 | 5.83 | 5.83 |

The 3:1 large-text allowance is **unused**: `--text` clears 4.5:1 everywhere, so no size
depends on it.

### A5 — The gallery's glass section has a real colour field

Glass used to sit over the page aurora, which meant it was reviewed over whatever the
blobs happened to be behind at that viewport. The section now wraps its three cards in
`<AuroraPatch>`: the same three blobs in a rounded, contained box, with a new solved cap.
A patch may run hotter than the page aurora (0.29 vs 0.18 in dark) because glass always
sits on top of it, and it is the glass tint that keeps text legible — the page aurora has
bare text on it. The noise texture is now one shared `.aurora-noise` class.

### A6 — z-index utilities

`@utility z-raised`, `z-nav`, `z-dropdown`, `z-modal`, `z-toast`, each bound to its token.
`z-10` and friends are not defined, so the scale is the only scale. The "use a local class
instead of z-10" note is gone.

### A7 — The spec is now the canonical copy

`docs/DESIGN_SPEC.md` gained: the CJK deferral (§2); the four added tokens and the three
retuned values, with the measurements that forced them (§3); the new `.glass` CSS and the
aurora cap rule (§4); the radius names and the full spec-name → Tailwind-step mapping
table (§6); and both new gates by name (§12).

---

## Brick 1 — Layout primitives

**Status: COMPLETE. All gates green.**

| Gate | Command | Result |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | pass (both TS projects) |
| Lint | `npm run lint` | pass, 0 problems |
| Lint CSS | `npm run lint:css` | pass, 0 problems |
| Build | `npm run build` | pass — CSS 32.62 kB (gzip 7.56), JS 235.62 kB (gzip 76.00) |
| E2E + axe | `npm run test:e2e` | **51/51 pass** |

The 51 tests are: the gallery matrix (10), the gallery's reduced-motion, system-mode,
keyboard and zoom passes (7), four glass-section close-ups, the primitives matrix at
320/360/390/768/1024/1440 (12), ten Bento column-count assertions, one container-query
assertion, the primitives' reduced-motion, zoom and text-size passes (7).

### What Brick 1 delivers

```
src/components/layout/index.ts       one barrel
src/components/layout/types.ts       the Space union, the polymorphic helpers, the factory
src/components/layout/Container.tsx  page / measure / narrow
src/components/layout/Section.tsx    padding-block + scroll-margin + optional Container
src/components/layout/Stack.tsx      column, gap, align
src/components/layout/Cluster.tsx    wrapping row, gap, justify, align
src/components/layout/Grid.tsx       auto-fit, track minimum sm/md/lg, gap
src/components/layout/Bento.tsx      Bento + BentoItem, every size, tall
src/components/layout/Heading.tsx    level 1–6 decoupled from role display/h1/h2/h3
src/components/layout/Text.tsx       role body/small/label × tone default/muted/subtle
src/components/layout/VisuallyHidden.tsx
src/components/layout/Cq.tsx         container-type: inline-size
src/styles/layout.css                the structural CSS, in @layer components
src/routes/dev/Primitives.tsx        /dev/primitives
```

Every primitive is polymorphic (`as`), forwards its ref, and is strict-typed. **Spacing
props are the ten spec steps**: `gap={5}` is `var(--space-5)`, and `gap="1.5rem"` does not
type-check. No primitive sets an outer margin, and only `Heading` and `Text` set a font
size — they exist to own the type roles.

React cannot express a generic `forwardRef`, so the cast is confined to one factory
(`createPolymorphicComponent` in `types.ts`) instead of being repeated in ten files.

`layout.css` sits in `@layer components`, so a Tailwind utility added by a caller still
wins. The gap is not in the CSS at all — it comes from the typed prop and is written as
`var(--space-N)` inline, which is why the spec's step numbers are the only values that
can be expressed.

### /dev/primitives

Every primitive, every variant, plus the stress cases: three unbroken words (including a
69-character Welsh place name) bare, in a Grid and in a Cluster; a 20-item Grid; a Bento
carrying every size and a `tall` item; a Stack nested in a Cluster; a Container at each of
its three widths; a Section with `contained` on and off; and one block of identical markup
in a 28rem container and a 75rem container, which resolves to two columns and three
columns respectively **at the same viewport**.

### The gallery is dogfooded

`/dev/gallery` now uses the primitives throughout and has no structural layout class left.
Its nine blocks are `Section` → `Container` → `Stack`; every list, row and grid is a
`Stack`, `Cluster` or `Grid`; every heading and paragraph is a `Heading` or `Text`. The
only spacing utilities that remain are intrinsic padding on three demo widgets — the two
glass cards' `p-6` and the motion button's `px-3` — which Brick 2 replaces with real Card
and Button components. The chart and motion lists also moved from fixed column counts to
`Grid`'s auto-fit, so the layout is the primitive's rather than a breakpoint's.

### Deviations and decisions

| # | Spec says | We do | Why |
| --- | --- | --- | --- |
| 1 | `.glass` background is `var(--glass-fill)` (§4, verbatim) | tint under sheen | Forced by the Brick 0 axe run. |
| 2 | Aurora blobs painted at full strength (§4) | capped by `--aurora-blob-opacity`, **re-solved to 0.18** in dark | Forced by the axe run; Part A4 widened the check and re-solved it. |
| 3 | px only for 1px hairlines (§0.2), but the focus ring is "2px ring, 2px offset" (§3) | focus ring is `0.125rem` | The two spec rules conflict; rem renders identically. |
| 4 | Spacing is `space-1..space-10` (§6) | Tailwind's numeric scale is kept and the ten values are also exposed as `--space-1..--space-10` | The spec's ten values are exactly Tailwind's defaults at 1, 2, 3, 4, 6, 8, 12, 16, 24, 32. **The enforcement gap is now closed** — A2's two gates reject every off-scale step. |
| 5 | Breakpoints 40 / 48 / 64 / 80 em (§6) | mapped to `sm`/`md`/`lg`/`xl` in **em**; Tailwind's `2xl` removed | Tailwind's defaults are the same numbers in rem, which diverge from em under a changed browser base size. The text-size test proves em media queries do not move when the root font size doubles. |
| 6 | Radii 0.5 / 1 / 1.5 rem + pill (§6) | `sm` 0.5 / `md` 1 / `lg` 1.5 / `pill`; no `xl` | Settled by review (A1), superseding the Brick 0 proposal. `UniversityLogo` (§8) takes `radius md` = 1rem — see Brick 2. |
| 7 | Noto Sans TC as CJK fallback (§5) | not imported until Brick 5 | A3: ~112 kB of CSS on every page, and no Cantonese copy before Brick 5. |
| 8 | — | `server.host` pinned to `127.0.0.1` | Vite's default `localhost` bound to `[::1]` here, which hung Playwright. `npm run dev:lan` overrides it. |
| 9 | — | aurora blob corner offsets are tokens | A2: the Stylelint spacing rule polices `inset`, so the values moved into `tokens.css` rather than exempting `base.css`. |
| 10 | — | `--aurora-patch-opacity` added | A5: a contained patch is always under glass, so it can run hotter than the page aurora. Solved, not guessed. |
| 11 | Spacing is `space-1..space-10` (§6) | the CSS rule does **not** police `scroll-margin-*` / `scroll-padding-*` | Those are scroll-snap offsets, not layout spacing. Named so the omission is deliberate rather than an oversight. |
| 12 | — | Grid track minimums are 14 / 17 / 22 rem | Only 17rem is in the spec (§6). 14 and 22 are the steps the Grid primitive exposes, and they are tokens. |
| 13 | — | `--section-scroll-margin` 5rem | The spec gives the landing nav a sticky glass bar but no height. PROPOSED. |
| 14 | Heading level and role are separate | `Heading`'s default role follows the level (1→h1, 2→h2, 3+→h3) | The decoupling is still available through `role`; the default only spares the common case. |
| 15 | — | the gallery's chart and motion lists use `Grid` auto-fit rather than 5 and 4 fixed columns | A fixed column count is a breakpoint decision the primitive is meant to remove. |
| 16 | — | `extraHOCs: ['createPolymorphicComponent']` in the react-refresh rule | Without it the rule cannot see the factory's output as a component, and the brick would ship 11 warnings where Brick 0 had none. |
| 17 | 3:1 for UI and graphics, 4.5:1 for text (§3) | 4.5:1 everywhere; the large-text allowance is unused | Every text token clears 4.5:1 on every surface, so no size depends on the looser rule. |

### Token changes — the complete list for Brick 1's two commits

| Token | Theme | Before | After | Commit |
| --- | --- | --- | --- | --- |
| `--radius-sm` | both | *did not exist* | `0.5rem` | A |
| `--radius-md` | both | `0.5rem` | `1rem` | A |
| `--radius-lg` | both | `1rem` | `1.5rem` | A |
| `--radius-xl` | both | `1.5rem` | **removed** | A |
| `--text-subtle` | dark | `#7f9e9a` | `#92aca9` | A |
| `--text-subtle` | light | `#4f6e6a` | `#496662` | A |
| `--success` | light | `#1b7a4b` | `#186e44` | A |
| `--aurora-blob-opacity` | dark | `0.22` | `0.18` | A |
| `--aurora-patch-opacity` | dark | *did not exist* | `0.29` | A |
| `--aurora-patch-opacity` | light | *did not exist* | `1` | A |
| `--aurora-blob-1-block-start` … `--aurora-blob-3-inline-start` | both | raw `%` in `base.css` | six tokens | A |
| `--container-narrow` | both | *did not exist* | `28rem` | B |
| `--section-scroll-margin` | both | *did not exist* | `5rem` | B |
| `--grid-min-sm` / `-md` / `-lg` | both | *did not exist* | `14` / `17` / `22rem` | B |

No pre-existing colour outside the three above was retuned. `--glass-tint` and
`--mask-opaque` were Brick 0 additions and are already in the spec.

### Residual risk

- **The dark aurora is dimmer than Brick 0's.** The cap is 0.18 rather than 0.22 because
  the check now covers all seven text tokens, not two. The lever for a stronger aurora is
  the aurora token *values* or the text tokens, never the cap — and `solve-aurora-cap.mjs`
  will reject any cap above the solved maximum.
- **The patch cap is tight.** 0.29 in dark is the highest value at which `--text-subtle`
  still clears 4.5:1 on glass over the patch. If the patch needs to be more colourful, the
  fix is a darker patch blob or a stronger glass tint, not a higher cap.
- **`/dev/primitives` trips axe's `heading-order` (moderate).** The Heading demo renders
  an `h1`, an `h2` and an `h3` inside a section to show the decoupling. The gate blocks
  serious and critical violations, which is what the spec asks for; moderate is out of
  scope by design, but it is worth knowing the page is not perfectly clean.
- **Playwright's `test-results/` and `screenshots/` are on `R:`.** The trash operation
  fails on that drive, so `--output` must point at a local path (e.g.
  `C:/Users/<you>/AppData/Local/Temp/...`). `.gitignore` covers `/.pw-run*/` and `/.tmp-*/`.

### What Brick 2 needs

1. **Reuse `ThemeToggle`.** It is the real three-state control the spec asks for in §8 and
   is already covered by tests.
2. **`UniversityLogo` and the new radius names.** §8 says the logo box takes "radius md",
   which is now 1rem. At the 2rem size that is a circle-ish squircle; `--radius-sm` may
   read better. Decide per size and record it rather than silently picking one.
3. **Card variants and container queries.** `Cq` and the `@sm:`/`@md:`/`@lg:` variants are
   in place and proven by an assertion. The interactive card's spotlight (`--mx`/`--my` in
   a rAF-throttled pointermove), its ≤6° tilt behind `(hover: hover) and (pointer: fine)`,
   and its Motion `layoutId` expand are Brick 2's.
4. **Cards must not nest glass**, and at most three glass surfaces may be on screen. The
   gallery enforces this by example; Brick 2 should keep it true.
5. **`z-dropdown`, `z-modal`, `z-toast` now exist.** The combobox popover, the modal
   backdrop and the toaster should use them instead of raw `z-*`.
6. **The spacing gates will bite on copied shadcn code.** Expect `p-5`, `gap-7` and
   friends in anything vendored from shadcn, and fix them to the §6 table rather than
   disabling the rule.
7. **shadcn/ui is deferred to Brick 2.** Add it one dependency at a time, pinned, and
   bridge its CSS variables onto the tokens rather than letting it carry its own palette.
8. **`--touch-target` (2.75rem) and the button heights** (2.75 / 3.25 / 2.25rem) are
   tokens already; `min-h-11` in `ThemeToggle` is the interim spelling of the same value.
9. **Noto Sans TC is still absent.** Fine until Brick 5; do not re-add it early.
10. **Cantonese strings still need a native-speaker check** (spec §14), and they have not
    been written yet.
