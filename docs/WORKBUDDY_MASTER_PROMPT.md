# HARBOUR: 48-HOUR MASTER PROMPT (autonomous, read fully first)

Deadline is in 2 days. The owner has lost days to slow gate-by-gate builds. Read this whole file, then work through the phases in order WITHOUT asking for approval between them. Ask a question only if blocked for more than 10 minutes. Log each decision as one line in `docs/DECISIONS.md`. Never put internal labels ("Brick 4", "in progress", dev notes) in the UI; dev-only text must sit behind `import.meta.env.DEV`.

## 1. What is wrong today (verified in this repo)

1. `/login`, `/signup` and every `/app` page do not exist in v2. App.tsx sends unknown paths to `/`, so Log in "does nothing". The old build already has all of them, working.
2. A dark empty strip sits between the nav and the hero (AuroraPatch starts below the nav with a hard top edge).
3. Theme toggle exists only in the footer. Nav anchors (#tools etc.) jump with no motion.
4. `index.html` has no favicon, no boot/loading screen, no meta tags. Lazy sections use `<div />` as fallback (no skeleton).
5. Hero art slot is an empty placeholder. No illustration, no mascot, no boats, sea, birds, skyline. WaveLine is a thin line that reads as a rule, not a hero.
6. Light theme is flat. Landing grid has uneven bento gaps. Sections all look alike.
7. University logos are bundled-file only and the files do not exist. Profiles get no avatar.
8. Chat answers are slow (no streaming).
9. Stale strings like "BRICK 3 · LANDING PAGE IN PROGRESS" ship in the footer.

## 2. Strategy: PORT the old working build, then make it alive

Old build: `Harbour-oldbuild/Harbour/harbour/` (client = React JSX, server = Express, 16 pages, data JSON, `LandInScene.jsx` Three.js scene, `BunnyGuide.jsx` mascot, protected ripple intro `ArrivalTransition` in `client/src/App.jsx`, `public/hong-kong-harbour.png`). Do not rewrite its logic.

- Copy `harbour/server` to `./server` unchanged. Add `concurrently`; `npm run dev` starts server (port 5000) and Vite (port 5173, proxy `/api` to 5000). Create `server/.env` from `.env.example` (keys: GEMINI_API_KEY, GROQ_API_KEY, BAIDU_APP_ID, BAIDU_SECRET_KEY, optional DEEPSEEK_API_KEY). Every AI feature must still work with no keys (existing deterministic fallbacks).
- Copy `harbour/client/src` pages, components, hooks, context, lib, data to `src/legacy/` as JSX. Enable `allowJs`. EXCLUDE `src/legacy/**` from ESLint strict rules, Stylelint (px, spacing, raw colour bans) and tsc strictness. Those gates are for NEW code only.
- Legacy CSS: do not import legacy `tokens.css`. Create `src/styles/legacy-compat.css` that aliases every CSS variable the legacy CSS uses (find them with a script that greps `var(--`) to v2 tokens, so old pages inherit the new palette, fonts and both themes. Legacy and v2 both use `data-theme` on `<html>`, so one toggle drives both. Remove the legacy Shell's own dark-mode state; use v2's theme engine. Keep legacy calm mode (`data-calm`).
- Mount legacy routes under `/app/*` (home, shield, checklist, translate, chat, rental, dashboard, people, community, tide-bank, voice-sos, profile). Port the legacy Shell (top nav, mobile tab bar, More menu) as `AppShell`, restyled with v2 glass and the compact ThemeToggle.
- Profile storage adapter: legacy reads `harbour-profile` = `{name, country, university, socials:{}}` (country and university are display strings). New signup/login MUST write this exact shape (plus `avatar`), and also keep a list of profiles in `harbour:v1:profiles`. Selecting a profile on login copies it into `harbour-profile`.

## 3. Rules that save time

- Gate policy: ONLY `npm run build` plus `node scripts/smoke.mjs` after each phase. `smoke.mjs` (Playwright, 1440 and 390, dark and light) loads `/`, `/signup`, `/login`, creates a profile, lands on `/app/home`, opens every `/app/*` route, and fails on any console error or horizontal scroll. Run the full test matrix and contrast scripts ONCE, in Phase 5, on new-lane files only.
- Use libraries instead of hand-coding. Install: `gsap` (ScrollTrigger, MotionPath, SplitText are free), `lenis`, `motion`, `lucide-react`, `@lottiefiles/dotlottie-react` (ready-made boat, wave, bird, confetti animations; check each licence), `driver.js` (tour), `howler`, `react-speech-recognition`, `dexie`, `to-jyutping`, `opencc-js`, `@dicebear/core` + `@dicebear/collection`, `canvas-confetti`, `ai` (Vercel AI SDK) for streaming. Verify names and licences at install, one dependency at a time, pinned.
- After each phase: build green, screenshots to `screenshots/phase-N/` (landing, login, signup, home at 1440 and 390, dark and light), 10-line summary in `docs/PROGRESS.md`. Then continue.
- The "known failures" list in section 1 is re-checked by `smoke.mjs` where it can be (no strings containing "Brick"; favicon link present; `/login` returns the login page).

## 4. Phases

**P0 (1h): visible quick wins**
- Favicon from `src/assets/brand/original/favicon.svg` (copy to `public/`), `<link rel="icon">`, apple-touch icon, theme-color, title, OG tags.
- Boot splash in `index.html` (pure HTML/CSS, before JS): mark, soft ripple, mascot silhouette; fades out on first paint; minimum 600 ms, maximum 1.8 s.
- Remove the dark strip: nav is transparent over the hero, hero patch runs under it (`margin-top: calc(var(--nav-height) * -1)`), nav gains glass on scroll.
- ThemeToggle (compact icon button) in the nav, landing and app.
- Smooth anchor scrolling: Lenis anchors with offset = nav height, `scroll-padding-top`, 1.1 s ease.
- Delete all stray dev labels. Real skeletons for lazy sections.

**P1 (3h): the app works**
- Server and legacy lane running, compat CSS, AppShell, all `/app/*` routes load with no console errors, profile adapter. `/login` and `/signup` temporarily render the legacy `Login.jsx` and `Onboarding.jsx` so the whole flow works today.

**P2 (2h): real signup and login**
- Signup: nickname, country (`i18n-iso-countries`, with overrides so Hong Kong, Macao and Taiwan always read "Hong Kong, China", "Macao, China", "Taiwan, China"; unit-tested), university (the eight UGC-funded universities in the legacy `hkUniversities.js`, logo from `https://www.google.com/s2/favicons?domain={domain}&sz=128`, falling back to the acronym in the logo box on error; CUHK and HKBU keep their monogram flag), optional "other / not enrolled".
- Avatar: auto-assigned neutral avatar from DiceBear (deterministic from nickname; a neutral CC0 style such as `thumbs` or `notionists-neutral`) with a shuffle button. Show it in nav, profile and login picker.
- Login: saved-profile picker (chips with avatar, name, flag, university logo), "Create new profile", remove-from-device with confirm, honesty line: "Real accounts and passwords are not enabled in this prototype. Profiles live on this device only."
- Keep the protected ripple/arrival transition (landing to login or signup) exactly as in the old `ArrivalTransition`. Route guard: `/app/*` without a profile goes to `/login`.

**P3 (5h): make the landing page ALIVE** (this is what judges see)
- Hero: full-bleed illustrated Hong Kong harbour. Use `hong-kong-harbour.png` as the instant poster/LCP, then fade in the legacy `LandInScene` (lazy) on desktop; layered SVG parallax fallback on mobile, low-power and reduced motion. Add: drifting clouds, birds, a red-sailed junk and a ferry crossing on loop, bobbing buoy, animated waves, mascot (restyled `BunnyGuide`, name it) waving on the pier, cursor parallax. Day/dusk in light theme, night harbour with window lights in dark theme. Remove WaveLine from the hero (keep only as a short divider if wanted).
- Scroll story with GSAP ScrollTrigger: a ship travels along an SVG route (MotionPath) down the page, one port stop per section (Land, Sea, Ship, Harbour zones from the old tokens), sky tint shifts per section. Headline reveal with SplitText. Magnetic CTA buttons, tilt cards, count-up numbers.
- Real-data infographics only: a script `scripts/data-facts.mjs` counts items in `server/data/*.json` (scam patterns, glossary terms, checklist steps, services, rental playbook steps) and writes `src/generated/facts.json`; the landing shows them as animated counters and a small chart. NO invented statistics, testimonials or "partner" claims. University strip reads "Made for students at Hong Kong's eight universities".
- Fix the tools grid: even rows, no orphan gaps, each tool card shows its sample and a "Try it" link into `/app/...` after login.
- Illustrations: drop-in SVG concept art from `art/` (isometric flat style with grain, supplied by the owner). Use them for the problem cards, onboarding steps, empty states and 404.
- Redesign the light theme: sea-glass white with soft blue-teal gradients, coloured shadows, illustration-led sections; never flat grey. Sections must not all share one background: shift hue per zone.

**P4 (5h): the product feels smart**
- Chat speed: server streams (SSE) tokens; client shows a typing indicator within 200 ms and the first token within 1.5 s on the fast provider; order Groq, then Gemini, then DeepSeek (OpenAI-compatible, `https://api.deepseek.com`), then a deterministic answer after an 8 s timeout; short system prompt, capped `max_tokens`, a Stop button, cache for common starter questions. Log time-to-first-token in the dev console.
- Translate: mic button with live dictation into the box (browser speech recognition, Cantonese `yue-Hant-HK`, English; server Whisper fallback on browsers without it; note on screen that the browser's speech service processes audio); swap button for reversible direction (English to Cantonese and back) and a "listen to the other person" mode; history per profile in IndexedDB (Dexie) with an off switch and clear button; jyutping via `to-jyutping`; `opencc-js` to normalise to Hong Kong traditional. Scam X-ray pasted text is never stored.
- Speaker button on EVERY Cantonese phrase: tier 1 pre-generated audio files for fixed phrases (script `scripts/gen-phrase-audio.mjs`, run once, committed under `public/audio/`), preloaded when in view and played with Howler; tier 2 browser speech synthesis for dynamic text (zh-HK voice, primed at app start); tier 3 server TTS with an IndexedDB cache. Slow-speed toggle.
- Voice SOS as a simulated voice assistant, always labelled SIMULATION: mic, speech to text, safety keyword check (hurt, attacked, fire and similar words skip the model and show 999 at once), fast model reply, spoken sentence by sentence, transcript on screen, listening/thinking/speaking states, permanent 999 button.
- Guided tour after a fresh signup only (flag on the profile; replay from Profile): `driver.js`, auto-scrolls and auto-advances with progress bar and Pause, Back, Skip; off under reduced motion. Steps: safety rail, tool cards, Ask Harbour, Settle-in list, theme toggle, profile menu. The mascot narrates.
- Home and Dashboard: animated charts, streak, next-step card, weather glance, mascot greeting; skeletons while data loads.

**P5 (2h): ship**
- `vercel.json` check, production build, run full test matrix and contrast scripts on new-lane files only, fix real failures, final screenshot pack, `docs/PROGRESS.md` summary, list of known gaps. Remove dev routes from the production build.

## 5. Owner-facing results to show at the end of each phase

P0: favicon, boot screen, no strip, theme toggle in nav, smooth links. P1: every page opens. P2: sign up, avatar, logo, log in, log out, ripple. P3: lively harbour landing with ship route and mascot. P4: fast chat, mic and speaker, SOS simulation, tour. P5: deployed build.
