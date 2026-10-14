# Harbour — Dashboard Design Spec

For the `/app/dashboard` rebuild · replaces `src/legacy/pages/Dashboard.jsx` · 12 Oct 2026
Status: ready for the builder. Companion to `docs/DESIGN_SPEC.md` (the single source of truth) and `docs/SPEC_ADDENDUM_1.md`.
Scope: the design system and measurement system only. No component code is written here.

> **Builder rule (repeat of `DESIGN_SPEC.md` §0, and it governs this file):** every value below is either an **existing token** named in `src/styles/tokens.css`, or a **new token proposed in §3 with a dark value, a light value and a named validator**. If a value is needed and is neither, the build stops and asks — it is not invented.
>
> **Correction to the brief.** The brief lists `--surface`/`--bg-elevated`. There is **no `--surface` token** in `tokens.css`. The real names are `--bg` (page) and `--bg-elevated` (menus, sheets, solid fallbacks). This document uses the real names only.

---

## 1. Visual direction

The dashboard carries over the two things the dark analytics reference (`INSPIRATION.md` §7, `nightmodedashbaord-insp.mp4`) and the two light references (`dashboard-inspwebp.webp`, `dashboardinp.webp`) actually do well — **information density in a bento grid** and **choreographed data reveal** (a range selector driving a real chart, a calendar heat grid beside it, an avatar stack, a persistent left icon rail) — while refusing every part of their framing. We keep the *density and the choreography*: metric cards that sit above a chart, a segmented range control that changes the plotted series, a heat grid that reads at a glance, and a compact rail that never moves. We **reject the financial framing**: no credit-card block, no balances-as-money, no `+12.8%` trend deltas, no "Total Balance $32,678.90", no revenue/engagement language, and no purple-as-primary or green financial palette — Harbour's signals stay teal (`--accent-fill`) and gold (`--gold-fill`), and violet (`--chart-5`) appears only as secondary activity. We **drop the dotted world map entirely** (no location data exists) and replace it with the honest substitute the brief allows: a real activity heat strip built from real daily history. And because the reference is light while Harbour's default is dark, both themes are **designed separately** and never auto-inverted — the light dashboard is a sea-glass composition, not the dark one run through a filter.

---

## 2. Token mapping table

Every visual role in the dashboard, mapped to an **existing** token. Variable names are exact.

