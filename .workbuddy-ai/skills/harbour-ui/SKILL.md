---
name: harbour-ui
description: Enforces the Harbour Design Spec v1 when building or reviewing any UI in the Harbour project (harbour-v2). Use before any layout, styling, component, token, theming or accessibility work - landing sections, signup and login, app pages, the design-token layer, the gallery page, or design review. Encodes the nine builder rules, the per-brick workflow and the quality gates, and lists the known spec ambiguities that must be asked about rather than invented.
agent_created: true
---

# Harbour UI

## Overview

Harbour is a safe harbour for international students in Hong Kong - "a storm settling into calm". `docs/DESIGN_SPEC.md` (Harbour Design Spec v1) is the **single source of truth** for the UI. This skill makes that spec operational: it applies the builder rules to every brick, defines the build-and-verify workflow, and names the points where the spec is silent so they get asked about instead of guessed.

## Rule zero

Read `docs/DESIGN_SPEC.md` before starting any UI work, and re-read the section covering the current brick. The spec wins over this skill, over habit, and over general design instinct. **If a value is not in the spec, ask - do not invent one.** If a contrast pair fails axe, adjust the token, not the component.

## Builder rules

Apply all nine to every brick. These are the spec's own builder rules; treat them as non-negotiable.

1. **Tokens only.** No raw hex colours, no arbitrary spacing, no font sizes outside the spec.
2. **Units.** rem for spacing, type, radii and sizes; em for media queries; `clamp()` for fluid values; ch for text width; `aspect-ratio` for media; `svh`/`dvh` instead of `vh`; `fr` and `minmax()` for grids. px only for 1px hairlines.
3. **No outer margins on components.** Spacing comes from layout primitives (Stack, Cluster, Grid, Section, Container).
4. **Never a card inside a card.** At most three glass surfaces on screen.
5. **Every colour is a semantic token with both a dark and a light value.** Anything new gets both.
6. **Every interactive element has hover, active, focus-visible, disabled and loading states**, plus a touch equivalent for any hover effect.
7. **Animate `transform` and `opacity` only.** Respect `prefers-reduced-motion` and `prefers-reduced-transparency`.
8. **Test before finishing a brick** at 360, 390, 768, 1024 and 1440 px wide, in both themes, at 200% zoom, keyboard only. Report anything that fails.
9. **Do not touch unrelated files.** Ask when stuck.

## Workflow

Follow this order for each brick.

1. **Locate the brick.** Find its scope in the build order (spec §13). Do not pull work forward from a later brick - a component that belongs to Brick 2 does not get built during Brick 0.
2. **Re-read the spec sections that cover it** - components (§8), layout and responsiveness (§6), colour (§3), motion (§7), quality gates (§12).
3. **Verify at install time.** Package names, versions and framework syntax in the spec are unverified. Check each new dependency against its current documentation before adding it. Add one dependency at a time and pin exact versions.
4. **Build with tokens.** Reference `var(--token)`, or Tailwind utilities mapped from tokens in the `@theme` layer. Never inline a colour, a px value, or an off-scale size.
5. **Self-test against the definition of done** - see `references/verification-checklist.md`.
6. **Report failures explicitly.** State what failed, at which viewport, in which theme. Never report a brick as finished while a gate is failing.
7. **Record progress** in `docs/PROGRESS.md`, and append a short note to `.workbuddy-ai/memory/YYYY-MM-DD.md`.

## Architecture notes

The theme engine sits above the token layer, and every component reads through it rather than hard-coding values:

`index.html` (pre-paint script) → `theme.ts` (mode resolution, `harbour:themechange`) → `tokens.css` (semantic CSS variables, dark + light) → `@theme inline` (tokens exposed as Tailwind utilities) → components.

Two consequences worth remembering:

- The theme mode must be stored as a **raw string** under `harbour:theme`, not as serialised state, so the pre-paint script can read it and avoid a flash of the wrong theme.
- Canvas and SVG scenes read their colours from CSS variables and refresh on the `harbour:themechange` event.

## Ask, do not invent

The spec is explicit that the tool must ask when unsure of a value. These points are genuinely underspecified - raise them rather than choosing silently:

- **Radius naming.** The spec lists 0.5 / 1 / 1.5 rem and "pill" without fixing which is `md` and which is `lg`. Glass uses `--radius-lg`; `UniversityLogo` uses "radius md". Confirm the mapping before defining the radius tokens.
- **Spacing token naming.** The scale is given as `space-1` to `space-10`, but Tailwind's default numeric spacing uses different steps. Confirm whether to define named tokens or remap the numeric scale.
- **Heading font.** Bricolage Grotesque is the default; the spec allows a one-token swap to Geist 600 if it tests too playful. Confirm which is live.
- **Gallery gate.** Confirm whether `/dev/gallery` keys off `import.meta.env.DEV` or an explicit environment flag.
- **Cantonese strings.** Every Cantonese string needs a native-speaker check before it ships (spec §14).
- **Trust claims.** The privacy and sensitive-detail claims must match what the prototype actually does (spec §14).

## Resources

- `references/verification-checklist.md` - consolidated definition of done, test matrix, theme-coverage and accessibility checklist, drawn from spec §8, §11, §12 and §14. Read it before declaring any brick finished.
- `scripts/audit_tokens.py` - read-only scan for raw hex / rgb / hsl colours and px values outside the token file. Run it before the manual gate check.
