# Harbour Rebuild — Progress

Source of truth: `docs/DESIGN_SPEC.md` (Harbour Design Spec v1, 11 Oct 2026 — now the
canonical copy in this repo, updated in Part A).
Package manager: **npm**. Scaffold: Vite 7 + React 18.3.1 + TypeScript 5.9 strict.
Branches: `brick-0-foundation` (done), `brick-1-primitives` (done), **`brick-2a-components`** (current).

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

**Status: COMPLETE.** `src/components/layout/` ships Container, Section, Stack, Cluster,
Grid, Bento + BentoItem, Heading, Text, VisuallyHidden and Cq, all polymorphic,
ref-forwarding and strict-typed, with the structural CSS in `src/styles/layout.css`.
Spacing props are the ten spec §6 steps mapped to `var(--space-N)`, so a raw value does
not type-check; nothing sets an outer margin, and only Heading and Text set a font size.
React cannot express a generic `forwardRef`, so the cast is confined to one factory
(`createPolymorphicComponent`) rather than repeated in ten files. `/dev/primitives` covers
every variant plus the stress cases (unbroken words, a 20-item Grid, a Bento at every size,
a Stack in a Cluster, and identical markup resolving to two vs three columns in a 28rem vs
a 75rem container at the same viewport), and `/dev/gallery` was dogfooded onto the
primitives. The full detail — including the two new spacing gates and the re-solved
contrast matrix — is in the Brick 1 commit (`46dfd0b`) and Part A below.

---

## Brick 2a — Simple shared components

**Status: COMPLETE. All gates green.** Branch **`brick-2a-components`** off
`brick-1-primitives`. Three commits: **Part A** (tokens and the contrast matrix),
**Part B** (shadcn/ui and the components), **Part C** (the gallery and the tests).

Scope was exactly what Addendum 1 §8 lists as "Brick 2a (simple)". Combobox, Dialog,
Sheet, Tabs, the progress ring and bar, and the interactive-card effects are **not** in
this brick — they are Brick 2b.

### Part A — light neutrals, and a contrast matrix that covers the components

**A1 — the light neutrals move to the sea-glass values** proposed in Addendum 1 §6,
replacing the warm ivory. Every text pair was re-checked; all 98 still clear 4.5:1 and
neither aurora cap moved.

| Token | Before | After | Note |
| --- | --- | --- | --- |
| `--bg` (light) | `#F7F3E9` | `#F2F7F6` | the warm ivory is gone |
| `--on-accent` (light) | `#F7F3E9` | `#F2F7F6` | follows `--bg` |
| `--glass-tint` (light) | `rgba(247,243,233,0.55)` | `rgba(242,247,246,0.55)` | follows `--bg` |
| `--bg-elevated` (light) | `#FFFFFF` | `#FFFFFF` | unchanged |

The light aurora tokens and the teal/gold roles are untouched. `--danger`, `--success`
and `--text-subtle` were re-checked against the new `bg` and all improved slightly
(`--text-subtle` on `bg` went 5.64 → 5.78; `--success` 5.65 → 5.79).

**A2 — `scripts/solve-aurora-cap.mjs` now checks three matrices**, in both themes, and
exits 1 on any miss:

1. **Text** — the seven spec §3 text tokens against seven surface stacks (unchanged in
   intent, now printed as matrix 1 of 3).
2. **Component pairs** — new, and the point of A2:
   - `on-accent` on `accent-fill`, `on-gold` on `gold-fill`, and (added in Part B, for the
     danger Button) `on-accent` on `danger` — 4.5:1, because it is still text.
   - `--focus-ring` against every surface — 3:1 (WCAG 1.4.11).
   - `--border-strong` against every surface — 3:1, the sole-boundary case.
   - `chart-1` … `chart-5` against `bg`, `bg-elevated` and glass — 3:1, graphical objects.
3. **Caps** — the highest blob and patch opacity at which matrix 1 still clears 4.5:1.