| Visual role | Existing token(s) | Notes |
| --- | --- | --- |
| Page base behind the dashboard | `--bg` (shell) | The dashboard paints no opaque background of its own; the shell's aurora + `--bg` show through. An **optional ambient scene wash** (`.dash-scene`, §6.4) may sit at `z-index: -1` beneath the content and behind the aurora — a low-opacity concept-art image plus a `--glass-tint` overlay, never opaque. |
| Glass panel fill (activity panel only) | `--glass-tint` + `--glass-fill` | Via `.glass` (spec §4). |
| Solid surface (menus/sheets, fallbacks) | `--bg-elevated` | Radix portals, chart tooltip surface. |
| Flat-card boundary (its only boundary) | `--border-strong` | 3:1 — held by the contrast script. |
| Decorative hairline / divider / chart grid | `--border` | Not gated (0.14 alpha divider). |
| Card corner radius | `--radius-lg` | Glass/static/flat cards. |
| Rail container radius | `--radius-md` | |
| Pill radius (chips, badges, avatars, rail buttons) | `--radius-pill` | |
| Hairline width | `--hairline` | 1px — the only px value allowed. |
| Primary text | `--text` | |
| Secondary text (metric sub-labels, panel notes) | `--text-muted` | |
| Caption / chart ticks / timestamps | `--text-subtle` | |
| Link, "Find people ↗", active rail icon | `--accent-text` | |
| Primary button | `--accent-fill` + `--on-accent` | |
| Gold highlight (streak, Tide Bank accent, gold chip) | `--gold-fill` / `--on-gold` / `--gold-text` | Gold is a **fill with dark text**; never body text on ivory (spec §3). |
| Danger (error state) | `--danger` | |
| Success (task complete, "clear") | `--success` | |
| Focus ring | `--focus-ring` + `--focus-ring-width` + `--focus-ring-offset` | 2px ring, 2px offset, in rem. |
| Activity chart bars (primary) | `--chart-1` | |
| Chart grid lines | `--border` | |
| Chart axis ticks | `--text-subtle` | |
| Chart tooltip surface / text / border | `--bg-elevated` / `--text` / `--border` | |
| Heat-strip intensity ramp | `--chart-1` via `color-mix()` at 0/25/55/100% | Non-text graphic; `--chart-1` vs surfaces already gated at 3:1. |
| Heat-strip empty cell | `--glass-fill-strong` | Decorative, below the lowest band. |
| Secondary activity only | `--chart-5` | Violet, explicitly demoted. |
| Avatar tint | `--chart-1..5` at 20% alpha (existing `.ui-avatar`) | Mascot avatars use the same geometry (see §5, module 6). |
| DEMO / SAMPLE / SIMULATION badges | `DemoBadge` (`--accent-text` / `--gold-text` / `--text-muted`) | |
| Status (risk) | `StatusBadge` (`--danger` / `--gold-text` / `--success` / `--accent-text`) | Always colour + icon + label. |
| Aurora behind content | `--aurora-1/2/3` + `--aurora-blob-opacity` | Unchanged from the shell. |
| Spacing (all gaps, padding, insets) | `--space-1..10` | 0.25 … 8rem. Nothing off-scale. |
| Type roles | `--type-display/h1/h2/h3/body/small/label` + `--leading-*` + `--tracking-*` + `--measure-*` | KPI figure uses the `type-h2` utility on a `<p>` (see §5, module 2). |
| Motion durations / easings | `--dur-fast/base/slow/scene` + `--ease-out` / `--ease-in-out` | |
| Dashboard content above the aurora | `--z-raised` | Rail uses `--z-raised`; shell nav stays `--z-nav`. |
| Touch target (rail buttons, safety pills) | `--touch-target` | 2.75rem. |
| Sticky offset under the shell nav | `--nav-height` | 4.25rem. |
| Grid track minimums | `--grid-min-sm/md/lg` | 14 / 17 / 22rem. |
| Container width / form column / gutters | `--container-max-inline-size` / `--container-narrow` / `--container-padding-inline` | 75rem / 28rem / 1→1.5→2rem. |
| Interactive-card effects | `--spotlight-alpha` / `--tilt-max` / `--tilt-perspective` | Concept-art tool cards only (§5). |

**No existing token covers** the rail width, the rail's viewport cap, the rail's sticky offset, the heat-cell edge, the chart-box ratio or the art-box ratio. Those are proposed in §3.

---

## 3. New tokens

**Zero new colour tokens.** The dashboard renders only existing surfaces (`--bg`, `--bg-elevated`, glass) and existing text/chart tokens, so it introduces **no new surface-text pair**. `scripts/solve-aurora-cap.mjs` therefore needs no new case, but it **must still be run** (§8) to prove the existing matrix — the seven text tokens against seven surface stacks, plus `--chart-1..5`, `--focus-ring`, `--border-strong`, `on-accent`/`on-gold` — still exits 0 with the dashboard's content in the tree. Everything the dashboard puts on a surface (`--text`, `--text-muted`, `--text-subtle`, `--gold-text`, `--accent-text`, `--chart-1..5`) is already a gated row in that script.

The six tokens below are **geometry**, not colour, so they are not contrast-checked. They live in `src/styles/tokens.css` like every other geometry token. Each is identical in dark and light.

| New token | Dark value | Light value | Role | Why no existing token covers it |
| --- | --- | --- | --- | --- |
| `--dash-rail-w` | `4.5rem` | `4.5rem` | Width of the left icon-rail column at ≥64em. | No token names a rail width. `--touch-target` (2.75rem) sizes the *button inside* the rail, not the rail. |
| `--dash-rail-cap` | `calc(100svh - var(--nav-height) - var(--space-6))` | same | Max block-size of the sticky rail, so 10 links never exceed the viewport; overflow scrolls. | A derived geometry value; no existing token expresses it. |
| `--dash-heat-cell` | `clamp(0.5rem, 0.35rem + 0.45vw, 0.75rem)` | same | Edge of one activity heat cell. | `--space-*` is a spacing scale, not a fluid graphic size; this is the only new `clamp()`. |
| `--dash-chart-ratio` | `16 / 10` | same | `aspect-ratio` of the activity chart box. | A ratio is not a spacing or size token. |
| `--dash-art-ratio` | `520 / 210` | same | `aspect-ratio` of the concept-art box (the `FeatureConceptArt` viewBox is `0 0 520 210`). | Derived from the SVG; kept here so the number exists once. |
| `--dash-rail-top` | `calc(var(--nav-height) + var(--space-6))` | same | The sticky rail's `inset-block-start` offset under the shell nav (4.25rem + 2rem). | Added by the builder, not in the original five. The Stylelint spacing gate rejects a raw `calc()` literal in an `inset-*` declaration — it accepts only a token, `0`, `auto` or the two layout tokens — so the composite is held as a token and is on the `stylelint.config.mjs` SPACING allow-list. Precedent: `--hero-pull-up` in `src/styles/tokens.css`. A composite of two existing tokens, not a new value. |

