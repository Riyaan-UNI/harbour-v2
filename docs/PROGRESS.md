# Harbour Rebuild — Progress

Source of truth: `docs/DESIGN_SPEC.md` (Harbour Design Spec v1, 11 Oct 2026 — the
canonical copy in this repo, updated in Brick 0 Part A) and
`docs/SPEC_ADDENDUM_1.md` (product alignment, 12 Oct 2026).
Package manager: **npm**. Scaffold: Vite 7 + React 18.3.1 + TypeScript 5.9 strict.
Branches: `brick-0-foundation`, `brick-1-primitives`, `brick-2a-components` (all done),
**`brick-3-landing-top`** (current).

---

## Bricks 0 to 2a, in short

**Brick 0 — tokens, theme engine, fonts, aurora, gallery.** `src/styles/tokens.css`
holds every spec §3–§7 token plus the `@theme` bridge that turns them into Tailwind
utilities; `src/theme/theme.ts` resolves the mode from a raw string under
`harbour:theme`, writes `data-theme` + `color-scheme` on `<html>`, keeps
`meta[name=theme-color]` in step, and switches through the View Transitions API.
Fontsource variable fonts ship with measured metric-adjusted fallbacks; the aurora is
three blurred blobs with noise and a masked 1px grid. Full detail in commit `975248f`.

**Brick 0 Part A — review follow-ups.** Radii renamed to sm/md/lg; the spacing trap
closed by two gates (an ESLint rule for off-scale Tailwind steps, a Stylelint rule for
spacing declarations); the CJK font deferred to Brick 5 with a measured CSS saving of
145.02 → 30.75 kB; the contrast script widened to every text token × every surface,
which found eight failing pairs and forced both the dark aurora cap and `--text-subtle`
to move. Commit `d2520c1`.

**Brick 1 — layout primitives.** `src/components/layout/`: Container, Section, Stack,
Cluster, Grid, Bento + BentoItem, Heading, Text, VisuallyHidden and Cq, all
polymorphic and ref-forwarding, with spacing props typed to the ten spec §6 steps.
Commit `46dfd0b`.

**Brick 2a — simple shared components.** The shadcn/ui bridge (`src/styles/shadcn.css`
aliases every shadcn variable onto a Harbour token and never touches the radius
namespace), then 17 components: Button, Input, Textarea, FormField, Card, Chip,
StatusBadge, DemoBadge, Disclaimer, Skeleton, EmptyState, ErrorState, Toast, Avatar,
UniversityLogo, SafetyRail, RedactionNotice. The contrast script gained the component
pairs (text on fill, focus ring, sole-boundary border, the chart palette). Commits
`5d71453`, `f76ec94`, `dc7c463`.

Three decisions from those bricks still shape everything below: **`--border-strong`**
is the token for a border that is a surface's only boundary; **glass is capped at three
surfaces on screen**; and **every cap is solved by `scripts/solve-aurora-cap.mjs`,
never chosen**.

---

## Brick 3 — the landing page top

**Status: COMPLETE. All gates green.** Branch **`brick-3-landing-top`** off
`brick-2a-components`. Three commits: **Part A** (review fixes), **Part B** (the
interactive card), **Part C** (the landing page).

Scope was Part A's four fixes, then the interactive-card effects moved here from
Brick 2b, then the top of the real landing page at `/`. Signup, login, the app shell
and every landing section below the hero are **not** in this brick — those are Bricks
4 and 5.

### Part A — icons, logos, code-splitting

**A1 — icons move to `lucide-react` (1.55.0, pinned).** `src/components/ui/icons.tsx`
keeps every export name, so no call site moved. The wrapper enforces three things a
caller could otherwise get wrong:

- **Sizes stay on the rem scale.** Only `className` sets a size and the default is
  `size-4`. lucide's own `size` prop is in px, so it is deliberately not exposed —
  `size={18}` is a type error rather than an off-scale value.
- **Every icon is `aria-hidden` by default**, because an icon here is decoration
  beside a label, never the only carrier of meaning.
