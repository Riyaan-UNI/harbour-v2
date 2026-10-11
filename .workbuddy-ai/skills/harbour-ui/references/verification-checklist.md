# Harbour verification checklist

Consolidated from `docs/DESIGN_SPEC.md` §8, §11, §12 and §14. If this file and the spec disagree, the spec wins.

## Definition of done - every brick

A brick is not finished until all of the following hold, and any failure has been reported:

- [ ] Renders correctly in **both themes** (dark and light), designed separately - not auto-inverted.
- [ ] Correct at **360, 390, 768, 1024 and 1440 px** wide.
- [ ] Correct at **200% zoom**.
- [ ] Fully operable **keyboard only** - visible focus, logical order, no traps.
- [ ] Correct under **reduced motion** (final states shown, no movement).
- [ ] No `px` anywhere except 1px hairlines.
- [ ] No raw colours - no hex, `rgb()` or `hsl()` outside the token file.
- [ ] axe-core clean: **no serious or critical violations**, in both themes.
- [ ] `scrollWidth <= clientWidth` at every viewport - no horizontal page scroll.
- [ ] Screenshots captured and shown before moving to the next brick.

## Test matrix

| Route | 360 | 390 | 768 | 1024 | 1440 | Dark | Light | 200% zoom |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| each route | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

Automate with Playwright + `@axe-core/playwright`. Fail the run if `scrollWidth` exceeds `clientWidth`.

## Theme coverage

Every item verified in **both** themes:

- [ ] Text levels (text, text-muted, text-subtle)
- [ ] Links
- [ ] Borders / hairlines
- [ ] Focus rings (2px ring, 2px offset)
- [ ] Text selection
- [ ] Placeholders
- [ ] Disabled states
- [ ] Hover and active states
- [ ] Shadows - use borders and glow in dark
- [ ] Glass and its fallbacks (`@supports` and reduced-transparency)
- [ ] Native controls and scrollbars
- [ ] Form fields and errors
- [ ] Dropdowns and popovers
- [ ] Modals and backdrops
- [ ] Toasts
- [ ] Skeletons
- [ ] Charts - axes, grid, tooltips, legends
- [ ] SVG scenes
- [ ] Avatars
- [ ] University logos
- [ ] Nav - both layouts
- [ ] Browser `theme-color`

## Interaction states

Every interactive element needs all five, plus a touch equivalent for any hover effect:

- [ ] hover
- [ ] active
- [ ] focus-visible
- [ ] disabled
- [ ] loading

## Responsive rules

- [ ] Minimum touch target 2.75rem.
- [ ] Breakpoints in em: 40, 48, 64, 80.
- [ ] Container: max-inline-size 75rem; padding-inline 1rem, then 1.5rem from 40em, then 2rem from 64em.
- [ ] Section padding-block: `clamp(4rem, 3rem + 6vw, 8rem)`.
- [ ] Spacing only from the scale: 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8 rem.
- [ ] Logical properties used (`padding-inline`, `margin-block`, `inline-size`).
- [ ] Long text and nicknames wrap with `overflow-wrap: anywhere`.
- [ ] Cards respond to **container** width, not viewport width.

## Motion rules

- [ ] Only `transform` and `opacity` animated (plus SVG path data in the two scenes).
- [ ] Scroll reveals play once.
- [ ] App pages stay mostly still.
- [ ] Under `prefers-reduced-motion`, final states render with no movement.
- [ ] Offscreen and hidden-tab animations paused.

## Quality gates (tooling)

- [ ] **Stylelint:** bans `px` except `1px`; bans hex, `rgb` and `hsl` outside the token file.
- [ ] **ESLint:** flags Tailwind arbitrary values such as `w-[437px]`.
- [ ] **Gallery:** `/dev/gallery` shows every component in every state, with a theme toggle, behind a dev flag.
- [ ] **Performance:** LCP <= 2.5s on throttled mid-range mobile; CLS <= 0.1; landing initial JS <= 250 KB gzipped (a target to measure, not a guarantee). Code-split below-the-fold sections and the demo.

## Verify at install time

The spec itself flags these as unverified. Check each against current documentation before relying on it:

- [ ] Exact package names and versions for every dependency; pin them.
- [ ] Tailwind v4 `@theme` / `@theme inline` and the `custom-variant` dark syntax.
- [ ] Fontsource variable package names - Bricolage Grotesque, Geist, Geist Mono - and whether each ships a variable build.
- [ ] Whether the Vite scaffold still defaults to React 19, against the spec's React 18.
- [ ] The ESLint mechanism for detecting Tailwind arbitrary values.
- [ ] A Stylelint configuration compatible with Tailwind v4.

## Open questions still to confirm

- [ ] Radius token mapping - which of 0.5 / 1 / 1.5 rem is `md` and which is `lg`.
- [ ] Spacing token naming - named `space-1..10` versus remapped Tailwind numeric steps.
- [ ] Heading font - Bricolage Grotesque or the Geist 600 swap.
- [ ] Gallery dev-flag mechanism.
- [ ] Native-speaker check on every Cantonese string.
- [ ] Privacy and trust claims matched to actual prototype behaviour.
- [ ] University logos sourced from each institution's official media page, used only to identify the institution.