Stylelint accepts these under the same exemption the other geometry tokens use. The five layout tokens are not `padding`/`margin`/`gap`/`inset` declarations; `--dash-rail-top` is the one that is, which is exactly why it is on the allow-list. Nothing here is a surface text sits on, so no contrast run is added.

---

## 4. The measurement and responsiveness system

### 4.1 The dashboard grid — 320px to 1440px

Two grid layers. **Layer 1** is the page: rail column + content column. **Layer 2** is the content: the existing `Bento` primitive (12 columns ≥64em, 2 ≥40em, 1 below).

```css
/* Layer 1 — the page. Rail is column 1, content is column 2. */
.dash-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);        /* < 64em: one column, rail hidden */
  gap: var(--space-6);                          /* 2rem */
  inline-size: 100%;
  max-inline-size: var(--container-max-inline-size);   /* 75rem */
  margin-inline: auto;
  padding-inline: var(--container-padding-inline);     /* 1 → 1.5 → 2rem */
  align-items: start;
}

@media (width >= 64em) {
  .dash-grid {
    grid-template-columns: var(--dash-rail-w) minmax(0, 1fr);  /* 4.5rem + content */
    gap: var(--space-7);                        /* 3rem */
  }
}
```

Layer 2 is `<Bento>` (no new CSS). Module placement:

| # | Module | `BentoItem size` | 12-col span | 2-col span | 1-col span |
| --- | --- | --- | --- | --- | --- |
| 1 | Welcome header | `full` | 12 | 2 | 1 |
| 2 | Metric row | 3 × `third` | 4 each | 1 each | 1 each |
| 3 | Activity panel | `twothirds` | 8 | 2 | 1 |
| 4 | Task / progress panel | `third` | 4 | 1 | 1 |
| 9 | Concept-art tool cards | `full` (nested `Grid min="sm"`) | 12 | 2 | 1 |
| 5 | Next-step nudge | `third` | 4 | 1 | 1 |
| 10 | Tide Bank card | `third` | 4 | 1 | 1 |
| 7 | Safety panel | `third` | 4 | 1 | 1 |
| 6 | Community panel | `half` | 6 | 1 | 1 |
| 11 | Impact panel | `half` | 6 | 1 | 1 |

Row groups at ≥64em (each sums to 12): header · 3×metric · activity+tasks · tool cards · nudge+tide+safety · community+impact.

**Stages.**
- **< 40em (320–639px):** 1 column. Rail `display:none`. Metrics stack; activity panel full width; tool cards 1-up.
- **40em–63.99em (640–1023px):** `Bento` 2 columns. Rail hidden; the shell's bottom tab bar (`.harbour-tabs`) is the primary nav.
- **≥ 64em (≥1024px):** rail + 12-column `Bento`; the shell hides `.harbour-tabs` at this width itself. This is the reference's "rail + multi-column" layout.
- **≥ 80em (≥1280px):** content reaches `--container-max-inline-size` (75rem) and centres; the reference's full density.

Every track is `minmax(min(100%, X), 1fr)`, so no stage can overflow (spec §6).

### 4.2 `clamp()` — every use

| Use | Min | Preferred | Max |
| --- | --- | --- | --- |
| `--dash-heat-cell` (new) | `0.5rem` | `0.35rem + 0.45vw` | `0.75rem` |
| `--type-h1` (welcome heading, existing) | `2.25rem` | `1.5rem + 3.5vw` | `4rem` |
| `--type-h2` (KPI figure, panel headings, existing) | `1.75rem` | `1.3rem + 2.2vw` | `2.75rem` |
| `--type-h3` (card titles, existing) | `1.25rem` | `1.1rem + 0.8vw` | `1.625rem` |
| `--type-body` (existing) | `1rem` | `0.95rem + 0.25vw` | `1.125rem` |
| `--section-padding-block` (dashboard top/bottom rhythm, existing) | `4rem` | `3rem + 6vw` | `8rem` |
| `--container-padding-inline` (existing, stepped not clamped) | `1rem` | — | `2rem` |

