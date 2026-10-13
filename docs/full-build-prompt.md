# Harbour v2 — Full Build Prompt

This document is the master prompt for rebuilding Harbour: bringing every feature and workflow
from the old working site (`./Harbour-oldbuild`) onto the new design system in this repo,
brick by brick.

How to use it: start a fresh agent session on this workspace and paste everything between the
`===== PROMPT START =====` and `===== PROMPT END =====` markers as your first message. It is
written to be self-contained, but the agent will also read the project docs named inside it.

---

===== PROMPT START =====

# Your mission

You are rebuilding **Harbour** — a safe-harbour web app for international students arriving in
Hong Kong — on top of the new design system that already exists in this repository. An older,
fully working version of Harbour sits in `./Harbour-oldbuild`. Your job is to bring across
**every feature and workflow** from the old version, rebuilt in the new design language,
one brick at a time. You are not reskinning the old site and not rewriting the new one —
you are porting *what Harbour does* into *what Harbour now looks like*.

# The two codebases — get this separation right

**1. `./Harbour-oldbuild/` — the OLD Harbour. Read-only reference.**

- It contains the complete old product: a React front end (plain JSX, no TypeScript) and a
  Node/Express server. Its pages, components, copy, safety rules and server routes show you
  what Harbour must *do*.
- Read it freely. **Never modify anything inside it. Never copy its UI.** Banned by the
  project docs and by me: its palette, its typography, the bunny, the garden, the harbour
  scene, the identical card grids, the portal/arrival animation, and its old loading screen.
  (See `docs/SPEC_ADDENDUM_1.md` sections 0 and 6.)
- Old features that are **not** in the addendum's feature map (for example the bunny garden
  and the prototype landing page) are out of scope by default. If you think something there
  deserves to survive, list it and ask me — do not silently carry it over.

**2. The repo root — the NEW Harbour. Your foundation.**

- Vite 7 + React 18 + TypeScript (strict) + Tailwind v4 (CSS-first) + vendored shadcn/ui.
- Bricks 0 through 3b are done: design tokens, the theme engine, the aurora system, layout
  primitives, about two dozen shared UI components, and the top of the landing page. This is
  the finished visual language. **Extend it; do not fork it, do not re-style it, do not
  introduce a second design language.** Every new screen must look like it belongs to the
  pages that already exist.
- There is no backend in the new repo yet. See "The backend question" below.

# Sources of truth — read these before you propose anything

1. `docs/SPEC_ADDENDUM_1.md` — **the product contract.** Section 3 is the feature map (what
   must exist, at which routes); section 2 is twelve non-negotiable product rules (four states
   on every data screen, honesty labelling, safety one tap away, privacy by demonstration,
   deterministic fallbacks, 44px targets, reduced motion, the country-name rule, the voice,
   the handoffs between tools). These apply to every screen you build.