- **One stroke weight.** lucide draws on a 24-unit grid, so 1.75 is 7.3% of the box —
  against 7.8% for the hand-drawn 16-unit 1.25 strokes. Nothing got heavier.

Two consumer types widened from `(props) => JSX.Element` to `ComponentType`, and
`createIcon` joins `createPolymorphicComponent` in the react-refresh rule's
`extraHOCs`, so the suite stays at **0 problems**.

This is a **deviation from spec §2**, which lists no icon library. Requested in review.

**A2 — a typed university manifest, and eight missing files.**

`src/components/ui/university-logos.ts` is spec §10's table as data: nine ids, names,
acronyms and the canonical `/logos/<id>.svg` paths. `UniversityLogo` resolves through
it with an `id` prop; the explicit `src`/`name`/`acronym` form is kept for a one-off
box. A third fallback covers an entry with no acronym — `other` shows a generic
graduation-cap mark, sized in container units beside the existing acronym fallback.

**REPORTED, NOT FIXED — no university logo file exists anywhere in the repo.**

| Searched | Found |
| --- | --- |
| `public/` | `favicon.svg`, `harbour-logo.svg`, `harbour-mark.svg` — the three Harbour brand marks, nothing else |
| `src/assets/` | does not exist |
| the previous build's `Harbour/harbour/client/public/` | the same three Harbour files, plus `hong-kong-harbour.png` |
| the whole workspace | no file matching any of hku / cuhk / hkust / polyu / cityu / hkbu / lingnan / eduhk |

So **all eight** of `hku, cuhk, hkust, polyu, cityu, hkbu, lingnan, eduhk` are missing,
every manifest path currently 404s, and every box falls back to its acronym — by
design, not by accident. Dropping a file at the manifest path is the only change
needed; nothing has to move. No logo was drawn, recoloured, cropped or hotlinked.

The three Harbour brand marks are at `public/harbour-logo.svg`, `public/harbour-mark.svg`
and `public/favicon.svg`. **They are untracked and unused.** They are light-background
lockups — the `#0B3935` wordmark is unreadable on the dark theme's `#061B1A`, and the
SVGs carry hard `width`/`height` so they will not scale — so the nav's wordmark is set
in the heading face instead. Whoever wires them up needs a dark variant first.

**A3 — the dev pages leave the production bundle.** The three `/dev/*` routes are
`lazy` behind the existing dev flag.

| | Before | After |
| --- | --- | --- |
| main JS | 299.15 kB (gzip 94.05) | **269.35 kB (gzip 86.71)** |
| CSS | 39.10 kB (gzip 8.81) | 39.25 kB (gzip 8.84) |
| extra chunks | — | Gallery 7.91, Primitives 10.02, Components 19.03, ThemeToggle 2.23 |

The main chunk fell even though lucide joined the graph: the icons are tree-shaken and
three routes' worth of components left. `Toaster` also moved from the components page
to `App`, so the app has exactly one live region rather than two.

**A4 — the SafetyRail numbers stay UNVERIFIED.** Untouched, as asked.

### Part B — the interactive card, complete

Spec §8's four behaviours, in `src/components/ui/interactive-card.tsx`, with the parts
that cannot be a utility in `ui.css`.

1. **Pointer spotlight.** `--mx` / `--my` are written in a rAF-throttled `pointermove`,
   so a burst of events costs one style write per frame rather than one per event.
2. **Tilt, capped at `--tilt-max`.** `data-tilt` is set from a media query only while
   `(hover: hover) and (pointer: fine)` matches **and** motion is allowed, so a touch
   device and a reduced-motion user never get the 3D transform. `perspective()` only
   appears once `data-tilt` is set, so a card with no tilt is not promoted to its own
   layer and its text stays crisp.
3. **Expand in place.** Supplying `details` makes the card expandable. The trigger is a
   real `<button>` filling the card, so a tap expands it and nothing depends on hover;
   the panel is a Radix dialog, which brings the focus trap, `Esc`, the scroll lock and
   the focus restore. Motion's `layoutId` is what makes it read as the same card
   growing rather than a second one appearing.
