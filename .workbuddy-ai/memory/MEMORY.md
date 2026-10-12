# Harbour — project memory

## Sources of truth

- `docs/DESIGN_SPEC.md` — concrete token values, components, quality gates. **Never invent a value that is not in it — ask.** Now the canonical copy: §2–§6 and §12 record every addition and deviation.
- `.impeccable.md` — design *intent* (users, personality, aesthetic direction).
- `docs/PROGRESS.md` — brick-by-brick status, deviations, token changes, what the next brick needs.

## Status

Brick 0 (tokens, theme engine, fonts, aurora, gallery), Part A (review fixes), Brick 1 (layout primitives) and **Brick 2a** (simple shared components) are **done**, on `brick-2a-components`. Next: **Brick 2b** — Combobox, CountryCombobox, Dialog, Sheet, Tabs, progress ring and bar, and the interactive-card effects (spotlight, tilt, expand).

## Project conventions

- **Stack:** Vite 7 + React 18.3.1 (pinned by hand) + TS 5.9 strict. Tailwind v4.3 CSS-first (`@tailwindcss/vite`, no config file). shadcn/ui copied into the repo, from Brick 2.
- **Package manager:** npm. Pin exact versions, add one dependency at a time.
- **Tokens only.** No raw hex/rgb/hsl outside `src/styles/tokens.css`; no `px` except 1px hairlines; spacing only from the ten spec steps.
- **Four gates enforce the rules:** ESLint flags arbitrary Tailwind *values* (`w-[437px]`; arbitrary *variants* allowed) and off-scale spacing steps (`p-5`, `gap-7`). Stylelint bans px-except-1px, raw colour functions outside `tokens.css`, and any padding/margin/gap/inset value that is not `var(--space-*)`, `0`, `auto`, a section/container token or an aurora geometry token.
- **Spacing naming trap:** spec `space-5` is Tailwind `p-6`. The ten spec steps are Tailwind 1, 2, 3, 4, 6, 8, 12, 16, 24, 32. Mapping table in spec §6.
- **Layout primitives exist — use them.** `src/components/layout/`: Container, Section, Stack, Cluster, Grid, Bento(+Item), Heading, Text, VisuallyHidden, Cq. Polymorphic, ref-forwarding, spacing props typed to the ten steps. Never hand-roll layout; only Heading and Text set a font size.
- **Shared components exist — use them.** `src/components/ui/`: Button, Input, Textarea, FormField, Card (+Header/Title/Description/Content/Footer), Chip, StatusBadge, DemoBadge, Disclaimer, Skeleton, EmptyState, ErrorState, Toaster+`toast`, Avatar, UniversityLogo, SafetyRail, RedactionNotice, and inline `icons`. Variant definitions live in sibling `*-variants.ts` files (fast-refresh rule). Reuse `ThemeToggle`.
- **shadcn/ui is vendored, not adopted.** `src/styles/shadcn.css` aliases every shadcn CSS variable onto a Harbour token and **never** touches the radius namespace, so `rounded-md` is Harbour's 1rem. `components.json` and the `@/` alias (tsconfig + vite) exist so `npx shadcn add` lands correctly — but fix any off-scale spacing it brings to the §6 table, never disable the gate.
- **Icons are inline SVG**, not lucide-react (not in spec §2).
- **`--border-strong`** (#74938f dark / #5f7a76 light) is the border token for when a border is a surface's *only* boundary (the flat Card). `--border` stays decorative. Both are checked by the contrast script.
- **Gates:** `npm run typecheck`, `lint`, `lint:css`, `build`, `test:e2e` (69 Playwright + axe tests).
- **Theme:** dark default; dark and light designed separately. `data-theme` + `color-scheme` on `<html>`. The mode is a **raw string** under `harbour:theme` so the pre-paint script can read it.
- **Profile storage keys:** `harbour:v1:profiles`, `harbour:v1:activeProfileId`, `harbour:theme`.
- **Motion:** animate `transform` and `opacity` only; GSAP for landing/scroll/SVG, Motion for component state, Lenis on landing only.
- **Never:** a card inside a card; glass on glass; more than three glass surfaces on screen.
- **Aurora caps are solved, not guessed.** `scripts/solve-aurora-cap.mjs` prints three matrices — all seven text tokens against seven surface stacks (4.5:1), the component pairs (text-on-fill 4.5:1; focus-ring, border-strong and the chart palette 3:1), and the cap solver — in both themes, and exits 1 on any miss. It rejects any cap above the solved maximum.
- **Vite `server.host` pinned to `127.0.0.1`** (Vite's `localhost` resolves to `[::1]` here). `npm run dev:lan` for real devices.
- **Playwright `--output` must be on a local drive** — the trash operation fails on `R:`. `.gitignore` covers `/.pw-run*/` and `/.tmp-*/`.

## Definition of done for every brick

Both themes · 320/360/390/768/1024/1440 px · 200% zoom **and** 200% text size · keyboard only · reduced motion · no `px` beyond hairlines · no raw colours · axe clean (serious/critical) · `scrollWidth <= clientWidth` · screenshots shown before moving on.

## Skills

- `.workbuddy-ai/skills/harbour-ui/` — the nine builder rules, the per-brick workflow, a verification checklist, and a read-only token audit script.

## Open questions

- **Safety numbers are UNVERIFIED** (`src/components/ui/safety-contacts.ts`): 999 / 18222 / 2824 6111 came from the old repo (`Harbour/harbour/client/src/pages/Home.jsx` lines 25–27); the Hospital Authority line (2300 6555) is not in the old repo at all and came from the Government Telephone Directory. Do not ship them unconfirmed.
- Heading font — **Bricolage Grotesque is live**; the one-token swap to Geist 600 is still available.
- Dev pages — **decided**: `import.meta.env.DEV`, overridable by `VITE_ENABLE_GALLERY`. `/dev/primitives` uses the same flag.
- Cantonese strings need a native-speaker check before shipping.
- Noto Sans TC is **deferred to Brick 5** as a lazy import, preferring Noto Sans HK if a variable build exists.
- `UniversityLogo` radius — **decided in Brick 2a**: `radius-md` (1rem) at 3rem, `radius-sm` (0.5rem) at 2rem and 2.5rem. Plate padding is `0.5rem` (space-2), not §8's 0.375rem, because 0.375rem is not a §6 step.
- **Brand assets are in `public/`** (`harbour-logo.svg`, `harbour-mark.svg`, `favicon.svg`) — **not wired up yet**, use only on request. Every hex is now an exact spec §3 token (light `accent-fill`, `gold-fill`, `bg`, `aurora-1`, `text-subtle`), and the tagline is spec §9's headline. They are **light-background lockups**: the `#0B3935` wordmark is unreadable on the dark theme's `#061B1A`, and the logo carries hard `width`/`height` so it will not scale.
