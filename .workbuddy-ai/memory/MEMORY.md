# Harbour — project memory

## Sources of truth

- `docs/DESIGN_SPEC.md` — concrete token values, components, quality gates. **Never invent a value that is not in it — ask.** Now the canonical copy: §2–§6 and §12 record every addition and deviation.
- `.impeccable.md` — design *intent* (users, personality, aesthetic direction).
- `docs/PROGRESS.md` — brick-by-brick status, deviations, token changes, what the next brick needs.

## Status

Bricks 0, 1, 2a and **Brick 3** (landing page top) are **done**, on `brick-3-landing-top`. Next: **Brick 4** — the rest of the landing page: the four tools, the problem cards, the live demo, how it works, the preview strip and the trust band. The section ids `#tools`, `#how-it-works` and `#trust` are already reserved by the nav and the hero's second button, so those are the ids to create. Brick 2b's remaining pieces (Combobox, CountryCombobox, Dialog, Tabs, progress ring and bar) are still unbuilt and now belong to whichever brick first needs them — the interactive card landed in Brick 3.

## Project conventions

- **Stack:** Vite 7 + React 18.3.1 (pinned by hand) + TS 5.9 strict. Tailwind v4.3 CSS-first (`@tailwindcss/vite`, no config file). shadcn/ui copied into the repo, from Brick 2.
- **Package manager:** npm. Pin exact versions, add one dependency at a time.
- **Tokens only.** No raw hex/rgb/hsl outside `src/styles/tokens.css`; no `px` except 1px hairlines; spacing only from the ten spec steps.
- **Four gates enforce the rules:** ESLint flags arbitrary Tailwind *values* (`w-[437px]`; arbitrary *variants* allowed) and off-scale spacing steps (`p-5`, `gap-7`). Stylelint bans px-except-1px, raw colour functions outside `tokens.css`, and any padding/margin/gap/inset value that is not `var(--space-*)`, `0`, `auto`, a section/container token or an aurora geometry token.
- **Spacing naming trap:** spec `space-5` is Tailwind `p-6`. The ten spec steps are Tailwind 1, 2, 3, 4, 6, 8, 12, 16, 24, 32. Mapping table in spec §6.
- **Layout primitives exist — use them.** `src/components/layout/`: Container, Section, Stack, Cluster, Grid, Bento(+Item), Heading, Text, VisuallyHidden, Cq. Polymorphic, ref-forwarding, spacing props typed to the ten steps. Never hand-roll layout; only Heading and Text set a font size.
- **Shared components exist — use them.** `src/components/ui/`: Button, Input, Textarea, FormField, Card (+Header/Title/Description/Content/Footer), **InteractiveCard**, Chip, StatusBadge, DemoBadge, Disclaimer, Skeleton, EmptyState, ErrorState, Toaster+`toast`, **Sheet**, Avatar, UniversityLogo, SafetyRail, RedactionNotice, and `icons`. Variant definitions live in sibling `*-variants.ts` files (fast-refresh rule). Reuse `ThemeToggle`.
- **shadcn/ui is vendored, not adopted.** `src/styles/shadcn.css` aliases every shadcn CSS variable onto a Harbour token and **never** touches the radius namespace, so `rounded-md` is Harbour's 1rem. `components.json` and the `@/` alias (tsconfig + vite) exist so `npx shadcn add` lands correctly — but fix any off-scale spacing it brings to the §6 table, never disable the gate.
- **Icons are lucide-react** (1.55.0, pinned) behind `src/components/ui/icons.tsx`, which keeps the pre-Brick-3 wrapper API: same names, default `size-4`, `aria-hidden` by default, one stroke weight. lucide's px `size` prop is deliberately not exposed, so `size={18}` is a type error. This is a **documented deviation from spec §2**. `createIcon` is in the ESLint react-refresh `extraHOCs`.
- **`src/components/ui/university-logos.ts`** is spec §10's table as a typed manifest; `UniversityLogo` resolves through it with an `id`. **No university logo file exists in the repo** — all eight manifest paths 404 by design and every box falls back to its acronym. Dropping a file at `/public/logos/<id>.svg` is the only change needed.
- **`--border-strong`** (#74938f dark / #5f7a76 light) is the border token for when a border is a surface's *only* boundary (the flat Card). `--border` stays decorative. Both are checked by the contrast script.
- **Gates:** `npm run typecheck`, `lint`, `lint:css`, `build`, `test:e2e` (105 Playwright + axe tests).
- **Theme:** dark default; dark and light designed separately. `data-theme` + `color-scheme` on `<html>`. The mode is a **raw string** under `harbour:theme` so the pre-paint script can read it.
- **Profile storage keys:** `harbour:v1:profiles`, `harbour:v1:activeProfileId`, `harbour:theme`.
- **Motion:** animate `transform` and `opacity` only; GSAP for landing/scroll/SVG, Motion for component state, Lenis on landing only.
- **Never:** a card inside a card; glass on glass; more than three glass surfaces on screen.
- **Aurora caps are solved, not guessed.** `scripts/solve-aurora-cap.mjs` prints **twelve** surfaces × seven text tokens in both themes (4.5:1, with a 3:1 large-text rescue), the component pairs (text-on-fill 4.5:1; focus-ring, border-strong and the chart palette 3:1), and **four** solvers — `--aurora-blob-opacity`, `--aurora-patch-opacity`, `--aurora-hero-opacity` and `--spotlight-alpha`. It exits 1 on any miss and rejects any cap above its solved maximum, so **lowering a cap is always safe and raising one is never silent**. Three surfaces carry a narrowed `tokens` list and four carry `soleBoundary: false`; those cells print with `~` (not gated) and `°` (rescued by the allowance). `!` is the only failure.
- **`--aurora-hero-opacity` is 0.59 in dark** — 3.3× the page aurora. It is allowed that high because the only text on the bare hero patch is the display headline (44px+, so the 3:1 allowance applies, measured at 3.94:1) and everything else in the hero sits on the copy panel's glass. This is the first place the allowance is actually spent. If it reads too hot, lower the token — one value, always gated.
- **The interactive card's pointer handlers sit on an untransformed wrapper** (`.ui-card-hit`), not on the card. The card lifts and rotates, so its own box moves under the pointer and a pointer near an edge would flicker. Same reason the spotlight is measured from the wrapper.
- **`gsap/CustomEase` has a default export only.** `import { CustomEase } from 'gsap/CustomEase'` type-checks and is `undefined` at runtime — and since `CustomEase.create` runs at module scope it takes the whole bundle down. Typecheck, lint and build stay green while every page is blank.
- **Vite `server.host` pinned to `127.0.0.1`** (Vite's `localhost` resolves to `[::1]` here). `npm run dev:lan` for real devices.
- **Playwright's `outputDir` is `path.join(tmpdir(), 'harbour-pw-results')`.** The workspace is on the mapped `R:` drive, where Playwright's pre-run cleanup goes through the OS trash and fails once the directory holds a few hundred files — which a retried matrix reaches. Do not point it back at the workspace.

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
- **Brand assets are in `public/`** (`harbour-logo.svg`, `harbour-mark.svg`, `favicon.svg`) — **untracked, unused, use only on request.** They are **light-background lockups**: the `#0B3935` wordmark is unreadable on the dark theme's `#061B1A`, and the logo carries hard `width`/`height` so it will not scale. Brick 3's nav wordmark is set in the heading face instead. A dark variant is needed before these can be used.
- **The dark hero patch may be too hot** — it sits at the solved ceiling (0.59) and reads as a solid teal field rather than an aurora at 1440px. Flagged to the user with the screenshot; the fix is one token.
- **Lenis is verified by hand, not by the suite.** The tests scroll programmatically, which Lenis passes through; the smooth-wheel path is untested.