4. **Focus mirrors hover.** The lift, the border and the spotlight are on `:hover` and
   `:focus-within` alike.

**The pointer handlers sit on an untransformed wrapper, not on the card.** This is the
one non-obvious decision in the brick. The card lifts 4px and rotates, so its own box
moves under the pointer; a pointer a few pixels inside an edge falls outside the card
the moment it tilts, which fires `pointerleave`, which levels the card, which puts the
pointer back inside — a flicker at the edges. An instrumented run reproduced it at 2%
inset. The wrapper is never transformed, so its hit area is stable, and because the card
is its descendant, `:hover` on the wrapper survives the lift. The spotlight is measured
from the wrapper for the same reason: measuring a moving box would make it crawl.

### Part C — the landing page top

**Routing.** `/` is the landing page. An unknown path redirects to it; signup, login and
the app shell arrive in Bricks 5 to 9. The dev routes still win in development because
they are declared first and match exactly.

**Structure.** A skip link, then `header` → `nav[aria-label="Main"]`, `main`, `footer`.
**One `h1`**, on the hero headline; the nav and the footer carry no headings, because
their landmarks are named with `aria-label` instead.

**`LandingNav`.** A sticky glass bar. The stickiness is on the `<header>` and the glass
is on the `<nav>`: a sticky element only sticks within its parent, and the header is what
spans the page, while the nav is the surface that meets the viewport edges. `.glass--bar`
is the shared glass recipe with the radius and the inset highlight taken off. Below 48em
the link row collapses into a `Sheet` of 2.75rem rows.

**`Sheet`.** Radix Dialog underneath — the focus trap, `Esc`, the scroll lock and the
backdrop come with it. The slide and the fade are CSS keyframes keyed off the `data-state`
Radix sets, so no animation library is involved and the global reduced-motion rule turns
them into instant state changes for free. It lives in `src/components/ui/` rather than the
landing folder because Brick 5's country picker wants it too.

One thing it needed that shadcn's does not have: **`returnFocusTo`.** Radix hands focus
back to the `Dialog.Trigger`, and this sheet has none — the control that opens it lives in
the page's own markup, not inside the dialog — so focus would fall to `<body>`. The caller
passes its trigger's ref instead. Without it the sheet still opens and closes correctly;
the only thing lost is where the keyboard lands afterwards, which for a keyboard user is
the whole point.

**`Hero`.** The colour bargain is the reason for the shape of the markup.

**`WaveLine` — Scene A, hero variant.** One SVG, `viewBox 0 0 1200 400`,
`preserveAspectRatio: none`, `vector-effect: non-scaling-stroke` with a 0.125rem stroke,
so the line stays 2px however far the viewBox is stretched. The path is 96 points; `y` is
a base line plus the amplitude `A` times three sine waves plus a little deterministic
noise, and **`A` is the only animated value**. It is tweened with GSAP and redrawn in the
GSAP ticker, which is removed from the ticker entirely while the line is offscreen or the
tab is hidden (`data-paused` says which). The gradient's two stops are read from
`--accent-text` and `--gold-text` and re-read on `harbour:themechange`.

The easing is the spec's own `cubic-bezier(0.22, 1, 0.36, 1)`, built with **CustomEase**.
GSAP ships every plugin free since 3.13, so the spec's curve is used rather than the
nearest built-in.

**`ArtSlot`.** The box the concept art will live in: an aspect-ratio box taking either a
`src` or inline SVG, with `alt` required whenever `src` is given, and `priority` deciding
eager versus lazy. Empty, it is a token gradient plus the shared grain and it says "Art
slot" on screen, so a reviewer never has to guess whether a blank box is a bug.

**Lenis.** Landing page only, off entirely under `prefers-reduced-motion`, destroyed on
unmount. Its four documented root properties live in `src/styles/landing.css`.

**`useSavedProfile`.** Returns `null` — Brick 6 adds the real store — so `/` renders the
new-visitor call to action. It is a hook rather than a constant so the one place the CTA
block reads from is already the right shape, and so `/dev/components` can render both
states without a store to fake.

