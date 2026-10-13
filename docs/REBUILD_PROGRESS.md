# Harbour v2 — Rebuild Progress (P0 → P5)

This is the phase tracker for the full port driven by
`docs/WORKBUDDY_MASTER_PROMPT.md`. It runs **alongside** `docs/PROGRESS.md`, which
covers the earlier brick-by-brick build.

Gate results are from the run immediately before each commit. A phase is only marked
done when all five gates pass and the owner's checks for that phase have been verified
in a real browser.

| Phase | Scope | Status | Commit |
| --- | --- | --- | --- |
| **P0** | Quick wins: favicon, meta, boot splash, dark strip, nav theme toggle, gliding anchors | **DONE** | `09d0543` |
| **P1** | Two-lane port: server, legacy lane, router, guard, every `/app` route | **DONE** | `0b044ec` |
| **P2** | Real signup and login: nickname, country, university, avatar, saved-profile picker | Next | — |
| **P3** | Alive landing page: hero art, parallax, GSAP ship route, facts, light theme | — | — |
| **P4** | Streaming chat, translate, Voice SOS, driver.js tour, animated home | — | — |
| **P5** | Production config, full matrix, contrast pass, final screenshots | — | — |

---

## P0 — Visibly fixed: the four owner checks

Committed `09d0543`.

All four checks the owner listed were verified in the browser, not inferred from code:

1. **Favicon in the tab.** `/favicon.svg` serves `200 image/svg+xml` and
   `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` is in the served
   HTML. Apple touch icon wired too.
2. **The dark strip above the hero is gone.** The hero field now runs up under the
   nav (`--hero-pull-up`), and the nav is bare over the hero, gaining its glass fill
   only once a 1px IntersectionObserver sentinel scrolls out of view
   (`data-scrolled`).
3. **Theme button in the nav.** `ThemeToggle` grew a `compact` variant — a single
   `size-11` icon button cycling system → light → dark with a spoken label. It sits
   in the landing nav and in the app shell bar.
4. **Nav links glide.** Lenis now takes an `anchors` option whose offset is read live
   from `--nav-height`, so anchor jumps land below the sticky nav rather than under it.

Plus the boot splash (see `docs/DECISIONS.md` D-004), which renders the mark with two
rippling rings, respects `prefers-reduced-motion`, and is gone within 2.5 s.

**Gates:** build ✓ · typecheck ✓ · lint ✓ (0 problems) · lint:css ✓

---

## P1 — The whole app, ported and reachable

Committed `0b044ec`. 147 files staged.

**What works now.** Sign in and every screen from the old build is reachable:

`/app/home` · `shield` · `checklist` · `translate` · `chat` · `community` ·
`voice-sos` · `tide-bank` · `profile` · `profile/:userId` · `people` · `dashboard` ·
`rental`

Signed out, `/app/*` redirects to `/login` and remembers where you were headed.

**How it is put together.**

- **Two lanes, one build.** v2 is `src/**` (TypeScript, strict, token-gated). The
  legacy lane is `src/legacy/**` (plain JSX, outside every gate). See D-001.
- **The seam is CSS variable aliasing.** `src/styles/legacy-compat.css` maps ~162
  legacy variables onto v2 tokens. No legacy call site changed. See D-002.
- **Routing is rebased at the edge.** `src/legacy/router.jsx` maps `/home` →
  `/app/home` at call time. See D-003.
- **The shell is a v2 component.** `AppShell.tsx` ports the top nav, mobile tab bar,
  More panel, calm-mode toggle, toasts, the profile chip and `ArrivalTransition` —
  the protected ripple/ship intro, preserved exactly, still firing only on the
  landing → app crossing and never under reduced motion.
- **The server runs beside it.** `server/**` (Express, 44 files, node_modules and
  `.env` excluded) plus a dev proxy for `/api`. `/api/health` proxies 200 through
  5173 under `concurrently`.

**A striking detail worth noting:** `/login` renders the legacy `LandInScene` — the
full low-poly 3D island in WebGL — beside the ported v2 sign-in panel. The old
WebGL lane and the new token lane coexist in one page with no visual seam.

**Evidence.**

- `smoke.mjs` → *SMOKE PASSED — every route, both viewports, both themes.*
  1440 and 390 px × dark and light: routes resolve, no console errors, no horizontal
  scroll (`scrollWidth <= clientWidth`), no stray "Brick" strings, favicon resolves,
  `/login` and `/signup` do not redirect, `/app/home` is guarded.
- `flow-check.mjs` → *FLOW CHECK PASSED — landing, signup, every app route, guard.*
  Walks the real journey: landing → signup → complete profile → all 12 app routes →
  sign out → confirm the guard.

**Gates:** build ✓ · typecheck ✓ · lint ✓ (0 problems) · lint:css ✓ · smoke ✓ · flow ✓
All five with **zero warnings**.

**Screenshots:** `screenshots/phase-1/` — 25 shots, landing / login / signup / home /
tools / how-it-works across 1440 and 390 px in both themes, plus `shield-1440-dark`.

---

## Notes for the next phase

- **Hero art is still a labelled placeholder.** The landing hero carries a marked
  "ART SLOT" panel. P3 replaces it with `art/harbour-scene-01.svg` as the hero, the
  poster, and the mobile fallback before the 3D scene loads.
- **`art/harbour-hero-concept-01.svg`** is reserved for beside the four-tools section
  in P3.
- **Signup currently uses the legacy flow.** P2 replaces it with the real one:
  nickname, country (with the HK/Macao/Taiwan ", China" overrides, unit-tested),
  university picker, DiceBear avatar with shuffle, and a saved-profile picker on
  `/login` with avatar, name, flag and university logo chips.
- **Three legacy stylesheets are inert** (`tokens.css`, `accessibility-theme.css`,
  `prototype-landing.css`) — deliberately not imported. Do not re-import them.