No other `clamp()` is introduced. The KPI figure reuses `--type-h2` rather than a bespoke size.

### 4.3 `aspect-ratio` — every use

| Element | Ratio | Note |
| --- | --- | --- |
| Activity chart box | `var(--dash-chart-ratio)` = `16 / 10` | Wrapper around `<ResponsiveContainer width="100%" height="100%">`; also `min-block-size: 10rem; max-block-size: 18rem;`. |
| Concept-art box (`FeatureConceptArt`) | `var(--dash-art-ratio)` = `520 / 210` | Matches the SVG viewBox; the SVG fills the box. |
| Heat cell | `1 / 1` | Square via `aspect-ratio`, edge = `--dash-heat-cell`. |
| Mascot avatar | `1 / 1` | Circle; size 2.5rem. |
| `UniversityLogo` (if any logo appears) | `1 / 1` | Existing component. |

### 4.4 `em` — where it is used

- **Media queries:** all of them, from the `--breakpoint-*` tokens — `@media (width >= 40em)`, `48em`, `64em`, `80em`. `em` (not `rem`) is deliberate: a user who enlarges text gets the collapsed layout sooner (spec §6).
- **Container queries:** the `Cq` wrapper (`container-type: inline-size`) plus Tailwind v4 `@`-variants (`@md:`, `@lg:`) reflow a card against **its own** width, in the container's font size. Used inside the activity panel and the tool cards so a wide card in a narrow viewport still goes 2-up.
- **Tracking:** `--tracking-display: -0.02em`, `--tracking-label: 0.08em` (existing).

### 4.5 `vw` / `svh` / `dvh`

- **`vw` is used only inside the type clamps and `--dash-heat-cell`.** It is **deliberately NOT used** for any layout width, the rail width, the content max width, the chart box or the art box. Reason: `vw` ignores the scrollbar and produces horizontal overflow, which spec §6 forbids at every width. Layout widths use `fr`, `minmax()`, `%`, `ch` and `rem`.
- **`svh`** is used once: `--dash-rail-cap` caps the sticky rail at `100svh` minus the nav and a gutter, so the rail never runs past the fold on mobile-height viewports.
- **`dvh`** is inherited from the shell (`min-block-size: 100dvh` on `.portal-main`); the dashboard adds none.
- **`vh` is never used** (mobile URL-bar jump). The chart box caps in `rem`, not `vh`.

### 4.6 The rail below 64em — and why nothing is duplicated

The rail is `display: none` below 64em. It is **not** replaced with a second bottom bar: the shell already renders `.harbour-tabs` (four primary items + a More sheet) below 1024px, and the top nav's More panel already lists Rental Shield, Cantonese helper, Dashboard, Find people, Community, Tide Bank, Voice SOS and Profile. Every one of the rail's ten destinations is therefore already reachable on small screens through existing shell chrome. The rail adds **nothing** on mobile; it never renders a second top bar (the shell owns `.harbour-topnav`).

```css
.dash-rail {
  display: none;
  position: sticky;
  inset-block-start: var(--dash-rail-top);   /* 4.25rem + 2rem */
  max-block-size: var(--dash-rail-cap);
  overflow-y: auto;
  z-index: var(--z-raised);
}
@media (width >= 64em) { .dash-rail { display: block; } }
```

The rail's sticky offset is the `--dash-rail-top` token (`calc(var(--nav-height) + var(--space-6))`), not an inline `calc()`: the Stylelint spacing gate accepts only a token, `0`, `auto` or the two layout tokens in an `inset-*` declaration, so the composite is held as a token (§3) and is on the `stylelint.config.mjs` SPACING allow-list.

Rail buttons are `--touch-target` (2.75rem) square, stacked with `--space-2` (0.5rem) gap, each `border-radius: var(--radius-pill)`, each carrying an `aria-label` and a label revealed on **hover and `:focus-visible`** (never hover-only — spec §6 / Addendum rule 8). The active item uses `aria-current="page"`.

### 4.7 200% zoom and 200% text