**The one thing that did not fit: the border.** `--border` is `rgba(255,255,255,0.14)` in
dark and `rgba(11,57,53,0.14)` in light — a decorative divider, **1.51:1** and **1.29:1**
against `bg`. That is correct for a hairline that is not the only thing identifying a
surface, but the spec's flat Card *is* just a hairline, so a border used as the sole
boundary must clear 3:1. Rather than raise `--border` (which would make every divider in
the app a heavy line), a second token carries the case:

| Token | Theme | Value | Worst surface | Ratio |
| --- | --- | --- | --- | --- |
| `--border-strong` | dark | `#74938F` | glass over the patch | **3.30:1** |
| `--border-strong` | light | `#5F7A76` | the aurora | **3.42:1** |

`--border` is printed by the script but **not** gated; `--border-strong` is gated on all
seven surfaces. The two windows are opposite-signed and narrow — in dark the value must
sit *above* every aurora luminance, in light *below* it — so the script rejects any future
cap change that breaks the fit instead of letting it drift.

The flat Card is the only consumer. Nothing else changed.

### Part B — shadcn/ui, and the components

**Initialisation, one pinned dependency at a time.** `class-variance-authority@0.7.1`,
then `@radix-ui/react-slot@1.5.0`, then `sonner@2.0.8`. `components.json` is written for
the Tailwind v4 style and the `@/` alias, which is why `tsconfig.json` and
`vite.config.ts` gained that one alias (the project's own imports stay relative).

**The palette bridge is the whole point.** `src/styles/shadcn.css` aliases every shadcn
CSS variable onto a Harbour token (`--background: var(--bg)`, `--primary:
var(--accent-fill)`, `--ring: var(--focus-ring)`, …) and exposes them as Tailwind
utilities through `@theme inline`. Two deliberate omissions:

- `--border` and `--chart-1` … `--chart-5` are **already** Harbour names, so they are not
  redefined — redefining them would be self-referential.
- The radius namespace is **never** touched. `rounded-md` therefore resolves to Harbour's
  1rem, not shadcn's 0.375rem. A vendored shadcn component lands on Harbour's palette,
  radii and spacing without a line of its own.

**Icons are inline SVG, not lucide-react.** The spec's §2 dependency list does not include
an icon library, so `src/components/ui/icons.tsx` hand-draws the eight glyphs the
components need. Each inherits `currentColor` and is `aria-hidden` — an icon here is
decoration beside a label, never the only carrier of meaning.

**The components** (`src/components/ui/`):

```
button.tsx + button-variants.ts     primary / secondary / ghost / danger, 3 sizes, loading
input.tsx, textarea.tsx             field-base.ts shares the fill, hairline and states
form-field.tsx                      label above, hint, error + icon, aria-describedby
card.tsx + card-variants.ts         static (glass) / interactive (glass) / flat (hairline)
chip.tsx + chip-variants.ts         neutral / accent / gold, asChild for links
status-badge.tsx                    red / amber / green / info — colour + icon + label
demo-badge.tsx + …-variants.ts      SIMULATION / DEMO / SAMPLE, permanent
disclaimer.tsx                      general information, not advice, not emergency
skeleton.tsx                        calm shimmer, static under reduced motion
empty-state.tsx, error-state.tsx    warm CTA slot; retry + offline-alternative slot
toast.tsx                           Sonner, token-themed, 4s, polite live region
avatar.tsx + initials.ts            initials on a 20% chart colour, text token on top
university-logo.tsx                 white plate, 3 sizes, acronym fallback, no shift
safety-rail.tsx + safety-contacts.ts  compact and expanded, real tel: links
redaction-notice.tsx                the hidden-identifier count, and the caveat
icons.tsx                           eight inline SVG icons
```

**Decisions taken while building, each recorded rather than assumed:**

1. **`secondary` uses the glass *fill*, not the `.glass` surface.** Spec §8 says "glass
   with border". Using the `.glass` class would force `--radius-lg` (1.5rem) on the
   button and make it a pill, inconsistent with `primary`, and would count every
   secondary button toward the three-glass-surfaces cap. `bg-glass-fill-strong` +
   `border-border` is the same translucent fill with a hairline, at `radius-md`.
2. **The danger button's label is `--on-accent`.** No `--on-danger` token exists; the
   pairing is 7.48:1 in dark and 6.04:1 in light, and Part A2 now checks it by name.
3. **`UniversityLogo`'s plate padding is `0.5rem` (`space-2`), not §8's `0.375rem`.**
   0.375rem is not one of the ten §6 steps, and the spacing gate is absolute — the same
   call Part A2 made for the aurora geometry. `0.5rem` is the nearer step, and the acronym
   is sized in container units (`26cqw`) so a three-letter code still fits at 2rem.
4. **The logo plate and its ink are tokens** (`--logo-plate` `#FFFFFF`, `--logo-plate-ink`
   `#0B3935`, both themes) because §8 mandates a white plate and dark teal in *both*
   themes, and builder rule 5 says every colour is a token with both values.
5. **Badge surfaces are mixed, not invented.** `--badge-tone` is set inline from the tone
   token and `ui.css` mixes a 14% tint for the surface and a 42% tint for the border, so
   one semantic colour drives the whole badge and no per-tone colour pair is added.
6. **Variant definitions live in sibling files** (`button-variants.ts`, `card-variants.ts`,
   …) so every component file exports only a component. Without that, the react-refresh
   rule would have shipped seven warnings where Brick 1 had none. Same reason
   `SAFETY_CONTACTS`, `initialsOf` and `toast` moved out.
7. **`Toaster`'s tokens are set inline**, because Sonner's own
   `[data-sonner-toaster][data-theme=light]` selectors out-specify a class. Inline custom
   properties are the one place that reliably wins, and they are token references, not
   raw colours.

**A real bug the browser caught.** The first build of `Button` returned a fragment with
two children (the label span and the loading span) even in `asChild` mode, and Radix's
`Slot` requires exactly one element child — the whole `/dev/components` page threw and
rendered nothing. The fix is a separate return for `asChild`, which also drops the loading
markup that a link cannot use. Typecheck, lint and build were all green with the bug
present; only loading the page found it.

**Safety numbers — provenance, and they are not verified.** Three of the four are copied
from the previous build's constants in `Harbour/harbour/client/src/pages/Home.jsx` (the
`emergency` array, lines 25–27): **999**, **18222** and **2824 6111**. The **Hospital
Authority** line is *not* in that repo — Addendum 1 §2 names it, but the old build never
held it — so the value used, **2300 6555**, comes from the Government Telephone Directory
(`tel.directory.gov.hk/HA_ENG.html`) and is the one number here with no old-repo source.
Every number is marked **UNVERIFIED** in `safety-contacts.ts` until it is confirmed
against the official page.

