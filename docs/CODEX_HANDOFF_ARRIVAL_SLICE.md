# Codex handoff — Harbour UI rebuild, Slice 1

Self-contained brief. Everything below was verified on disk, not assumed.
Repo root: `R:/University/Team Harbour Project/harbour-v2/harbour-v2`

---

## 1. Your task

Continue the Harbour UI rebuild. Slice 1 (landing hero + visual foundation) is
**done and verified**. Take the next slice. Do not redo Slice 1.

Work in small vertical slices, one at a time. After each slice: run the four
gates, capture screenshots at 360 / 768 / 1440 in both themes, then continue to
the next slice without waiting for approval.

---

## 2. State of the repo

- Branch: **`feat/harbour-inspired-ui`** (created from `brick-4-landing-sections`).
- Uncommitted user work was preserved. Nothing was reset, reverted or cleaned.
- **Nothing is committed.** Do not commit or push unless asked.
- Dirty files that existed before this slice and must not be discarded:
  `src/components/landing/LandingSections.tsx`, `src/components/landing/LiveDemo.tsx`,
  `src/legacy/pages/Dashboard.jsx`, `src/routes/entry.tsx`,
  `screenshots/phase-1/*.png`.

### Gate results after Slice 1 (all green)

| Gate | Command | Result |
| --- | --- | --- |
| ESLint | `npx eslint .` | exit 0 |
| Stylelint | `npx stylelint "src/**/*.css"` | exit 0 |
| Typecheck | `npx tsc --noEmit -p tsconfig.json` (+ `tsconfig.node.json`) | exit 0 |
| Build | `npx vite build` | exit 0, 2m |
| Contrast solver | `node scripts/solve-aurora-cap.mjs` | exit 0 — 182/182 text pairs clear |

---

## 3. What Slice 1 changed

### 3.1 New scoped token family (visual foundation)

`src/styles/tokens.css` gained an `--arrival-*` block, defined **separately in
dark and light** (never auto-inverted):

| Token | Dark | Light | Role |
| --- | --- | --- | --- |
| `--arrival-bg` | `#121b29` | `#edf2fb` | hero page field |
| `--arrival-surface` | `#1e2d40` | `#f8faff` | raised surface |
| `--arrival-text` | `#f3f5f8` | `#1d2b43` | primary text |
| `--arrival-muted` | `#b8c6d8` | `#4b5b73` | secondary text |
| `--arrival-border` | `#8193aa` | `#697e9e` | sole-boundary border |
| `--arrival-action` | `#b9cbff` | `#304cb0` | primary action fill |
| `--arrival-on-action` | `#18264c` | `#f8faff` | text on action fill |
| `--arrival-highlight` | `#f1c96f` | `#78550c` | headline emphasis |
| `--arrival-art-frame` | `#263952` | `#d5dfef` | artwork mount |
| `--arrival-type-display` | `clamp(2.75rem, 1.4rem + 4.8vw, 5.5rem)` | shared | hero display size |

These are **additive**. The global teal/gold palette is untouched, so the app
shell and legacy lane still work. Re-skinning them is a later slice.

### 3.2 Hero rework

`src/components/landing/Hero.tsx` — rewritten:

- Removed `AuroraPatch` from the hero; the section now paints `--arrival-bg`
  directly. The full-bleed colour field and its mask are gone.
- Removed `SplitText`, the `document.fonts.ready` gate, the `opacity: 0`
  pre-hide and the per-line reveal. **Content and actions are now available
  immediately** — no entrance can leave a control invisible or delayed. The
  remaining motion is a `y`-only GSAP tween wrapped in `gsap.matchMedia()`, so
  reduced-motion users get the final state with no movement.