- **200% browser zoom** on a 1440px window gives a ~720px CSS viewport → below `64em`, so the rail collapses and the `Bento` falls to 2 columns; the metric row wraps 2+1; the chart goes full width. Because every track is `minmax(min(100%, X), 1fr)` and the page maxes at `--container-max-inline-size`, there is no horizontal scroll. This is exactly the 1024px stage of §4.1, reached by zoom instead of by width.
- **200% text** (root font-size doubled) hits the same collapse *earlier*, because the breakpoints are in `em`. Every box is sized in `rem`/`aspect-ratio`, so nothing clips; long nicknames and long metric labels wrap via `overflow-wrap: anywhere` (spec §6). The heat grid stays 7 columns because its cell is `clamp()`-bounded and the gap is `--space-1`.
- Both passes are part of the Playwright matrix (§8) and are a definition-of-done item for this brick.

---

## 5. Component mapping

Shared components are from `src/components/ui`; primitives from `src/components/layout` (`Container`, `Section`, `Stack`, `Cluster`, `Grid`, `Bento`/`BentoItem`, `Heading`, `Text`, `Cq`, `VisuallyHidden`).

| # | Module | Shared components | Layout primitives | `InteractiveCard`? |
| --- | --- | --- | --- | --- |
| 1 | Welcome header | `Avatar` (or profile `Chip`), `Text`, `Heading`, `Button asChild`→`Link` | `Cluster` (header ↔ profile chip), `Stack` | No — a header is not a card. |
| 2 | Metric row | `Card variant="flat"`, `CardHeader/CardTitle/CardContent`, `Text`, `DemoBadge variant="demo"` (tide only) | `Bento`/`BentoItem size="third"`, `Stack`, `Cluster` | No — tilt/expand on a KPI is noise. |
| 3 | Activity panel | `Card variant="static"` (the one glass surface), `Button size="small"` ×3 (range selector), `EmptyState`, `Text`, `VisuallyHidden`; **Recharts** `BarChart`/`ResponsiveContainer` | `Cq`, `Stack`, `Cluster`, `Grid` | No. |
| 4 | Task / progress panel | `Card variant="flat"`, `ProgressRing`, `Chip`, `Text`, `Button asChild`→`Link` | `Stack`, `Cluster` | No. |
| 5 | Next-step nudge | `Card variant="flat"`, `Button`, `Text` | `Stack`, `Cluster` | No — keep the dashboard calm; a nudge is not expandable. |
| 6 | Community panel | `Card variant="flat"`, `Avatar`, `Chip asChild`→`Link`, `EmptyState`, `DemoBadge variant="sample"` | `Stack`, `Cluster`, `Grid` | No. |
| 7 | Safety panel | `Card variant="flat"`, `SafetyRail variant="compact"`, `Disclaimer` | `Stack` | No. |
| 8 | Left icon rail | new dashboard-owned `DashboardRail` `<nav>` of `NavLink`s; icons from `src/components/ui/icons` | `Stack` | No. |
| 9 | Concept-art tool cards | `Button asChild` → `Link`, `Card variant="flat"`, `FeatureConceptArt`, `DemoBadge` | `Grid min="sm"` (14rem → 4-up wide, 2-up mid, 1-up narrow), `Stack`, `Cluster` | **No** — see the note below. |
| 10 | Tide Bank card | `Card variant="flat"`, `Text` (mono figure), `Button size="small"` (reveal), `DemoBadge variant="demo"`, `Disclaimer` | `Stack`, `Cluster` | No. |
| 11 | Impact panel | `Card variant="flat"`, `Text`, `StatusBadge` (tone `info`), `DemoBadge variant="demo"` | `Stack`, `Cluster` | No. |

**Module 9 — revised in review. This section was rewritten after the quality pass, and the spec records the change rather than the original intent.** The original mapping put `InteractiveCard` here and an "Open" `Chip` in its footer. Two findings overturned it:

1. **A dead affordance.** `InteractiveCard`'s expand trigger is `<button className="ui-card__trigger">` with `position: absolute; inset: 0` (`src/styles/ui.css:308`), so it covers the whole card *including the footer*. Any `<a>` in that footer is painted over and cannot be clicked — it still looks like a link to a sighted user. The "Open" chip was never wired to anything.
2. **The owner's requirement.** "The Open button in the dashboard must lead to the specific address." A card whose only click target expands it in place cannot also be a navigation link.