### Part C — the gallery and the tests

**`/dev/components`** shows every component in every variant and state, in both themes,
built from the layout primitives. Hover, active and focus-visible are live states, not
pictures: the "interaction states" row holds real buttons the Playwright pass focuses and
presses. The last `UniversityLogo` box points at `/logos/does-not-exist.svg` on purpose,
so the acronym fallback is on screen rather than only asserted.

**The page keeps to three glass surfaces.** The Card section is the only glass on the page
— exactly the three the spec allows on screen at once — and every other demo uses the flat
Card variant. That was originally not true: the first version wrapped a dozen demo cards in
glass, which broke builder rule 4 *and* made the full-page screenshots pathological, since
each one re-composites every backdrop-filter over the fixed aurora. Fixing the rule fixed
the flakiness.

**`/dev/primitives`'s heading-order warning is gone.** The Heading demo rendered an `h1`
inside a section titled by an `h2`, which axe flags as a skipped rank (moderate). The demo
now runs levels 2–6 in order and shows the decoupling with an `h4` at display size and an
`h2` at h3 size. It was a simple fix, so it was fixed rather than reported.

**`e2e/components.spec.ts`** adds 18 tests: the matrix at 320/360/390/768/1024/1440 in both
themes (12), the reduced-motion pass (1), the three button heights read from the resolved
box (1), the loading width (1), the keyboard pass over Button → Toast → Input → Card (1),
the `UniversityLogo` image-error fallback with its no-shift assertion (1), and the alt-text
assertion (1). The suite goes from 51 to **69 tests**.