- `data-entrance="entered"` on `#top` is preserved for axe-scan stability.
- Two-column grid (copy / artwork) collapsing to one column below 64em.
- Added a privacy line under the CTAs ("A local profile. No account or
  password. Saved on this device.") using `EyeOff` from the existing icon set.
- Eyebrow copy changed to "For international students in Hong Kong, China"
  (Addendum 1 rule 10 — territory naming).

`src/components/landing/HarbourJourneyScene.tsx` — rewritten:

- Uses the **Harbour-owned raster artwork** `art/harbour-hero-concept-01.png`
  (1200×900) instead of the old inline SVG scene.
- The caption sits **below** the artwork in normal flow. The previous version
  absolutely positioned a card over the illustration, which covered it.
- Carries a permanent `DemoBadge variant="sample"` — the three steps are an
  illustration of the product, not live state.
- Three steps: Find your next step / Make the words clearer / Check before you act.

`src/components/landing/HeroCta.tsx` — added an `ArrowRight` icon to the primary
CTA in both states. Routes and `data-state` values unchanged.

### 3.3 Three real bugs fixed

These were pre-existing defects that the hero re-skin exposed. All three are
general, not hero-specific, and affect every new component:

1. **Circular CSS custom properties.** `src/styles/legacy-compat.css` declared
   `--text-muted: var(--text-muted)`, `--border: var(--border)`,
   `--success: var(--success)`, `--ease-out: var(--ease-out)`,
   `--z-base: var(--z-base)`, `--radius-sm: var(--radius-sm)`,
   `--font-body: var(--font-body)` and others. A self-reference is an **invalid
   cycle**, so those properties became guaranteed-invalid. Consequence measured
   in-browser: `body` was rendering in `system-ui`, **not Geist**, and
   `--text-muted` resolved to nothing in dark. Removed the self-referential
   lines. Body now renders `"Geist Variable", "Geist Fallback", …` in both themes.

2. **Frozen Tailwind colour bridge.** `tokens.css` declares
   `--color-text: var(--text)` on `:root`. A custom property is computed **where
   it is declared**, then inherited — so overriding `--text` on a subtree never
   reaches a `text-text` utility. Any scoped re-theme must **also re-declare the
   `--color-*` bridge variables** in that same scope. This is now done for the
   hero and is documented in `landing.css`.

3. **Unlayered legacy CSS beats Tailwind utilities.** `src/legacy/styles/harbour-ui.css`
   sets `h1, h2, h3 { color: var(--text-strong) }` and `a { color: var(--teal-700) }`.
   That file is unlayered, Tailwind's utilities are layered, and **unlayered CSS
   wins over layered CSS regardless of specificity or order**. Result: the hero
   `h1` ignored its token and the primary button label was painted in the page
   accent on an accent fill (≈1.4:1 — effectively unreadable). Fixed by using
   class-level selectors in `landing.css` (`.hero__headline`, `.hero__actions > a`),
   which outrank the element selectors.

### 3.4 Measured verification

No horizontal overflow at any tested width (`scrollWidth - clientWidth === 0` at
360 and 1440, both themes). Contrast measured from computed styles:

| Element | Dark | Light |
| --- | --- | --- |
| Headline on field | 15.83 | 12.64 |
| Subhead on field | 9.97 | 6.14 |
| Gold emphasis | 10.97 | 6.02 |
| Privacy line | 9.97 | 6.14 |
| Artwork caption | 6.77 | 5.14 |
| Primary CTA label on fill | 9.19 | 7.22 |
| Ghost link | 15.83 | 12.64 |

All ≥ 4.5:1. Screenshots: `outputs/arrival-slice/hero-{360,768,1440}-{dark,light}.png`

---

## 4. What is NOT done

### 4.1 Known defects / risks introduced or left

1. **The hero image is 1.53 MB.** `vite build` reports
   `dist/assets/harbour-hero-concept-01-*.png 1,531.40 kB`. It is `loading="eager"`
   + `fetchPriority="high"`, so it is the LCP element. This will miss the spec's
   LCP ≤ 2.5 s target on mobile. **Fix before shipping**: convert to WebP/AVIF at
   ~1200 px and ~600 px, or restore an SVG. Do not silently drop the artwork.
2. **Main JS chunk is 1,042 kB (333.80 kB gzip)** — over the spec's 250 kB gzip
   landing target. `LandInScene-*.js` alone is 584 kB (150 kB gzip). Pre-existing,
   but the hero now eagerly pulls more in. Investigate code-splitting.
3. **Nav and footer still use the global teal/gold palette** while the hero is
   blue. In the light theme the nav's "Get started" pill renders dark green
   (`#0B3935`) against the blue hero — a visible clash. This is the single most
   obvious inconsistency on `/` right now.
4. **The `Aurora` layer is still mounted** on `/` (`src/routes/Landing.tsx` renders
   `<Aurora />`) but the hero now paints an opaque background over it. It is
   wasted work behind the fold-topping section. Decide: keep for below-fold
   sections, or scope it.
5. **Three tokens are now dead** but still solved and gated by the contrast
   script: `--aurora-hero-opacity`, `--aurora-hero-copy-opacity`,
   `--aurora-hero-mask-start`. Remove them or repurpose them, and update
   `scripts/solve-aurora-cap.mjs` in the same change.
6. **Hero focus ring is legacy gold, 3px.** `harbour-ui.css` line 92 sets
   `:where(...):focus-visible { outline: 3px solid var(--gold-400) }`, which
   overrides the spec's `--focus-ring` 2px. Needs a decision: fix globally, or
   accept as legacy behaviour.
7. **`public/art/harbour-hero-concept-01.svg` and `art/harbour-scene-01.*` are
   now unused** by the hero. Verify references before deleting anything.

### 4.2 Untouched by this slice

- Landing nav, footer, and every section below the hero
  (`LandingSections.tsx`, `LiveDemo.tsx`) — still the previous look.
- Login (`/login`), signup (`/signup`), the whole `/app/*` shell, dashboard, and
  every product route (translation, scam, rental, checklist, people, community,
  tide bank, voice SOS, profile).
- The legacy lane (`src/legacy/**`) — deliberately not edited.
- CJK font / Cantonese coverage — still deferred.
- Safety numbers — still **UNVERIFIED**.

### 4.3 Not verified

- **No axe run this slice.** The project's Playwright suite was deliberately not
  run (you asked for no large E2E suite). Expect stale assertions in
  `e2e/landing.spec.ts` and `e2e/landing-sections.spec.ts`: they assert glass
  classes and an *empty* hero art slot, both of which changed. Fix the tests as
  part of the nav/footer slice.
- **200% zoom and keyboard-only passes** were not run on the hero.
- The 768 px screenshot was captured but not visually reviewed.

---

## 5. Next slices, in order

1. **Landing nav + footer** — re-skin onto the new palette so `/` is coherent.
   Keep the sticky-glass-on-scroll behaviour, the below-48em Sheet menu, the
   `#tools` / `#how-it-works` / `#trust` anchors, and the 2.75rem touch targets.
   Also fix the stale e2e assertions here.
2. **Remaining landing sections** — four tools, problem cards, live demo,
   rental band, how-it-works, preview strip, trust band. Ids `#tools`,
   `#how-it-works`, `#trust` already exist and are linked.
3. **Login / signup** — apply the system, keep local-profile truth and the
   privacy explanation explicit. No password or account language.
4. **Dashboard** — real Harbour data only, honest empty/demo states.
5. **Product flows** — translation, scam awareness, rental support first.
6. **Consistency pass** — shared nav, dialogs, loading/empty/error states.

---

## 6. Files to refer to and re-design

### Design intent and product contracts (read before changing visuals)

```
R:/University/Team Harbour Project/harbour-v2/harbour-v2/.impeccable.md
R:/University/Team Harbour Project/harbour-v2/harbour-v2/INSPIRATION.md
R:/University/Team Harbour Project/harbour-v2/harbour-v2/docs/DESIGN_SPEC.md
R:/University/Team Harbour Project/harbour-v2/harbour-v2/docs/SPEC_ADDENDUM_1.md
R:/University/Team Harbour Project/harbour-v2/harbour-v2/docs/PROGRESS.md
```

### Slice 1 files (the ones to extend, not redo)

```
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/components/landing/Hero.tsx
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/components/landing/HarbourJourneyScene.tsx
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/components/landing/HeroCta.tsx
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/styles/landing.css
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/styles/tokens.css
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/styles/legacy-compat.css
```

### Next-slice targets

```
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/components/landing/LandingNav.tsx
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/components/landing/LandingFooter.tsx
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/components/landing/LandingSections.tsx
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/components/landing/LiveDemo.tsx
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/components/landing/WaveLine.tsx
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/components/landing/ArtSlot.tsx
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/components/landing/index.ts
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/routes/Landing.tsx
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/routes/entry.tsx
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/App.tsx
```

### Style system

```
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/styles/index.css
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/styles/base.css
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/styles/layout.css
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/styles/ui.css
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/styles/shadcn.css
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/styles/fonts.css
```

### Shared components and primitives

```
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/components/ui/          (Button, Card, Chip, StatusBadge, DemoBadge, Sheet, SafetyRail, …)
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/components/ui/icons.tsx
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/components/layout/     (Container, Section, Stack, Cluster, Grid, Bento, Heading, Text, Cq)
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/components/Aurora.tsx
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/components/AuroraPatch.tsx
```

### Legacy lane — read only, never edit (alias through `legacy-compat.css`)

```
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/legacy/styles/harbour-ui.css
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/legacy/styles/features.css
R:/University/Team Harbour Project/harbour-v2/harbour-v2/src/legacy/pages/Dashboard.jsx
```

### Artwork

```
R:/University/Team Harbour Project/harbour-v2/harbour-v2/art/harbour-hero-concept-01.png   ← raster source/reference (1200×900)
R:/University/Team Harbour Project/harbour-v2/harbour-v2/art/harbour-hero-concept-01.svg   ← active hero artwork; includes reduced-motion-aware animation
R:/University/Team Harbour Project/harbour-v2/harbour-v2/art/harbour-scene-01.png
R:/University/Team Harbour Project/harbour-v2/harbour-v2/art/harbour-scene-01.svg
R:/University/Team Harbour Project/harbour-v2/harbour-v2/public/art/
R:/University/Team Harbour Project/harbour-v2/harbour-v2/inspiration/                     ← 8 mp4 + 9 webp references
```

### Gates, tests and screenshots

```
R:/University/Team Harbour Project/harbour-v2/harbour-v2/scripts/solve-aurora-cap.mjs
R:/University/Team Harbour Project/harbour-v2/harbour-v2/scripts/shots.mjs
R:/University/Team Harbour Project/harbour-v2/harbour-v2/stylelint.config.mjs
R:/University/Team Harbour Project/harbour-v2/harbour-v2/eslint.config.js
R:/University/Team Harbour Project/harbour-v2/harbour-v2/eslint-rules/
R:/University/Team Harbour Project/harbour-v2/harbour-v2/e2e/landing.spec.ts
R:/University/Team Harbour Project/harbour-v2/harbour-v2/e2e/landing-sections.spec.ts
R:/University/Team Harbour Project/harbour-v2/harbour-v2/playwright.config.ts
R:/University/Team Harbour Project/harbour-v2/harbour-v2/outputs/arrival-slice/           ← Slice 1 screenshots
```

---

## 7. Hard constraints — do not break these

**Tokens.** No raw hex / rgb / hsl outside `src/styles/tokens.css`. No `px`
except a 1px hairline. Spacing only from the ten spec steps
(`--space-1…10`); note the trap that spec `space-5` is Tailwind `p-6`.
ESLint and Stylelint enforce all of this and must stay at exit 0.

**Never.** A card inside a card. Glass on glass. More than three glass surfaces
on screen. `--border-strong` is the token for a border that is a surface's only
boundary.

**Preserve.** Routes and their guards, local-profile storage behaviour and keys,
honesty labels (`SIMULATION` / `DEMO` / `SAMPLE`), the safety rail, the four data
states (empty, loading, result, error), and every disclaimer. Do not invent APIs,
AI capabilities, live matching, real payments or statistics.

**Definition of done per slice.** Both themes · 360 / 390 / 768 / 1024 / 1440 ·
200% zoom and 200% text size · keyboard only · reduced motion · no horizontal
overflow · axe clean (serious/critical) · screenshots before moving on.

**Motion.** Animate `transform` and `opacity` only. Never delay or hide a
safety-critical action behind an entrance.

**If a spec value is missing, ask — do not invent it.**

## 8. Continuation update — 13 Oct 2026

The arrival-slice follow-up corrected the hero's excessive top gap and theme
scoping, switched the hero to the supplied animated SVG, and made the sticky
header apply a full-width frosted surface after scrolling. The mobile menu's
Radix sheet now paints above its backdrop and inherits the arrival theme,
including readable action text in dark and light modes. The new concept-art
loading treatment is a later slice; keep the current loading flow intact until
that work is scheduled.
