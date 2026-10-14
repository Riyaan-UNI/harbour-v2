# Harbour Rebuild — Progress

Source of truth: `docs/DESIGN_SPEC.md` (Harbour Design Spec v1, 11 Oct 2026 — the
canonical copy in this repo, updated in Brick 0 Part A) and
`docs/SPEC_ADDENDUM_1.md` (product alignment, 12 Oct 2026).
Package manager: **npm**. Scaffold: Vite 7 + React 18.3.1 + TypeScript 5.9 strict.
Branches: `brick-0-foundation`, `brick-1-primitives`, `brick-2a-components`,
`brick-3-landing-top`, `brick-3b-polish` (all done). The full build — porting every old
feature onto the new design system — starts on **`brick-4-landing-sections`**; the audit,
the four user decisions and the B4–B13 plan are at the bottom of this file.

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

---

## The full build — audit, decisions and plan

**Status: PLAN APPROVED (12 Oct 2026). Brick 4 starts next.** The master prompt at
`docs/full-build-prompt.md` was run end to end: the old build was audited from its code,
the inventory below was verified against it, four decisions were put to the user in plain
English and answered, and the B4–B13 plan was approved. This section is the record.

### Decisions (the user's picks)

| Topic | Decision | Consequence |
| --- | --- | --- |
| Backend | **Hybrid** | Offline rule engines everywhere (ported from the old build's deterministic code), plus **one live AI feature** — Ask Harbour — added behind a pluggable answer source when a server exists. Provider and API key are confirmed with the user at that brick (old build: Google Gemini first, Groq backup). Every data screen still ships the four states (empty / loading / result / error). |
| Loading screen | **Storm settling into calm** | New screen: the WaveLine settles choppy → calm beside the Harbour mark, ≤1.6s, reduced-motion = static calm frame, skippable, theme pre-applied. Concept re-sketch and re-confirm before building (Brick 6). The old build's arrival/portal animation stays banned. |
| Old extras | **Leave them out** | Bunny garden, prototype-notes modal, `/profile/:userId` as its own route: not rebuilt (the sample profile view folds into People at Brick 13). |
| Hero art | **Art near the end** | The honest `ArtSlot` placeholder stays through the build; the reimagined harbour-terrace concept lands in the final polish. Ask before generating any art. |

### The audit — old Harbour, verified from code (never trusted blindly)

Old app root: `Harbour-oldbuild/Harbour/harbour/` (React 18 plain JSX, react-router 6;
Express server on port 5000, proxied by the old Vite dev server). Old build is read-only:
functionality carries over, its visuals, bunny, garden and portal never do.

| Old route | What it does (verified) | New route | What must change |
| --- | --- | --- | --- |
| `/` Welcome | Marketing landing; reads a local profile; prototype-notes modal | `/` | Rebuilt in the new language. Hero/nav/footer done (Bricks 3–3b); sections below hero = Brick 4 |
| `/login` | "Continue as {name}" against a device-local profile; no accounts | `/login` | Picker + honesty line ("no real accounts in this prototype"); both profile-found and profile-absent states; AppGuard sends `/app*` here |
| `/onboarding` | One form: name, country, university, optional socials | `/signup` | Three steps (nickname + privacy line; country; optional university with Other/skip). Socials move to Profile edit. Route-home completion scene per Design §7 Scene B (abstract marker → destination node) |
| `/home` | Greeting, live weather (Open-Meteo), 4 tool cards, 7-day recharts chart, previews, emergency cards | `/app` | App shell; safety rail always reachable; weather with loading/success/retry and graceful offline hide; preview strip labelled |
| `/shield` | **Scam X-ray** (paste ≤8000 chars, client+server redaction, AI analyse with keyword fallback) + **Scam Drill** (4 scenarios × 4 turns × 3 options, resilience score, bands) | `/app/scam` | Tabs; deterministic keyword screen ported and labelled "basic keyword check"; redaction shown via RedactionNotice; result offers a checklist follow-up |
| `/rental` | **Listing check** (9 regex flag rules, red/amber/green), **Lease X-ray** (12 clause rules, .txt upload ≤1MB), **first-hour playbook** (6 steps) | `/app/rental` | Three tabs; rules ported verbatim incl. verify links and disclaimers; licence/land adapters stay honest mocks ("could not verify") |
| `/translate` | **Translate** (Baidu yue, Web Speech listen zh-HK, 12-phrase offline bank) + **Counter card** (6 canned bilingual scenarios, 25-term glossary, card travels as a base64url URL fragment — the server stores nothing) | `/app/helper` | Phrase bank primary (human-checked copy beats machine output for learners); live translation only when a server exists, behind ErrorState + offline alternative; fragment share and print kept |
| `/checklist` | Country-aware list (5 groups; "mainland" is CN-only), localStorage persistence, daily progress history, custom lists, confetti, offline fallback | `/app/checklist` | Ported; history writer feeds the Home chart; receives the X-ray follow-up handoff |
| `/chat` | Single-turn Q&A, 3 suggestion chips, offline fallback links | `/app/ask` | Chips + labelled guidance answers + offline links; live AI path behind the same interface (hybrid decision) |
| `/dashboard` | Metric tiles (checklist steps / tide points / friends), 7-day bar chart, friends pills, ImpactPanel (4 counters, SDG 10/11/16, min display 5) | `/app/dashboard` | Impact panel labelled DEMO until a real source; sub-threshold counts hidden, not small |
| `/profile` | Edit name/country/university, photo ≤1.5MB data URL, socials, friends, log out of device | `/app/profile` | Same, under the new shell; logout clears all `harbour:v1:*` keys |
| `/people` | 4 hardcoded sample profiles + friends (localStorage) | `/app/people` | SAMPLE labels; no live-matching claims (the old "12 students nearby" card is sample copy, labelled) |
| `/community` | 3 hardcoded sample events, type filter, in-memory save | `/app/community` | SAMPLE labels; filter and saved events persist locally |
| `/tide-bank` | Simulated credits, session ledger, localStorage balance | `/app/tide-bank` | DEMO; balance masked by default; "no monetary value" copy |
| `/voice-sos` | Click mockup: listening → connected, fictional volunteer modal, tel:999 | `/app/voice-sos` | SIMULATION + a **failed state** (addendum §3 requires one) + 999 always shown |
| `/bunny-garden` | Decorative breather | — | Dropped (user decision) |
| Server (`server/**`) | Gemini → Groq → Baidu behind `MOCK_AI`; deterministic services (drill bank, rental rules, counter-card scripts, checklist data, playbook, glossary); in-memory drill sessions + impact counters; rate limits; server-side redaction | — | Deterministic logic ports to front-end engines (below); redaction becomes client-side and *shown* (addendum rule 5); live AI only for Ask Harbour, later |

Old-build facts worth remembering: safety numbers live in `client/src/pages/Home.jsx`
(999 / 18222 / 2824 6111) and `server/data/services.json` (+2300 6555) — all unverified.
Cantonese copy: `client/src/data/essentialCantonesePhrases.js`,
`server/services/counterCardService.js`, `server/data/glossary.json` — all need a
native-speaker check. The arrival transition is PROTECTED and banned.

### Data layer — backend-agnostic (built inside each brick, not before)

Pure engines under `src/lib/features/`, each returning the shape a future server route
would return, so a server can be swapped in without touching screens or tests: `redact.ts`,
`scam/keywordScreen.ts`, `scam/drillBank.ts`, `rental/listingRules.ts`,
`rental/leaseRules.ts`, `rental/playbookData.ts`, `helper/phraseBank.ts`,
`helper/counterCard.ts`, `helper/glossary.ts`, `checklist/checklistData.ts`,
`checklist/history.ts`, `ask/knowledge.ts`, `people/sampleProfiles.ts`, `community/events.ts`,
`tide/balance.ts`, `voice/script.ts`, plus `src/lib/countries.ts` (the HK/Macao/Taiwan
override in ONE module + a unit test — addendum rule 10).

Storage: `harbour:v1:profiles`, `harbour:v1:activeProfileId`, `harbour:theme` stay exactly
as specced (format changes only with the user's OK). New: `harbour:v1:checklist`,
`harbour:v1:checklist-lists`, `harbour:v1:progress-history`, `harbour:v1:tide-balance`.

### The brick plan

| Brick | Branch | Scope |
| --- | --- | --- |
| 4 | `brick-4-landing-sections` | Landing sections below the hero: four tools (bento, varied spans, SAMPLE outputs), problem cards, live demo (DEMO), practice teaser, preview strip (Voice SOS SIMULATION / Tide Bank DEMO / Community SAMPLE), rental band, how it works, trust band, final call. Creates the reserved ids `#tools`, `#how-it-works`, `#trust`. New component: **ProgressRing** |
| 5 | `brick-5-profiles-auth` | Profile store (zod, contexts replacing the `useSavedProfile` stub, storage-blocked fallback), `/login`, `/signup` (3 steps + Route-home scene), `src/lib/countries.ts` + unit test. New components: **Combobox, CountryCombobox**. Deps: zod, i18n-iso-countries, vitest |
| 6 | `brick-6-loading` | The new loading screen (concept re-confirmed first), once per cold boot, handoff `/app` or `/`, reduced-motion static, skippable, axe-clean, zero new bundle weight |
| 7 | `brick-7-app-shell-home` | AppShell (Ask Harbour button everywhere, theme toggle, profile menu), bottom tabs + More sheet, AppGuard, Home (greeting, weather 4 states, tool cards, 7-day chart, preview strip, safety rail). New component: **Dialog**. Dep: recharts (lazy) |
| 8 | `brick-8-checklist` | Settle-in list: country-aware data port, persistence, custom lists, celebration, history writer. New component: **ProgressBar** |
| 9 | `brick-9-scam-shield` | Scam Shield: X-ray + Drill tabs, client-side redaction, keyword fallback labelled, checklist handoff. New component: **Tabs** (reused by 10/11) |
| 10 | `brick-10-helper-ask` | Cantonese helper (Translate + Counter card) and Ask Harbour (chips, guidance answers, offline fallback; live AI path confirmed with the user here) |
| 11 | `brick-11-rental-shield` | Rental Shield: three tabs, rule engines ported verbatim, disclaimers, internal handoffs |
| 12 | `brick-12-dashboard-profile` | Dashboard (metrics, chart reuse, DEMO impact panel) and Profile (edit, photo, friends, logout of device) |
| 13 | `brick-13-sample-pages` | People / Community / Tide Bank / Voice SOS (all permanently badged; Voice SOS failed state + 999), the Design §13 audit pass, then the hero art |

Order follows the addendum's proposed order with auth and the shell pulled forward as hard
dependencies. Tabs/Combobox/Dialog/ProgressRing/ProgressBar land with their first consumer,
never speculatively. Each brick: branch off the previous, small commits with explicit paths,
the full definition of done, PROGRESS.md + the daily memory log updated, a report with
screenshots, and the user's go-ahead before the next brick.

### Standing flags (until resolved — not blockers to building)

- **Emergency numbers unverified**: 999 / 18222 / 2824 6111 / Hospital Authority 2300 6555 stay behind the UNVERIFIED marker; an official-source check is required before shipping.
- **All Cantonese strings + jyutping** need a native-speaker check before release.
- **Loading-screen concept** approved in shape only — re-sketch at Brick 6.
- **Weather endpoint** (HKO vs Open-Meteo): verify before wiring in Brick 7.
- **Live AI**: provider + key settled at Brick 10.
- **Taiwan flag**: no glyph per addendum §9 (HK/Macao SAR flags allowed) — revisit if the team decides otherwise.
- **Bundle budget**: main chunk ≤250 kB gzip; recharts and the CJK font ride their routes, not the landing chunk.

---

## Brick 9 — Scam Shield at `/app/scam`

**Status:** built on `brick-9-scam-shield`. The v2 rebuild of the old build's Shield
page, presented in the structure the owner approved from a fraud-detection
reference: hero → the tool behind two tabs (Scam X-ray, Scam Drill) → a
SAMPLE-labelled example read → "if it already happened" → a calm final call.
The reference's logo strip and testimonials are **absent on purpose** —
inventing customers or praise is banned, and the space went to the recovery
steps instead.

### What landed

- **Engines (ported verbatim, unit-tested).** `src/lib/features/redact.ts`
  (the old Shield page's client-side hiding: email, HK phone, HKID, 13–19-digit
  card, one-time-code labels), `src/lib/features/scam/keywordScreen.ts` (the
  server's deterministic fallback — four indicator groups, High/Medium/Low),
  `src/lib/features/scam/drillBank.ts` (all four pre-authored scenarios, the
  score bands and the debrief strings), plus `sample.ts` and `types.ts`.
  27 vitest cases pin the ports, including the legacy regex's real quirks
  (a stray `)` after an HKID with a check digit; the phone alternative eating
  a spaced card's first eight digits) — pinned, not "fixed".
- **New component: `Tabs`** (`src/components/ui/tabs.tsx` + `tabs-variants.ts`),
  Brick 2b's first consumer. Hand-rolled, no dependency: roving tabindex,
  Arrow/Home/End with wrap and automatic activation, `aria-selected` /
  `aria-controls` / `aria-labelledby` from `useId`, panels kept mounted
  (hidden) so a drill or a half-typed message survives a switch.
- **The page** (`src/routes/app/ScamShield.tsx` + `src/components/app/scam/`):
  `XrayPanel` (four states, redaction shown through `RedactionNotice`, the
  checklist handoff), `SampleRead` (the old build's fictional `hxxps://`
  message run through the real engine → honestly Medium, not the marketing
  mock's "High"), `DrillPanel` + `useDrillSession`, `RecoverySection`
  (four steps, `SafetyRail`, `Disclaimer`), `FinalCall`, and
  `ScamXrayScene` — original hand-drawn artwork (see below).
- **Its own CSS lane** `src/styles/scam-shield.css` (unlayered, imported last
  like `dashboard.css`, BEM under `.scam-shield`, zero legacy class names).
- **Route + addresses.** `/app/scam` is lazy with its own skeleton; AppShell's
  "Scam X-ray" link, the mobile tab, `TITLES`, the v2 dashboard card
  (`AppHome.tsx`), `DashboardRail.tsx` and `scripts/flow-check.mjs` all point
  at it.

### Deviations (all deliberate)

1. **The legacy `/app/shield` route is removed, not kept as deprecated** (the
   approved plan said keep it mounted). The owner asked for one address for
   the tool; two routes meant two UIs for the same thing. `Shield.jsx` stays
   on disk as the port source and is now unreferenced.
2. **The shell's catch-all was looping.** `<Navigate to="home">` inside the
   `/app/*` splat resolved relatively, so an unknown subpath walked to
   `/app/scam/home/home` instead of `/app/home`. It is now absolute
   (`to="/app/home"`) — the loop was a shell bug for *any* unmatched
   `/app/...`, not just this one.
3. **`keywordScreen`'s explanation drops the old "Automated AI review is
   unavailable" clause.** There is no AI path behind this tool any more;
   claiming one, even in a negation, is the dishonesty the addendum bans.
4. **The X-ray has no artificial latency.** The screen is local and instant,
   so `reading` stays in the state machine (and renders a skeleton) but is not
   faked with a timeout — INSPIRATION.md's rule about not implying a service
   is working when the feature is local.
5. **The drill has no error or loading state.** Scenarios are local; the
   four-state rule (addendum rule 1) is satisfied by the X-ray, the data
   screen. A reload mid-drill drops to idle, which the spec pins.
6. **Shell contrast fix (found by the first `/app` axe pass).** `.harbour-tabs`
   had a hard-coded ivory background (`rgba(255, 253, 247, 0.94)`) that never
   re-themed: in dark mode its pale labels sat at **1.6:1**. Now
   `color-mix(in srgb, var(--bg-elevated) 94%, transparent)`. This is the
   ported shell's own defect, exposed because no spec had ever scanned `/app`
   in dark mode below 1024px — worth re-checking the other legacy chrome.
7. **`vitest` 5.0.4 added** (exact pin, node environment, `npm test`). It was
   on the Brick 5 dependency list and had never been installed.
8. **Artwork is drawn, not generated.** `ScamXrayScene` is an original SVG —
   a message card under a lens, three signal dots, a slow sweep inside the
   lens and the Harbour wave at its centre. Token colours, `aria-hidden`
   decoration, transform/opacity only, static under reduced motion and calm
   mode. The standing "ask before generating any art" decision was not
   triggered; if a generated asset is wanted later, that is a separate call.
9. **Dashboard gets a contained ambient scene layer — 14 Oct 2026,
   user-approved.** `docs/DASHBOARD_DESIGN_SPEC.md` §7 item 9 read "continuous
   parallax … one-shot reveals only". The user approved relaxing that for a
   single, contained, purely decorative backdrop on `/app/dashboard`
   (`DashboardScene.tsx` + `.dash-scene` in `dashboard.css`): a low-opacity
   harbour wash plus 4–6 drifting elements (three mascots — `seahorse`, `crab`,
   `pufferfish` — none shared with `PeopleScene`; three abstract shapes — buoy,
   rings, wave). Same proven pattern as `/app/home` and `/app/people`. Motion
   is CSS `@keyframes` on transform/opacity only, inside one
   `no-preference` block additionally scoped to `:root:not([data-calm='true'])`,
   so reduced motion **and** calm mode render an identical still frame. No JS,
   no pointer handler, no rAF loop; the layer is `aria-hidden`,
   `pointer-events: none`, `z-index: -1` in the page's isolated context, and
   `overflow: hidden`, so it can never touch a pointer or add a scrollbar.
   Noise tints reuse the §3 `--chart-N` tokens (one per element) and the
   off-scale percentage insets are `--drifter-dash-*` tokens in `tokens.css`
   (the `--drifter-*` family Stylelint already permits in `inset-*`). Spec §2,
   §6 (new §6.4) and §7 item 9 were amended to record it; scroll hijacking and
   auto-advancing carousels stay banned. `/app/home`, `/app/people` and every
   other page are untouched.

### Gate results

- `typecheck` — clean (both tsconfigs).
- `npm test` (vitest) — **27/27**.
- `lint:css` — `scam-shield.css` clean; the harbour-tabs edit passes too.
  (Pre-existing failures remain in `entry-story.css` / `translate.css`, owned
  by the concurrent rebuild work.)
- `lint` — my files clean.
- `build` — passes (needs `CODEBUDDY_SAFE_DELETE_ENABLED=0` on this drive).
- `test:e2e` — `e2e/scam-shield.spec.ts` **20/20**: 12 matrix runs
  (dark + light × 320/360/390/768/1024/1440, no horizontal overflow, axe
  clean), the tabs' keyboard pattern, the X-ray read with its redaction count,
  the SAMPLE panel's unclickable `hxxps://`, a full drill to debrief, the
  reload-resets case, the recovery section, and reduced motion. The first e2e
  to enter the guarded app lane: it seeds `harbour-profile` (the legacy key
  the guard reads) through `addInitScript`.

### Still open

- Emergency numbers are on this page (recovery copy, `SafetyRail`, the X-ray's
  support line) behind the same standing UNVERIFIED flag as everywhere else.
- The X-ray's Scameter+ link was ported from the old build and has not been
  checked against the live ADCC page.
- The drill debrief references the checklist handoff; `/app/checklist` is
  still the ported legacy page at this point.