2. `docs/DESIGN_SPEC.md` — every concrete design value: tokens, the ten spacing steps, the
   type scale, radii, motion durations. **If a value is not in it, ask me — never invent one.**
   (Remember the spacing trap: spec step 5 is Tailwind's `p-6`; the mapping table is in the spec.)
3. `.impeccable.md` — the design *intent*: who Harbour is for, the personality (calm, warm,
   direct), the aesthetic direction (restrained glass, futuristic edge, dark default, light
   designed separately), and what we are explicitly against.
4. `docs/PROGRESS.md` — brick-by-brick status, deviations, token changes, and what the next
   brick needs. Trust it over your own assumptions about what exists.
5. `.workbuddy-ai/skills/harbour-ui/` — the nine builder rules, the per-brick workflow, the
   verification checklist and the read-only token audit script. **Follow this skill.**
6. `docs/files/` — the art concepts: `harbour-hero-concept-01.png`, its `.svg` source, and
   the Python generator that produced them. They define the art direction (isometric terrace,
   small figures climbing steps, four floating tool tiles, a warm sun, film grain). Use them
   as **visual direction** when you build hero art, illustrations or empty states — reimagined
   in the new design language, not dropped in as-is. Ask before generating any new art.

# The feature set to bring across

Audit the old build first — read the code, do not trust this list blindly. Known old routes:
`/` (Welcome), `/login`, `/onboarding`, `/home`, `/dashboard`, `/profile`, `/people`,
`/bunny-garden`, `/shield`, `/rental`, `/translate`, `/checklist`, `/chat`, `/community`,
`/voice-sos`, `/tide-bank`, plus a Node/Express server with routes for chat, translation,
counter cards, rental checks, the scam drill, impact counters and static data.

Then produce an inventory table with one row per feature:

| Old route / module | What it does (verified from code) | Target route (per addendum §3) | What must change for the new product rules and design |

Notes for the audit:

- The addendum's feature map is the target list, and the names have shifted: e.g. old
  `/shield` becomes Scam Shield (`/app/scam`) with Scam X-ray and Scam Drill tabs; old
  `/translate` becomes the Cantonese helper (`/app/helper`) with Translate and Counter card
  tabs; old `/rental` becomes Rental Shield (`/app/rental`) with listing check, lease X-ray
  and the first-hour playbook; People, Community, Tide Bank and Voice SOS survive only as
  clearly labelled simulations/samples.
- Old features that are simulations must be rebuilt **honest**: SIMULATION, DEMO or SAMPLE
  labels, a failed state where the old build had none (Voice SOS), and no copy that implies a
  real human, a real call, or real money.
- The safety numbers and all Cantonese copy carry over from the old repo's constants **only**
  as starting points — they are marked unverified in the project and must be checked against
  official sources before shipping. Never type such numbers from memory.
- The old AI features must degrade gracefully: every AI-powered screen needs a deterministic,
  offline fallback (the old build's MOCK_AI mode is a useful reference pattern).

# The new loading screen (specific requirement)

Build a **new** loading / arrival screen that belongs to the *new* Harbour:

- New visual language: the aurora, the glass treatment, the WaveLine, the Harbour mark —
  tokens only, both themes designed separately, reduced-motion respected, and nothing that
  flashes the wrong theme (the app reads the saved theme before paint — keep that working).
- It must hand off cleanly into whatever comes next (landing for guests, home for a returning
  profile) and must not block the first meaningful paint for more than a moment on a slow
  phone.
- It is covered by the normal definition of done, including keyboard and axe.
- **Do NOT port the old build's arrival transition** (the rippling circle, the moving ship,
  the Three.js scene, the portal). That is explicitly banned. If you want to propose a
  loading-screen concept, sketch it in words first and ask me before building.

# How to work — brick by brick

- **One branch per brick**, named `brick-N-short-name` off the previous brick's branch.
  Small commits with clear messages; stage explicit file paths, never `git add -A`.
- **The definition of done for every brick** (from the harbour-ui skill — do not shortcut it):
  both themes; 320 / 360 / 390 / 768 / 1024 / 1440 px; 200% zoom **and** 200% text size;
  keyboard only; reduced motion; no raw colours outside `tokens.css`; no `px` beyond 1px
  hairlines; no off-scale spacing; axe clean (no serious or critical violations);
  `scrollWidth <= clientWidth` at every width; **screenshots shown to me**; all gates green:
  `npm run typecheck`, `lint`, `lint:css`, `build`, `test:e2e`.
- Reuse what exists: the layout primitives (`src/components/layout/`) and the shared
  components (`src/components/ui/`). Never hand-roll layout, never rebuild a component that
  exists, and never put a card inside a card or glass on glass.
- At the end of each brick: update `docs/PROGRESS.md`, commit, then give me a short report
  (what shipped, what deviated, screenshots, anything flagged). Then continue to the next
  brick only after I have seen it.
- Environment quirks that will waste your time if ignored: the Vite dev server is pinned to
  `127.0.0.1` (`npm run dev:lan` for real phones); Playwright results must go to the OS temp
  directory (already configured — point nothing back at the workspace drive on `R:`); and
  `gsap/CustomEase` has a **default export only** — `import { CustomEase } from 'gsap/CustomEase'`
  type-checks, is `undefined` at runtime, and blanks every page. Check it before you trust it.

# The backend question — bring it to me early

The old build has a real Node/Express server (AI chat, translation, rental analysis, scam
drill, impact counters). The new repo has none. This is the biggest scope decision in the
project, so do not decide it alone. Prepare the options in plain English — (a) build the front
end against deterministic mock data first and port the server later, (b) port the server
alongside the front end from the start, (c) something in between per feature — with what each
means for honesty labelling, offline behaviour and effort, plus your recommendation. Wait for
my pick. Until then, design every data screen so the four required states (empty, loading,
result, error) exist and a mock can sit behind them.

# Other things to ask me about — never guess

- Any new npm dependency (one at a time, with a one-line justification and size impact).
- Any new design token value, any change to the aurora caps (lowering a cap is safe; raising
  one is never silent), any change to the landing page copy.
- Anything ambiguous you find in the old build's workflows, and any Cantonese or safety copy
  before it ships.
- Anything that would change what the user stores on the device: profiles live under
  `harbour:v1:profiles` and `harbour:v1:activeProfileId`, the theme under `harbour:theme`.
  Do not change those formats without me.

# How to ask me questions — this matters as much as the code

I am not a developer. Talk to me like a smart friend who does not know the jargon:

- **Plain English only.** If a technical word is unavoidable, explain it in the same sentence
  with everyday words.
- **One topic per question.** Offer me 2–3 concrete options, each with a plain-language
  "what you get / what you give up", tell me which one you recommend and why in one sentence,
  and let me pick.
- **Translate our own jargon when you use it.** For example: "brick" means one chunk of work
  that gets finished and shown to you; "gate" means an automatic check that must pass;
  "token" means a named design value such as a colour or a spacing step; "front end" means
  what you see in the browser; "backend" means the behind-the-scenes part that does the
  thinking and storing.
- If you are ever about to guess on something that affects the look, the size/performance, the
  safety copy, or what gets stored on my device — **stop and ask instead.**

# Your first response — before writing any code

1. Read all the sources of truth above.
2. Audit the old build and produce the feature inventory table.
3. Then give me, in this order: (a) the inventory table, (b) the brick plan you propose —
   which features in which brick, and why that order, (c) the backend question with your
   recommendation, (d) anything you found in the old build or the docs that contradicts
   anything else, and any old feature you think deserves a second chance.
4. Wait for my approval. Do not start coding until the plan is approved.

===== PROMPT END =====