So each tool is now a `Card variant="flat"` carrying the Harbour concept art, the description and the `DemoBadge`, with a real `Button asChild` → `Link` beneath it labelled with the destination. The destination comes from the app shell's own link table (`AppShell.tsx`), so the dashboard and the shell agree on where every tool lives: Settlement Assistant → `/app/checklist`, Anti-Scam Centre → `/app/shield`, Translation Gateway → `/app/translate`, Voice SOS and Community → `/app/chat`.

The glass-surface ceiling in §5 stays as it was and is now satisfied with room to spare: the activity panel is the only `variant="static"` card, everything else is `flat`, and no card is `interactive` at all.


**Mascot avatars (module 6).** The four mascots (`public/art/mascot-otter|fox|crane|turtle.webp`) render as image avatars. `Avatar` is initials-only, so use a plain `<img>` inside a `border-radius: var(--radius-pill)`, `aspect-ratio: 1/1`, `2.5rem` box, with `alt` = the friend's name, and a `+N` `Chip` for overflow. **Proposed component change (not a token):** adding an optional `src` to `Avatar` would let the mascot path reuse the existing geometry; until then the `<img>` is styled to match `.ui-avatar`.

**Range selector (module 3).** Three `Button size="small"` in a `Cluster`, each `aria-pressed`, toggling Today / Week / Month. It drives the real series from `harbour-progress-history` (1 / 7 / 30 bars). The heat strip always shows the **last 28 days** (7 columns × 4 weeks) regardless of the selector, with a 4-step `--chart-1` legend and "Less / More" labels. The panel carries a **visible** SR-readable summary paragraph (reusing the legacy sentence pattern: "N steps recorded in the last 7 days. Your busiest day was {day} with {n}.") — so the chart is never the only carrier of meaning (Addendum rule 4).

---

## 6. Motion specification

Only allowed terms: **animate `transform` and `opacity`** (CSS), **GSAP** for the entrance and scroll reveals, **Motion for React** for component state. No layout-dimension animation, no blur animation, no scroll hijacking, no auto-advancing carousel, no fake progress. The full final content is always in the DOM; reduced motion removes movement, never information (`INSPIRATION.md` motion principles).

### 6.1 Entrance (once, on mount)

A single GSAP timeline in a `useLayoutEffect`, scoped to the dashboard root, matching the legacy Dashboard's approach. **Gate:** if `matchMedia('(prefers-reduced-motion: reduce)').matches` **or** the shell's calm mode is on (`document.documentElement.dataset.calm === 'true'`), do not create the timeline — render final states.

| Beat | Elements | From → To | Duration | Ease |
| --- | --- | --- | --- | --- |
| 1 | `.dash-header` (module 1) | `{autoAlpha:0, y:16}` → `{autoAlpha:1, y:0}` | `--dur-slow` (0.6s) | `power3.out` (≈ `--ease-out`) |
| 2 | `.dash-metric` ×3 (module 2) | same | `--dur-base` (0.3s), stagger `--dur-fast` (0.15s) | `power3.out` |
| 3 | `.dash-panel` (activity, tasks, tool cards, nudge, tide, safety) | same | `--dur-base`, stagger `--dur-fast` | `power3.out` |
| 4 | `.dash-lower` (community, impact) | same | `--dur-base` | `power3.out`, **ScrollTrigger** `start:'top 90%'`, `once:true` |

`autoAlpha` is GSAP's opacity + visibility, so it animates opacity (allowed). `y` is a transform (allowed). `clearProps:'all'` on completion.

### 6.2 Data choreography

- **Chart.** Recharts runs with **`isAnimationActive={false}`** — its default tween animates bar *height*, a layout dimension, which the spec forbids. The chart is simply drawn inside the panel that reveals at beat 3, so it "appears with" the panel rather than growing. This also means there is **no fake progress**.
- **Count-up (modules 2).** The KPI integer tweens 0→value **once**, over `--dur-slow` (0.6s), `ease: power1.out`, started as each metric card reveals. It is a JS text interpolation, not a CSS animation, so it does not violate "animate transform/opacity only" — but it obeys reduced motion: **under `prefers-reduced-motion: reduce` or calm mode, the final integer renders immediately with no tween.** The animated digits are `aria-hidden`; a sibling `VisuallyHidden` span carries the real value, so assistive tech always reads the true number and never a moving one.
- **Heat strip.** **No per-cell animation.** The strip appears with its panel's opacity reveal. No stagger, no colour pulse — the reference's noise is not copied.