### The hero patch: the 3:1 allowance, actually spent

This is the one part of Brick 3 where a spec rule was deliberately leaned on rather than
worked around, so it is worth writing out.

The hero has its own contained aurora patch, and it is allowed to run **much** hotter than
either existing cap because it is a different bargain:

| Surface | Dark | Light | What it is |
| --- | --- | --- | --- |
| `--aurora-blob-opacity` | 0.18 | 1 | the page aurora; bare text can land anywhere on it |
| `--aurora-patch-opacity` | 0.29 | 1 | the gallery's glass-section patch |
| **`--aurora-hero-opacity`** | **0.59** | **1** | the hero patch |

The hero patch is safe at 0.59 because **the only text on the bare patch is the display
headline**, and the headline is 44px at its smallest, so the 3:1 large-text allowance
covers it — measured at **3.94:1**. Everything else in the hero — the eyebrow, the
subhead, the buttons — sits on the copy panel's glass over the patch, where 4.5:1 applies.
The eyebrow could never sit bare: at 0.75rem it is small text.

So Brick 3 is the first place the allowance is actually spent. `scripts/solve-aurora-cap.mjs`
now carries a fourth solver, `solveHeroCap`, which requires **both** rules at once — the
bare headline at 3:1 and the four hero tokens on glass at 4.5:1 — and reports 0.59 in dark
and 1 in light. The glass rule binds first; the headline is the reason the cap is allowed
to be that high, not the reason it stops.

Two new script surfaces came with it: **`hero`** (bare, held to `--text` alone) and
**`glass/hero`** (held to the four tokens the hero carries). A third, **`art/plate`**,
covers the empty art slot's placeholder gradient at its peak tint.

**If the hero ever reads as too much**, the fix is one token. The script only fails when a
token *exceeds* its solved ceiling, so any value at or below 0.59 is legal and gated —
`0.40`, for instance, would put the headline at roughly 5.3:1.

### Deviations and decisions — Brick 3

| # | Spec / addendum says | We do | Why |
| --- | --- | --- | --- |
| 30 | §2 lists no icon library | `lucide-react` behind the same wrapper API | Requested in review. The wrapper keeps lucide's px `size` prop out of reach. |
| 31 | — | `createIcon` added to the react-refresh `extraHOCs` | The rule cannot see through a factory, so all twelve icons were reported as non-component exports. |
| 32 | §8: "at most three glass surfaces on screen" | the hero's patch carries one glass copy panel; the nav's bar is another | Two, with the footer's `ThemeToggle` and `Sheet` never on screen at the same time as both. |
| 33 | §6: "sticky glass top bar" | stickiness on the `<header>`, glass on the `<nav>` | A sticky element only sticks within its parent, so the sticky box has to be the one that spans the page. |
| 34 | §8's Sheet, via shadcn | hand-written on `@radix-ui/react-dialog` | Same primitive shadcn's Sheet uses. Needed a `returnFocusTo` prop shadcn's does not have. |
| 35 | §7: GSAP with ScrollTrigger, SplitText, DrawSVG, MotionPath | GSAP core + CustomEase only | Nothing in Brick 3 scroll-triggers or draws SVG. `ScrollTrigger` and the rest arrive with the sections that need them. |
| 36 | §7 names the ease but no GSAP plugin | CustomEase | GSAP ships all plugins free since 3.13, so the spec's exact curve is used instead of the nearest built-in. |
| 37 | §10: profile store in Brick 6 | `useSavedProfile` stub returning `null` | The landing needs the CTA's shape now; the store is Brick 6. |
| 38 | — | `--tilt-max`, `--tilt-perspective`, `--spotlight-alpha`, `--overlay-alpha`, `--art-tint-alpha` | Five values the components need that the spec does not name. Each is read by the contrast script or by the component, so none is a number written twice. |
| 39 | §12: Playwright matrix | `outputDir` moved to the system temp directory | The workspace is on the mapped `R:` drive, where Playwright's pre-run cleanup goes through the OS trash and fails past a few hundred files. |
| 40 | — | `glass--bar` modifier | The shared `.glass` recipe forces `--radius-lg`; a bar that meets the viewport edges needs it off. Declared after `.glass` so it wins on source order, not specificity. |