Full-page screenshots are taken at 360 and 1440 only (the two widths this brick reports
on); overflow and axe run at all six. The page is ~9,700px tall at 320px, and capturing it
at every width cost more than the matrix could afford on the mapped `R:` drive.

### Gates

| Gate | Command | Result |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | pass (both TS projects) |
| Lint | `npm run lint` | pass, 0 problems |
| Lint CSS | `npm run lint:css` | pass, 0 problems |
| Build | `npm run build` | pass — CSS 39.10 kB (gzip 8.81), JS 298.66 kB (gzip 93.95) |
| E2E + axe | `npm run test:e2e` | **69/69 pass** |
| Contrast | `node scripts/solve-aurora-cap.mjs` | exit 0 — 98 text pairs, every component pair |

The build's JS grew from 235.62 kB to 298.66 kB because Sonner, `@radix-ui/react-slot` and
`class-variance-authority` are now in the graph. It is still well under the spec's 250 kB
*gzipped* landing target at 93.95 kB gzip, but the number is not yet meaningful: there is
no landing page, and the three dev pages are still statically imported, so a production
build carries them. Code-splitting the dev pages is Brick 8's audit, not this brick's.

### Deviations and decisions — Brick 2a

| # | Spec / addendum says | We do | Why |
| --- | --- | --- | --- |
| 18 | Button `secondary` is "glass with border" (§8) | glass *fill* + hairline, not the `.glass` class | Keeps `radius-md` (the `.glass` class forces `--radius-lg`), keeps the variant visually consistent with `primary`, and does not spend one of the three allowed glass surfaces on a button. |
| 19 | Nothing named for a border as a sole boundary | new token `--border-strong`, gated at 3:1 | `--border` is a 0.14-alpha decorative divider (1.51:1 dark). The flat Card's border is its only boundary, so the spec's own 3:1 rule applies to it. |
| 20 | `UniversityLogo` plate padding 0.375rem (§8) | `0.5rem` (`space-2`) | 0.375rem is not a §6 spacing step and the gate is absolute. The acronym is sized in `cqw` so it fits at every box size. |
| 21 | — | `--logo-plate` and `--logo-plate-ink` tokens | §8 mandates a white plate and dark teal in both themes; builder rule 5 wants both values as tokens. |
| 22 | — | danger button label uses `--on-accent` | No `--on-danger` exists; the pairing is 7.48:1 dark / 6.04:1 light and is now checked by the script. |
| 23 | §2 lists no icon library | inline SVG icons in `icons.tsx` | lucide-react is not in the spec's dependency list; the eight glyphs needed are hand-drawn. |
| 24 | — | `@/` alias added to tsconfig and vite | shadcn's `components.json` requires it; the project's own imports stay relative. |
| 25 | — | StatusBadge surface/border mixed from `--badge-tone` | One semantic colour per tone, no second set of per-tone surface tokens. |
| 26 | — | `toast` re-exported from the barrel, not from `toast.tsx` | Fast-refresh rule: `toast.tsx` exports only `Toaster`. |
| 27 | Spec §12 wants a gallery page | three dev pages: `/dev/gallery`, `/dev/primitives`, `/dev/components` | One per brick, all behind the same dev flag. |
| 28 | — | Playwright `timeout` raised 60s → 90s, and full-page screenshots taken at 360/1440 only | A full-page capture of the ~9,700px components page re-composites every glass surface over the fixed aurora and timed out on the mapped `R:` drive. No assertion changed — only the budget and which widths are captured. |
| 29 | Builder rule 4: at most three glass surfaces on screen | the gallery's other demo cards use the flat variant | The first version of `/dev/components` had a dozen glass cards on screen at once, which broke the rule and made the screenshots pathological. The Card section now holds the page's only three. |

