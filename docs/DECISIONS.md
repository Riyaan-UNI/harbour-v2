# Harbour Rebuild — Decisions Log

One entry per decision that a future phase must not silently reverse. Newest at the
bottom. Each entry says what was decided, why, and what it costs.

---

## D-001 — The legacy lane is excluded from every gate, not tamed into them

**Phase:** P0 · **Status:** in force

The old build lands at `src/legacy/**` as plain JSX. It is out of the TypeScript
project (`exclude` in `tsconfig.json`), out of ESLint (`ignores`), out of Stylelint
(`ignoreFiles`), and off the design-token gates entirely.

**Why.** The old lane styles with ~162 bespoke CSS variables that predate the token
system. Retrofitting it to `var(--space-N)` and the token palette would mean editing
several thousand lines of working code for zero user-visible benefit — and every one
of those edits is a chance to break a screen that already works. The gates exist to
keep *new* work honest; they do not need jurisdiction over a lane that is frozen.

**Cost.** The legacy lane can drift from the spec without anything shouting. Accepted,
because it is frozen: P2–P5 touch only the auth surface, and the rest is ported as-is.

**Alternative rejected.** Relaxing the gates globally for the legacy paths — that would
have let new-lane files in `src/components/` slip through the same holes.

---

## D-002 — CSS clashes are solved at one seam, by aliasing, not per-clash

**Phase:** P0 · **Status:** in force

`src/styles/legacy-compat.css` redefines every legacy `var(--…)` as an alias onto a v2
token — `--teal-900: var(--accent-fill)`, `--surface-card: var(--bg-elevated)`,
`--font-display: var(--font-heading)`, and so on. Nothing in the legacy lane changed;
it simply resolves its own names to the new values.

**Why.** This was the owner's explicit instruction, and it is also the only approach
that scales: fixing clashes one by one means every future legacy screen is a new
clash. One alias table means one place to look when a colour is wrong.

**The trap we sidestepped.** The legacy `tokens.css`, `accessibility-theme.css` and
`prototype-landing.css` are **not** imported at all. Importing them after the compat
layer would re-declare the old palette *on top of* the aliases — the aliases would
still resolve, but to the old values. Ordering here is the whole game: v2 sheets,
then the compat layer, then the legacy sheets that contain only rules.

**Cost.** Three legacy stylesheets are dead weight in the repo. They are kept beside
their siblings for reference and are inert.

---

## D-003 — The legacy router is rebased at the edge, not at its call sites

**Phase:** P1 · **Status:** in force

`src/legacy/router.jsx` re-exports `Link` and `useNavigate`, mapping a legacy root
path (`/home`) onto its nested one (`/app/home`) at call time. All 13 legacy files
that imported `react-router-dom` were switched to import this shim instead.

**Why.** The alternative was editing every `to=` and `navigate()` in the legacy lane,
which is dozens of sites and guarantees a miss. Rebasing at the edge means the legacy
code keeps saying `/home` and the router quietly does the right thing. Entry routes
(`/login`, `/signup`, `/onboarding`) pass through untouched, as do hashes, absolute
URLs and external links.

**Gotcha recorded.** `AppShellRoutes.tsx` must use **relative** child paths under the
`/app/*` parent (`path="home"`, not `path="/app/home"`). An unmatched child route in
a nested `<Routes>` renders nothing and logs nothing — the failure is a blank `<main>`
with a clean console. This cost real time in P1.

---

## D-004 — The boot splash has a floor and a ceiling, armed outside React

**Phase:** P0 · **Status:** in force

`index.html` carries a static splash. `main.tsx` removes it between a 600 ms floor
and an 1800 ms ceiling, with both timers armed at module load rather than inside an
effect.

**Why the floor.** A splash that flashes for 80 ms is worse than no splash.
**Why the ceiling.** If the bundle throws before mounting, an effect-based timer never
arms and the user stares at a splash forever. Arming at module load means the worst
case is still a page they can use.

---

## D-005 — The old build carries its own `.git` and stays untracked

**Phase:** P1 · **Status:** in force

`Harbour-oldbuild/Harbour/` has a nested repository. It is now ignored at
`/Harbour-oldbuild/` and was force-removed from the index before the P1 commit.

**Why.** Git would otherwise stage it as a gitlink — a submodule pointer with no
`.gitmodules`, which clones as an empty directory. It is a working reference, not a
dependency.

**Related.** `/screenshots/` is ignored, so the owner-facing packs are added with
`git add -f`. Phase-0's pack is 15 MB and is deliberately not tracked; phase-1's
(1.6 MB) is.