### Token changes — Brick 3

| Token | Theme | Before | After | Commit |
| --- | --- | --- | --- | --- |
| `--spotlight-alpha` | both | *did not exist* | `12%` | B |
| `--overlay-alpha` | both | *did not exist* | `80%` | B |
| `--tilt-max` | both | *did not exist* | `6deg` | B |
| `--tilt-perspective` | both | *did not exist* | `60rem` | B |
| `--aurora-hero-opacity` | dark | *did not exist* | `0.59` | C |
| `--aurora-hero-opacity` | light | *did not exist* | `1` | C |
| `--art-tint-alpha` | both | *did not exist* | `8%` | C |

No existing colour moved. The three older caps are unchanged and still sit at their solved
maxima (dark blob 0.18 / patch 0.29; light 1 / 1).

### The contrast script, after Brick 3

Twelve surfaces × seven text tokens × two themes = **168 text pairs**, plus the component
pairs, plus four solvers. Exit 0.

Two findings in Part B were acted on rather than excused:

- **The spotlight solver reaches 0.12 in dark and 0.18 in light.** One value serves both
  themes, so the token is 0.12. At the first draft of 0.18 the dark matrix failed on three
  tokens — text-muted 3.94, text-subtle 3.02, danger 3.20.
- **`--border-strong` on `glass/spot` is 2.19:1 in dark**, below the 3:1 the sole-boundary
  rule asks for. It is not a real case: `--border-strong` is the token for a border that is
  a surface's *only* boundary, the only component that uses it is the flat Card, and the
  flat Card has no spotlight — the spotlight belongs to the interactive glass variant. The
  surface carries `soleBoundary: false`, and the value is printed with a `~` so it stays
  visible.

Two surfaces also carry a narrowed token list. `glass/spot` and `glass/hero` are held to
the four tokens a card front or the hero can actually carry, because `text-subtle` on glass
over the patch sits at 4.55:1 — 0.05 of headroom — and holding either to it would need an
effect that does not exist. Those cells print with a `~`; only `!` fails, and `°` marks a
pair rescued by the 3:1 large-text allowance.

### Gates

| Gate | Command | Result |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | pass (both TS projects) |
| Lint | `npm run lint` | pass, 0 problems |
| Lint CSS | `npm run lint:css` | pass, 0 problems |
| Build | `npm run build` | pass — CSS 46.66 kB (gzip 10.17), main JS 425.54 kB (gzip 143.46) |
| E2E + axe | `npm run test:e2e` | **105/105 pass** — landing 29, components 25, primitives 27, gallery 24 |
| Contrast | `node scripts/solve-aurora-cap.mjs` | exit 0 — 168 text pairs, every component pair |

**The main JS grew from 269.35 to 414.44 kB (gzip 86.71 → 139.39)** because the landing
now pulls GSAP, Lenis and Radix Dialog into the initial graph. The spec's landing target is
"at or under 250 KB gzipped"; 139.39 kB is inside it, with the dev pages still in their own
chunks. `motion` is **not** in the main chunk — it is only in the `/dev/components` chunk,
because only that page renders an `InteractiveCard`.

---

## Brick 3b — polish: the lockup, the boxless hero, and the dev hub

**Status: COMPLETE. All gates green.** Branch **`brick-3b-polish`** off
`brick-3-landing-top`. Three commits: **Part A** (the Harbour lockup), **Part B**
(the boxless hero and motion), **Part C** (the dev hub).

### Part A — the Harbour lockup

**The original SVGs were archived, inspected, and replaced with token-mapped React
components.** `public/harbour-logo.svg`, `public/harbour-mark.svg` and `public/favicon.svg`
were light-background lockups with hard dimensions and baked colours. The originals are now
in `src/assets/brand/original/`; the public favicon was overwritten with a theme-aware
version using `prefers-color-scheme`.