### 6.3 `prefers-reduced-motion: reduce` renders

Exactly the same content, fully static: header, metrics, panels and lower panels at `opacity:1` with no transform; KPI integers at their final values; chart fully drawn; heat strip fully opaque; rail static; no ScrollTrigger, no Lenis (Lenis is off in the app regardless). Nothing is hidden, and no state depends on the animation having run. The shell's calm mode (`data-calm="true"`) produces the identical static result.

### 6.4 Ambient scene layer (deviation — user-approved)

A contained, purely decorative backdrop layer (`.dash-scene` in `dashboard.css`), mounted as the first child of `.dash-page`: a full-bleed `art/harbour-scene-1.svg` wash at `opacity: 0.23` (dimmer than `/app/home`'s 0.32 and `/app/people`'s 0.26, because the dashboard is the densest page), a `--glass-tint` overlay, and 4–6 drifting elements that reuse the `Mascot` component plus hand-drawn abstract SVG shapes.

Rules:

- **Decorative only.** The layer is `aria-hidden`, `pointer-events: none`, `z-index: -1` inside the page's `isolation: isolate`, and contained by `overflow: hidden`, so it can never intercept a pointer or add a scrollbar.
- **Transform and opacity only.** Each drifter runs a CSS `@keyframes` drift (translate + gentle rotate/scale), durations 18–34s, `ease-in-out`, `infinite alternate`, varied per element so none move in lockstep.
- **Static under reduced motion and calm mode.** Every drift animation lives inside one `@media (prefers-reduced-motion: no-preference)` block, additionally scoped to `:root:not([data-calm='true'])`. Under either, the layer renders as a still frame — wash, tint and elements frozen — with identical content and zero movement.
- **Token-only.** Noise tints are the §3 `--chart-N` tokens (one per element, so no two share a colour and the layer re-themes), fills and strokes are `currentColor`, and the off-scale percentage insets are declared as `--drifter-dash-*` tokens in `tokens.css`, never written in a rule.
- **No JS.** There is no pointer-parallax handler and no rAF loop; the animation is CSS, so the page keeps its single GSAP entrance timeline and adds no listener.

This is the one place the dashboard permits continuous motion. It supersedes the "one-shot reveals only" line in §7 item 9 for this contained, decorative case; scroll hijacking and auto-advancing carousels remain banned.

---

## 7. Anti-patterns to avoid