### Token changes — Brick 2a

| Token | Theme | Before | After | Commit |
| --- | --- | --- | --- | --- |
| `--bg` | light | `#f7f3e9` | `#f2f7f6` | A |
| `--on-accent` | light | `#f7f3e9` | `#f2f7f6` | A |
| `--glass-tint` | light | `rgba(247,243,233,0.55)` | `rgba(242,247,246,0.55)` | A |
| `--border-strong` | dark | *did not exist* | `#74938f` | A |
| `--border-strong` | light | *did not exist* | `#5f7a76` | A |
| `--logo-plate` | both | *did not exist* | `#ffffff` | B |
| `--logo-plate-ink` | both | *did not exist* | `#0b3935` | B |

No other colour moved. The aurora caps are unchanged at dark 0.18 / 0.29 and light 1 / 1,
and both still sit at their solved maxima.

### Residual risk — Brick 2a

- **`--border-strong` sits in a narrow window.** In dark it must be brighter than every
  aurora stack and in light darker than every one; the two windows are opposite-signed.
  The values above clear 3:1 with only 0.30 and 0.42 of headroom on their worst surface.
  The script gates them, so a future aurora change fails loudly rather than drifting.
- **The safety numbers are unverified.** Three come from the old repo, one from the
  Government Telephone Directory. None has been confirmed by the user, and a wrong
  emergency number is worse than no rail.
- **`pointer: coarse` cannot be tested here.** Playwright has no media emulation for
  pointer type, so the "small button is 2.25rem only on a fine pointer" rule is asserted
  for the fine case (36px) and left unasserted for the coarse case, where the CSS falls
  back to the 2.75rem touch target.
- **The dev pages are still in the production bundle.** Three routes' worth of components
  ship to production. Fine for now, and inside the gzip target, but Brick 8 should
  code-split them.
- **`/dev/primitives` and `/dev/components` are long pages.** At 320px the components page
  is ~9,700px tall. Full-page screenshots are therefore taken at 360 and 1440 only; the
  matrix is still heavy on a networked drive.
- **Sonner's error toast uses `role="alert"`, not a polite region.** The spec asks for
  polite; Sonner escalates errors, which is the better behaviour for a failure that
  changes what you can do next, but it is a deviation worth knowing.

### What Brick 2b needs

1. **The bridge is ready.** `src/styles/shadcn.css` already carries every variable a
   vendored shadcn component expects, so `Dialog`, `Tabs` and the rest land on Harbour's
   palette with no extra work. `components.json` and the `@/` alias are in place.
2. **`z-dropdown` and `z-modal` now exist** — the combobox popover and the dialog backdrop
   should use them rather than a raw `z-*`.
3. **The interactive card is half-built.** `card.tsx`'s `interactive` variant has the hover
   and focus-visible lift; 2b adds the pointer spotlight (`--mx`/`--my` in a rAF-throttled
   `pointermove`), the ≤6° tilt behind `(hover: hover) and (pointer: fine)`, and the
   `layoutId` expand.
4. **`Cq` and the `@sm:`/`@md:`/`@lg:` variants are proven** — the combobox's container
   behaviour can use them.
5. **The spacing gates will bite on copied shadcn code.** Expect `p-5`, `gap-7` and
   friends; fix them to the §6 table, never disable the rule. Part B hit none, because the
   components were written rather than pasted, but `npx shadcn add` output will.
6. **`--radius-xl` does not exist.** A vendored component that uses `rounded-xl` will fall
   back to Tailwind's default 0.75rem, which is off-spec. Replace it with `rounded-md` or
   `rounded-lg` on sight.
7. **The safety numbers still need the user's confirmation**, and the Cantonese strings for
   Brick 5 still need a native-speaker check.