`HarbourMark` inlines the mark geometry, keeps the `viewBox`, drops hard dimensions, and
maps every fill and stroke to semantic CSS custom properties. The sun is **not** the
original gold (`#F1C96F`) because it fails 3:1 on the dark theme's disc (1.01:1); the disc
must be `--accent-fill`, which forces the sun to `--on-accent`.

`HarbourLogo` has two variants: `live` (mark + live text in the heading face, chosen) and
`supplied` (the exact inlined lockup, for comparison). The live variant is chosen because
the supplied lockup uses Georgia serif while the product uses Bricolage Grotesque — two
voices in one bar. Three sizes (`sm/md/lg`), token-mapped, selectable and searchable.

Wired into `LandingNav` and `LandingFooter`; the contrast script gained two brand-mark
pair groups (disc on glass at 3:1, outer wave on disc at 3:1).

### Part B — the boxless hero

**B1 — headline text-wrap.** `text-wrap: balance` and `max-inline-size: 20ch` on the
display utility. At 1440px the headline breaks to two lines; the 20ch measure keeps the
second line from being a single short word.

**B2 — eyebrow above the h1.** The eyebrow (`role="label"`) now sits outside the copy
panel, directly above the `h1`, because the boxless hero has no panel boundary to put it
inside.

**B3 — boxless hero with mask-image falloff.** The glass copy panel is removed. The copy
column sits on the bare colour field at `--aurora-hero-copy-opacity` (0.28 in dark, 1 in
light), much lower than the art column's `--aurora-hero-opacity` (0.59). A `mask-image`
linear gradient fades the left edge of the hero patch into the page background. The
`--mask-fade-start` token holds the gradient's start opacity (derived from the two cap
ratios), keeping `rgba()` out of component CSS.

**B4 — WaveLine responsive geometry.** `ResizeObserver` (debounced to 150 ms) measures the
rendered width and derives `pointCount` (one per ~12 px) and `amplitudeBase` (15.5 % of
height) from the measured dimensions. The calm state looks consistent across viewport
widths; the `data-points` attribute lets tests assert the count matches the rendered width.

**B5 — GSAP SplitText headline reveal.** A sequenced timeline in `Hero.tsx`: SplitText on
lines (0.6 s, 0.08 s stagger, ease-out), then the CTAs fade up, then the WaveLine settles.
`useGSAP` handles cleanup; reduced motion shows the final state immediately via
`prefers-reduced-motion`. The `useReducedMotion` hook was added to `src/lib/useReducedMotion.ts`.

**B6 — footer deduplication.** The footer no longer duplicates content; a dev-only brick
label appears when `import.meta.env.DEV` is true.

### Part C — the dev hub

**`/dev` lists every route** from `src/routes/route-config.ts`, grouped as Production and
Dev, with descriptions and brick numbers. `ThemeToggle` is present. `vite.config.ts` sets
`server.open: '/dev'`. Every dev page header (`Gallery`, `Primitives`, `Components`)
gains a "Dev hub →" link. Added to the Playwright matrix as `e2e/dev-hub.spec.ts`.

### Token changes — Brick 3b

| Token | Theme | Before | After | Commit |
| --- | --- | --- | --- | --- |
| `--aurora-hero-copy-opacity` | dark | *did not exist* | `0.28` | B |
| `--aurora-hero-copy-opacity` | light | *did not exist* | `1` | B |
| `--mask-fade-start` | both | *did not exist* | `0.475` dark / `1` light | B |

The contrast script gained a fifth solver, `solveHeroCopyCap`, which holds the copy column's
text tokens (`text`, `text-muted`) against the bare colour field at 4.5:1. It reports 0.28
in dark and 1 in light.

### Gates — Brick 3b