1. **Identical bento cards.** Sizes must vary (the reference's failure; Addendum §6). Use `third` / `twothirds` / `half` / `full` deliberately.
2. **Colour-only status.** Risk/status is always colour **+ icon + label** (Addendum rule 4).
3. **Glass-on-glass, and card-in-card.** Flat cards use `--border-strong`; never nest a card.
4. **More than three glass surfaces on screen.** Only the activity panel is glass; the rest are flat; interactive cards live in their own row.
5. **Invented statistics.** No `+12.8%` deltas, no revenue/engagement figures, no monetary value on tide points. Any non-real value is permanently `DEMO` / `SAMPLE` / `SIMULATION`.
6. **Importing the reference's palette or framing.** No purple primary, no green financial palette, no credit-card block, no "Total Balance", no dotted world map.
7. **Auto-inverting the light reference into dark.** Both themes are designed separately.
8. **Fake progress / animated chart bars / digit tweens that ignore reduced motion.** Chart `isAnimationActive={false}`; count-up has a reduced-motion path.
9. **Scroll hijacking and auto-advancing carousels.** Scroll position is never taken over and nothing advances on a timer. Static content uses one-shot reveals (§6.1); the single exception is the **contained, purely decorative ambient scene layer** of §6.4, which drifts continuously but is `aria-hidden`, transform/opacity-only, and parked entirely under reduced motion and calm mode. It is the only continuous motion on the page.
10. **Hover-only interaction.** Every rail label, chip and card action also works on focus and tap.
11. **`vw`-based layout widths** (horizontal scroll) and **`vh`** (mobile jump). Layout uses `fr`/`minmax()`/`%`/`rem`.
12. **Off-scale spacing or raw colour.** `--space-*` and tokens only; hairlines are the only px.

---

## 8. Quality gates

Run from the repo root. Every command must pass before the brick is "done".

| Gate | Command | Pass criteria |
| --- | --- | --- |
| ESLint | `npm run lint` | 0 errors. Includes `harbour/no-off-scale-spacing` and the arbitrary-value ban (`w-[437px]`, `p-5`, `gap-7`). |
| Stylelint | `npm run lint:css` | 0 errors. No px except `--hairline`; no hex/rgb/hsl outside `tokens.css`; padding/margin/gap/inset restricted to `var(--space-*)`, `0`, `auto`, the section/container tokens and the new geometry tokens. |
| Types | `npm run typecheck` | Both tsconfigs clean. |
| Contrast (authority) | `node scripts/solve-aurora-cap.mjs` | Exit 0. Proves the existing 7-text × 7-surface matrix, `on-accent`/`on-gold`, `--focus-ring`, `--border-strong` and `--chart-1..5` all still clear their targets with the dashboard in the tree. No new pair added. |
| axe | `node scripts/axe-matrix-report.mjs` | No **serious** or **critical** nodes, in both themes, at 360/390/768/1024/1440. (Extend the script's URL list to include `/app/dashboard`, or cover it in the e2e axe spec.) |
| Smoke | `node scripts/smoke.mjs` | Every route returns with no console/page error, and `scrollWidth ≤ clientWidth` on each viewport/theme. |
| Playwright matrix | `npm run test:e2e` | All routes at 360/390/768/1024/1440, both themes, screenshots; fail on horizontal scroll; **200% zoom pass** green; keyboard-only pass green. |
| Build | `npm run build` | Production build succeeds. Landing initial JS ≤ 250 KB gzipped (target to measure); dashboard stays code-split (the lazy route is preserved). |
| Screenshots | `node scripts/shots.mjs <phase>` | Dashboard captured in both themes at desktop + mobile for the owner's review. |

**Definition of done for this brick:** both themes, five viewports, 200% zoom, keyboard only, reduced motion, no px beyond hairlines, no raw colours, axe clean, `solve-aurora-cap.mjs` exits 0, and screenshots shown before moving on.

---

## Appendix A — concrete geometry snippets (no invented values)

```css
/* Heat cell */
.dash-heat-cell {
  inline-size: var(--dash-heat-cell);
  block-size: var(--dash-heat-cell);
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-sm);
  background-color: var(--glass-fill-strong);          /* band 0 */
}
.dash-heat-cell[data-level='1'] { background-color: color-mix(in srgb, var(--chart-1) 25%, transparent); }
.dash-heat-cell[data-level='2'] { background-color: color-mix(in srgb, var(--chart-1) 55%, transparent); }
.dash-heat-cell[data-level='3'] { background-color: var(--chart-1); }
.dash-heat-grid { display: grid; grid-template-columns: repeat(7, auto); gap: var(--space-1); }

/* Chart box */
.dash-chart-box {
  aspect-ratio: var(--dash-chart-ratio);
  min-block-size: 10rem;
  max-block-size: 18rem;
  inline-size: 100%;
}

/* Concept-art box */
.dash-art-box { aspect-ratio: var(--dash-art-ratio); inline-size: 100%; }
.dash-art-box > svg { inline-size: 100%; block-size: 100%; }
```

## Appendix B — content-inventory traceability (all 11 modules)

| # | Module | Data source | Honesty label |
| --- | --- | --- | --- |
| 1 | Welcome header | profile store (`useProfile`) — real | — |
| 2 | Metric row | `harbour-checklist` (real) · `harbour-tide-balance` (DEMO, no monetary value) · `harbour-friends` (real) | `DemoBadge variant="demo"` on tide points |
| 3 | Activity panel | `harbour-progress-history` (real) | — (empty state is a real state) |
| 4 | Task / progress panel | `harbour-checklist`, `harbour-custom-lists` (real) | — |
| 5 | Next-step nudge | — | — |
| 6 | Community panel | `harbour-friends` (real) + directory (SAMPLE) | `DemoBadge variant="sample"` |
| 7 | Safety panel | `SafetyRail` constants (**UNVERIFIED** in source) | carried in source |
| 8 | Left icon rail | routes only | — |
| 9 | Concept-art tool cards | `FeatureConceptArt` sketches | `DemoBadge variant="sample"` |
| 10 | Tide Bank card | masked demo balance, reveal on demand | `DemoBadge variant="demo"` + "no monetary value" |
| 11 | Impact panel | anonymous counters, hidden below threshold | `DemoBadge variant="demo"` |