| Gate | Command | Result |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | pass |
| Lint | `npm run lint` | pass, 0 problems |
| Lint CSS | `npm run lint:css` | pass, 0 problems |
| Build | `npm run build` | pass — CSS 46.66 kB (gzip 10.17), main JS 425.54 kB (gzip 143.46) |
| E2E + axe | `npm run test:e2e` | **117/117 pass** |
| Contrast | `node scripts/solve-aurora-cap.mjs` | exit 0 — 182 text pairs, every component pair |

The main JS grew slightly (425.54 kB) because `route-config.ts` is now in the initial
chunk and the hero imports `SplitText` and `useGSAP`. Still well under the 250 KB gzipped
target at 143.46 kB.

### A bug only the browser could find

`gsap/CustomEase` ships **a default export only**. `import { CustomEase } from
'gsap/CustomEase'` type-checks (the `.d.ts` declares the named binding) and yields
`undefined` at runtime — and because `CustomEase.create` runs at module scope, that took
the entire bundle down rather than one component. Every landing test failed with a blank
page; typecheck, lint and build were all green with the bug present. The fix is a default
import, and the reason is now a comment in `WaveLine.tsx`.

### Residual risk — Brick 3

- **The safety numbers are still unverified.** Three come from the old repo, one from the
  Government Telephone Directory. None has been confirmed, and a wrong emergency number is
  worse than no rail. They are now on the landing footer as well as every signed-in surface.
- **No university logo file exists.** Eight manifest paths 404 by design; the acronym
  fallback covers them. The dev page asserts that they fall back, and a second test stubs
  the eight paths to prove the wiring.
- **The dark hero sits at its solved ceiling.** 0.59 is the maximum the script allows, and
  the headline is at 3.94:1 — above the 3:1 large-text bar but not far above it. Lowering
  `--aurora-hero-opacity` is always safe; the script only fails on a value above the ceiling.
- **The nav's three anchors are dead ends.** `#tools`, `#how-it-works` and `#trust` are the
  ids Brick 4 creates. They are honest dead ends rather than wrong ones, and the hero's "See
  how it works" points at the same `#how-it-works`.
- **Lenis is not exercised under a real trackpad.** The tests scroll programmatically, which
  Lenis passes through. The smooth-wheel path is verified by hand, not by the suite.
- **`pointer: coarse` still cannot be tested here.** Playwright has no media emulation for
  pointer type, so the interactive card's tilt is asserted for the fine case and the
  no-tilt case is asserted only through the reduced-motion path.
- **The `ArtSlot` placeholder is doing the work of an illustration.** It is honest and
  clearly marked, but the hero's right column will not look finished until the art exists.
- **The three Harbour brand marks are untracked in `public/`.** They are light-background
  lockups with hard dimensions and are used nowhere.

### What Brick 4 needs

1. **The section ids are already reserved.** `#tools`, `#how-it-works` and `#trust` are what
   the nav and the hero's second button point at. Create those three sections and the links
   stop being dead ends.
2. **`InteractiveCard` is ready for the problem cards and the four tools.** It takes
   `title`, `description`, `children`, `details` and `footer`, and it is already tested for
   pointer, keyboard, touch and reduced motion. Bento it with varied spans — Addendum 1 §6
   rules out grids of identical cards.
3. **`DemoBadge`, `Chip` and `StatusBadge` are the honesty labels** the addendum's rule 2
   requires on every sample, simulation and degraded result.
4. **The WaveLine can loop.** The hero variant runs once by design; the login scene's
   breathing loop (`A` between 0.06 and 0.09 over 6s) is a different variant of the same
   component and belongs with Brick 5's login page.
5. **`AuroraPatch variant="hero"` is not the only patch.** If a Brick 4 band wants a colour
   field, use `variant="default"` — 0.29 in dark — unless it has the hero's exact bargain,
   in which case it needs its own surface in the contrast script.
6. **The section anchors need `scroll-margin`.** `Section` already applies
   `var(--section-scroll-margin)` (5rem), which clears the 4.25rem nav bar.
7. **Still open, and now on the landing page:** the safety numbers, the Cantonese strings
   for Brick 5, and whether the dark hero patch is too hot.
