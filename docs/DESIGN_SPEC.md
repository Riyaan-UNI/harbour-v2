# Harbour Design Spec v1

For the Harbour rebuild · 11 Oct 2026 · Status: decisions delegated, ready for Brick 0

## 0. How to use this document

This is the single source of truth for the new Harbour UI. Paste the relevant section into the AI coding tool for each brick. If the tool is unsure of a value, it must ask rather than invent one.

**Builder rules (paste at the top of every build prompt)**

1. Tokens only. No raw hex colours, no arbitrary spacing, no font sizes outside this file.
2. Units: rem for spacing, type, radii and sizes; em for media queries; clamp() for fluid values; ch for text width; aspect-ratio for media; svh/dvh instead of vh; fr and minmax() for grids. px only for 1px hairlines.
3. Components never set their own outer margin. Spacing comes from layout primitives (Stack, Cluster, Grid, Section, Container).
4. A card never sits inside a card. At most three glass surfaces on screen.
5. Every colour is a semantic token with both a dark and a light value. Anything new gets both.
6. Every interactive element has hover, active, focus-visible, disabled and loading states, plus a touch equivalent for any hover effect.
7. Animate transform and opacity only. Respect prefers-reduced-motion and prefers-reduced-transparency.
8. Before finishing a brick, test at 360, 390, 768, 1024 and 1440 px wide, in both themes, at 200% zoom, keyboard only. Report anything that fails.
9. Do not touch unrelated files. Ask when stuck.

## 1. Product and tone

Harbour is a safe harbour for international students in Hong Kong. The feeling: someone is here to guide you through rough seas. The visual idea: a storm settling into calm.

Voice: calm, warm, direct, short sentences. No jargon, no hype, and no invented statistics or testimonials anywhere.

The old LandIn Three.js animation and the bunny game are dropped. This is a fresh build with the same functionality.

## 2. Stack

- React 18 + Vite (existing), Tailwind CSS v4 with tokens in CSS, shadcn/ui (Radix) copied into the repo.
- GSAP with ScrollTrigger, SplitText, DrawSVG and MotionPath (all free), Lenis, Motion (motion/react).
- react-hook-form + zod, Zustand with persist, i18n-iso-countries + flag-icons, Fontsource, Recharts.
- Playwright + @axe-core/playwright, Stylelint, ESLint.
- Pin exact versions and add one dependency at a time.
- **CJK font is deferred.** Noto Sans TC is *not* imported in Brick 0 or 1: its CSS alone is ~112 kB (~20 kB gzip) on every page, and no Cantonese copy exists before Brick 5. The font stack keeps `Noto Sans TC Variable` in place, so a CJK glyph falls through to `system-ui`, and `lang="zh-HK"` still selects the right glyphs from whatever the OS provides. Brick 5 adds it back as a lazy import, preferring Noto Sans HK if Fontsource ships a variable build of it.

Roles: GSAP runs the landing timeline, scroll effects and the two SVG scenes. Motion handles React component states and layout animation. Lenis smooths scrolling on the landing page only, and is off in the app and under reduced motion.

## 3. Colour tokens

Dark is the default theme. Dark and light are designed separately, not auto-inverted.

| Token | Dark | Light | Use |
| --- | --- | --- | --- |
| bg | #061B1A | #F2F7F6 | page background |
| bg-elevated | #0B2624 | #FFFFFF | menus, sheets, solid fallbacks |
| glass-fill | rgba(255,255,255,0.06) | rgba(255,255,255,0.62) | glass cards |
| glass-fill-strong | rgba(255,255,255,0.10) | rgba(255,255,255,0.82) | fields, hover, modals |
| border | rgba(255,255,255,0.14) | rgba(11,57,53,0.14) | hairlines |
| text | #EAF5F3 | #0B2B28 | primary text |
| text-muted | #A9C4C0 | #3F5F5B | secondary text |
| text-subtle | #92ACA9 | #496662 | captions only |
| accent-fill | #4FE3D0 | #0B3935 | primary buttons, key fills |
| on-accent | #04201D | #F2F7F6 | text on accent-fill |
| accent-text | #4FE3D0 | #09675F | links, highlights |
| gold-fill | #F1C96F | #F1C96F | highlights |
| on-gold | #2B2000 | #2B2000 | text on gold-fill |
| gold-text | #F1C96F | #7A5A00 | gold used as text |
| danger | #FF8A80 | #B3261E | errors |
| success | #6EE7A6 | #186E44 | confirmations |
| focus-ring | #7CF0E3 | #09675F | 2px ring, 2px offset |
| aurora-1 | #0F6B63 | #BFE5E2 | background blob |
| aurora-2 | #1AA89B | #F7E3B0 | background blob |
| aurora-3 | rgba(241,201,111,0.12) | #E7F1EE | background blob |

Gold is a fill with dark text on it. It is never body text on ivory.

Contrast targets are 4.5:1 for text and 3:1 for UI and graphics. These values were chosen by estimate, so the automated axe check is the authority. If a pair fails, adjust the token, not the component.

`scripts/solve-aurora-cap.mjs` is the authority for text over the aurora and over glass. It composites every non-empty stack of the three blobs at the current cap — bare and under glass — and reports a full matrix of all seven text tokens against seven surface stacks, in both themes. Part A4 widened it from the original two tokens, and three pairs failed:

| Token | Theme | Was | Now | Measured over the worst-case aurora stack |
| --- | --- | --- | --- | --- |
| `--text-subtle` | dark | `#7F9E9A` | `#92ACA9` | 3.42:1 |
| `--text-subtle` | light | `#4F6E6A` | `#496662` | 4.12:1 |
| `--success` | light | `#1B7A4B` | `#186E44` | 3.95:1 |

Nothing else moved. The dark aurora cap also came down (see §4); `--danger` and every other pair cleared 4.5:1 once the cap was re-solved.

**Part A2 widened the same script to the component pairs** the 3:1 rule in this section covers but nothing was checking: `on-accent` on `accent-fill` and `on-gold` on `gold-fill` (still text, so 4.5:1); `--focus-ring`, `--border-strong` and `chart-1` to `chart-5` against every surface (3:1). It reports the full matrix and exits 1 on any miss. `--border` is printed but not gated: at 0.14 alpha it is a decorative divider, never the only boundary of a surface — `--border-strong` is the token for that case.

### Added tokens

Not in the original colour table. All live in `src/styles/tokens.css`.

| Token | Dark | Light | Use |
| --- | --- | --- | --- |
| `--glass-tint` | `rgba(6,27,26,0.55)` | `rgba(242,247,246,0.55)` | painted under the white sheen, so glass is legible over anything |
| `--aurora-blob-opacity` | `0.18` | `1` | cap on the page aurora blobs, so bare text over them stays legible |
| `--aurora-patch-opacity` | `0.29` | `1` | cap on a *contained* aurora patch, which is always covered by glass |
| `--border-strong` | `#74938F` | `#5F7A76` | a hairline that is the *only* boundary of a surface (the flat Card), so it is held to 3:1 by the contrast script; `--border` stays a decorative divider |
| `--mask-opaque` | `#000` | `#000` | the opaque end of the aurora grid's mask gradient; never painted |

### Light neutrals (Part A1)

The light neutrals moved from the warm ivory `#F7F3E9` to cooler sea-glass values, per Addendum 1 §6. `bg` is now `#F2F7F6`, `on-accent` is now `#F2F7F6`, and `--glass-tint` is now `rgba(242,247,246,0.55)`. `bg-elevated` was already `#FFFFFF`. Teal and gold keep their roles; every contrast pair was re-checked and the aurora caps did not move.

### Chart and avatar palette

| Token | Dark | Light |
| --- | --- | --- |
| chart-1 | #4FE3D0 | #0A6F66 |
| chart-2 | #F1C96F | #B7791F |
| chart-3 | #8FA8FF | #3B55D9 |
| chart-4 | #FF9E7A | #C2410C |
| chart-5 | #C79BFF | #7C3AED |

Charts read these through CSS variables (var(--chart-1)), including axes, grid (border token), tooltips (bg-elevated and text) and legends. Never rely on colour alone: use direct labels or markers. Avatars use a chart colour at 20% alpha with the text token on top.

## 4. Glass and background

```css
.glass {
  /* --glass-tint (the page background at 55% alpha) sits under the white sheen,
     so a glass surface is legible whatever is behind it. */
  background-color: var(--glass-tint);
  background-image: linear-gradient(var(--glass-fill), var(--glass-fill));
  border: var(--hairline) solid var(--border);
  border-radius: var(--radius-lg);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.4);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.4);
  box-shadow: inset 0 var(--hairline) 0 var(--glass-highlight), var(--shadow-glass);
}
@supports not (backdrop-filter: blur(1px)) { .glass { background: var(--bg-elevated); } }
@media (prefers-reduced-transparency: reduce) {
  .glass { background: var(--bg-elevated); -webkit-backdrop-filter: none; backdrop-filter: none; }
}
```

Supporting tokens: glass-blur 1.25rem (0.75rem below 40em); glass-highlight rgba(255,255,255,0.22) dark and rgba(255,255,255,0.9) light; shadow-glass 0 1.5rem 3rem -1rem rgba(0,0,0,0.5) dark and rgba(11,57,53,0.18) light.

Rules: glass only sits over the aurora or a colour field. Never put glass on glass; nested elements use solid surfaces. Never animate the blur radius.

**Aurora background:** one fixed layer behind content with three blurred blobs (aurora-1 to 3), each with a static blur of about 5rem and a slow transform-only drift of 30 to 50 seconds. It pauses when the tab is hidden and is static under reduced motion. Add a faint noise overlay (inline SVG feTurbulence at 3 to 4% opacity) to prevent colour banding. An optional 1px grid at about 4% opacity, masked to fade out, gives the futuristic feel.

The blobs carry `--aurora-blob-opacity` — the highest cap at which every text token in §3 still clears 4.5:1 over the *worst-case* stack of all three blobs, since text can land anywhere on the fixed layer. It is 0.18 in dark and 1 in light, and it is solved by `scripts/solve-aurora-cap.mjs`, never guessed. A **contained** patch (`.aurora-patch`, a rounded local colour field) may run hotter via `--aurora-patch-opacity`, because a patch is always covered by glass, and the glass tint is what keeps text legible. Glass is reviewed over such a patch in `/dev/gallery`.

## 5. Typography

- Headings: Bricolage Grotesque, weight 600 to 700.
- UI and body: Geist, weights 400 to 600.
- Labels and small technical text: Geist Mono.
- Chinese: Noto Sans TC as fallback. Mark Cantonese text with lang=zh-HK so the right glyphs render.
- Self-host with Fontsource variable packages, font-display swap, preload the two primary files, and use size-adjusted fallbacks to avoid layout shift.
- If Bricolage Grotesque tests too playful, swap the heading token to Geist weight 600. This is a one-token change.

| Role | Size | Line height | Notes |
| --- | --- | --- | --- |
| Display | clamp(2.75rem, 1.6rem + 5.5vw, 6rem) | 1.05 | tracking -0.02em, max 16ch |
| H1 | clamp(2.25rem, 1.5rem + 3.5vw, 4rem) | 1.1 |  |
| H2 | clamp(1.75rem, 1.3rem + 2.2vw, 2.75rem) | 1.15 |  |
| H3 | clamp(1.25rem, 1.1rem + 0.8vw, 1.625rem) | 1.25 |  |
| Body | clamp(1rem, 0.95rem + 0.25vw, 1.125rem) | 1.6 | max 65ch |
| Small | 0.875rem | 1.5 |  |
| Label | 0.75rem | 1.3 | mono, uppercase, tracking 0.08em |

## 6. Spacing, layout and responsiveness

- Spacing scale: 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8 rem (space-1 to space-10). Nothing outside it. The spec names and Tailwind's numeric steps are different numbers — see the table below.
- Section padding-block: clamp(4rem, 3rem + 6vw, 8rem).
- Container: max-inline-size 75rem (`page`), 65ch (`measure`) or 28rem (`narrow`); padding-inline 1rem, then 1.5rem from 40em, then 2rem from 64em.
- Radii: `--radius-sm` 0.5rem, `--radius-md` 1rem, `--radius-lg` 1.5rem, `--radius-pill`. There is no `xl`. Hairlines are 1px.
- Breakpoints (in em): 40, 48, 64, 80.
- Minimum touch target 2.75rem.
- z-index scale: base 0, raised 10, nav 100, dropdown 200, modal 300, toast 400 — bridged as the Tailwind utilities `z-raised`, `z-nav`, `z-dropdown`, `z-modal` and `z-toast`. `z-10` and friends are not defined.
- Use logical properties (padding-inline, margin-block, inline-size).
- Long text and nicknames wrap with overflow-wrap: anywhere. No horizontal page scroll at any width.

**Spacing: spec names vs Tailwind steps.** These are *not* the same numbers, and confusing them silently produces off-scale values — `space-5` is 1.5rem, which is Tailwind `p-6`, not `p-5` (1.25rem, which is not on the scale). Two gates enforce the table: the ESLint rule `harbour/no-off-scale-spacing` and the spacing rule in `stylelint.config.mjs`.

| Spec name | rem | Tailwind step | Referred to in CSS as |
| --- | --- | --- | --- |
| space-1 | 0.25 | 1 | `var(--space-1)` |
| space-2 | 0.5 | 2 | `var(--space-2)` |
| space-3 | 0.75 | 3 | `var(--space-3)` |
| space-4 | 1 | 4 | `var(--space-4)` |
| space-5 | 1.5 | 6 | `var(--space-5)` |
| space-6 | 2 | 8 | `var(--space-6)` |
| space-7 | 3 | 12 | `var(--space-7)` |
| space-8 | 4 | 16 | `var(--space-8)` |
| space-9 | 6 | 24 | `var(--space-9)` |
| space-10 | 8 | 32 | `var(--space-10)` |

Any other Tailwind step in a `p*`, `m*`, `gap*` or `space-*` utility is an error. `0`, `px`, `auto` and `space-x-reverse` are keywords rather than steps, and are allowed. In CSS, padding, margin, gap and inset declarations may only take `var(--space-*)`, `0`, `auto`, `var(--section-padding-block)`, `var(--container-padding-inline)`, or the aurora blob geometry tokens (which are corner offsets in `%`, not spacing steps). `scroll-margin-*` and `scroll-padding-*` are deliberately not policed — they are scroll-snap offsets, not layout spacing.

**Primitives:** Container, Section, Stack (column with gap token), Cluster (wrapping row), Grid (repeat(auto-fit, minmax(min(100%, X), 1fr)), where X is 14rem, 17rem or 22rem), and Bento (12 columns from 64em, 2 from 40em, 1 below).

**Cards adapt to their own width** using container queries (container-type: inline-size on the card wrapper), not the viewport. A documented `.cq` wrapper carries the pattern, with Tailwind v4 `@` variants for the queries.

**Landing nav:** sticky glass top bar. Logo on the left, links (Features, How it works, Trust), then Log in (ghost) and Get started (primary). Below 48em it becomes a sheet menu with 2.75rem items.

**App nav:** top bar from 64em. Below that, a bottom tab bar with four primary items and a More menu, respecting env(safe-area-inset-bottom). Nothing is hidden behind hover.

## 7. Motion

Tokens: dur-fast 150ms, dur-base 300ms, dur-slow 600ms, dur-scene 1200ms. ease-out cubic-bezier(0.22, 1, 0.36, 1). ease-in-out cubic-bezier(0.65, 0, 0.35, 1). Motion spring stiffness 260, damping 24.

Rules: animate transform and opacity (and SVG path data in the two scenes). Scroll reveals play once. App pages stay mostly still. Under prefers-reduced-motion, show final states with no movement.

### Scene A: Chaos to calm (login, and a once-only hero variant)

- A single SVG, viewBox 0 0 1200 400, preserveAspectRatio none, with vector-effect non-scaling-stroke and a stroke width of 0.125rem.
- The path has 96 points: y is a base line plus amplitude A times a sum of three sine waves plus a little noise. **A is the only animated value**, tweened with GSAP and redrawn in the GSAP ticker.
- Login: A goes from 1 to 0.06 over 1.2s ease-out, then breathes between 0.06 and 0.09 over 6s, looping. Selecting a profile tweens A to 0 over 0.5s, then the route changes.
- Hero: the same 1.2s settle when the section first scrolls into view, no loop, ending at 0.06.
- Stroke is a gradient from accent-text to gold-text. A soft glow copy sits behind a crisp line.
- Pause the ticker when offscreen (IntersectionObserver) or when the tab is hidden.
- Reduced motion: render the calm state (A = 0.06) with no animation.

### Scene B: Route home (signup)

- Two path sets with the same waypoint ids. From 48em, a winding vertical route fills the tall side panel. Below 48em, a horizontal route sits in a band with aspect-ratio 16 / 7.
- Waypoints: Start, Nickname, Country, University, Harbour.
- The route is dotted (stroke-dasharray 0.25rem 0.5rem). A solid progress line is drawn over it with DrawSVG, from 0 to step/4.
- A small ship glyph follows the path via MotionPath with auto-rotate. Each step takes 700ms ease-in-out, and going back reverses the ship.
- A faint ripple appears at each completed waypoint.
- On submit the ship docks, the harbour light pulses for 1s, and the app opens after 1.2s.
- Reduced motion: the ship jumps between waypoints with no travel and no ripples.
- All colours come from tokens.

## 8. Components

- **Button:** primary (accent-fill with on-accent), secondary (glass with border), ghost, danger. Heights: 2.75rem default, 3.25rem large, 2.25rem small on pointer:fine devices only. Loading state keeps the width and replaces the label with a spinner.
- **Input:** 2.75rem tall, glass-fill-strong background, label above, helper text below. Errors use the danger token plus an icon, with aria-describedby.
- **Combobox:** shadcn Command in a Popover from 48em, a bottom sheet (Vaul) below. Rows at least 2.75rem, type-ahead, an empty state (No match), full keyboard support.
- **Card variants:** static (glass), interactive (glass plus effects), flat (hairline only, no glass).
- **Interactive card behaviour:** a pointer spotlight (CSS variables --mx and --my set in a rAF-throttled pointermove); a tilt of at most 6 degrees only when (hover: hover), (pointer: fine) and motion is allowed; click or tap expands in place (Motion layoutId, Esc closes). Focus-visible mirrors hover. Touch devices get tap-to-expand and nothing depends on hover.
- **Toast:** Sonner themed with tokens, 4s, polite aria-live.
- **Avatar:** one or two initials on a 20% chart colour, with the text token.
- **UniversityLogo:** a square box (aspect-ratio 1) on a white plate in both themes, radius md, padding 0.375rem, sizes 2rem, 2.5rem and 3rem. The image uses object-fit contain, lazy loading and the full name as alt text. On load error, the box shows the acronym in Geist Mono weight 600 in dark teal text on the plate, so there is no layout shift.
- **ThemeToggle:** a three-state segmented control (System, Light, Dark) with icons and labels and aria-pressed.

## 9. Landing page

**Hero.** Eyebrow (mono): FOR INTERNATIONAL STUDENTS IN HONG KONG. Headline: Your safe harbour in Hong Kong. Subhead: Language, scams, loneliness — the things nobody warns you about. Harbour helps you through them. Buttons: Create your profile (primary, goes to signup) and See how it works (ghost, scrolls). Aurora background with the WaveLine across the lower third.

**Problem.** H2: Arriving is the easy part. Three interactive cards:

1. Lost in translation. Front: Staff, landlords and forms in Cantonese. Expanded: Most daily admin assumes you speak Cantonese. Harbour turns what you hear and what you need to say into short, clear sentences.
2. Scams that find newcomers. Front: Fake internships, rental traps, offers that are too good to be true. Expanded: Harbour helps you spot the warning signs before you pay or share anything.
3. Alone in a full city. Front: A fixed routine and cliques make it easy to feel invisible. Expanded: Harbour connects you with people who have been where you are.

**Live demo.** H2: Say it your way. We will make it clear. A text box prefilled with a sample, a button Make it clear, and an output showing a short English sentence and a Cantonese version. Canned examples only, no API, labelled Demo. Samples:

- Input: Hi uh sorry, so I was wondering if maybe you could, like, take me to Central station, the MTR one, if it is not too much trouble? Output: Please take me to Central MTR station. / 唔該，我想去中環站。
- Input: Um, my landlord says I have to pay two months deposit but I do not understand if that is normal. Output: Is a two-month deposit normal for a rental? / 請問租屋要俾兩個月按金係咪正常？

**Four things Harbour does.** H2: Four things Harbour does for you. A bento grid of expandable cards:

- Settlement Assistant: Ask how to get set up — SIM, bank, Octopus, housing — in your own language.
- Anti-Scam Centre: Flag suspicious messages and offers. Sensitive details are hidden.
- Translation Gateway: Speak or type. Get one short sentence in Cantonese.
- Voice SOS and Community: Need a hand with an errand? Ask, and a Cantonese-speaking student can help.

**How it works.** H2: Three steps to feeling at home. 1) Create a profile, it takes a minute. 2) Tell Harbour what you need. 3) Get clear help, or ask a person. The active step highlights as you scroll.

**Tide Bank.** H2: Teach an hour. Learn an hour. Body: Swap skills with other students. Help someone, and earn credit to spend on help you need.

**Trust.** H2: Built to be careful with you. Three points: Your profile stays on this device. Sensitive details are hidden before anything is stored. Designed with Hong Kong privacy and AI rules in mind.

**Final call.** H2: Come in from the storm. Buttons: Create your profile, Log in. Footer: logo, links, theme toggle, small print.

## 10. Signup, login and profiles

**Layout for both pages.** From 48em, a split layout: the form column (max 28rem) beside a scene panel with min-block-size 100svh. Below 48em, the scene is a band with aspect-ratio 16 / 7 above the form.

### Signup (three steps, Route home)

1. Nickname. Label: What should we call you? Trimmed, 2 to 20 characters, unique on this device (case-insensitive). Helper: You do not have to use your real name.
2. Country. Label: Where are you from? Searchable combobox over i18n-iso-countries with flag-icons SVG flags. Stored as an ISO alpha-2 code. Do not use flag emoji.
3. University. Label: Where do you study? Dropdown with the logo, full name and acronym in each row.

| id | Name | Acronym | Logo file |
| --- | --- | --- | --- |
| hku | The University of Hong Kong | HKU | /logos/hku.svg |
| cuhk | The Chinese University of Hong Kong | CUHK | /logos/cuhk.svg |
| hkust | The Hong Kong University of Science and Technology | HKUST | /logos/hkust.svg |
| polyu | The Hong Kong Polytechnic University | PolyU | /logos/polyu.svg |
| cityu | City University of Hong Kong | CityU | /logos/cityu.svg |
| hkbu | Hong Kong Baptist University | HKBU | /logos/hkbu.svg |
| lingnan | Lingnan University | LU | /logos/lingnan.svg |
| eduhk | The Education University of Hong Kong | EdUHK | /logos/eduhk.svg |
| other | Other / not enrolled yet | none | generic icon |

Logos are bundled in the repo, never hotlinked. The acronym fallback in the logo box covers any missing or broken file.

Behaviour: Back and Next buttons, Enter advances, focus moves to the new step heading, steps are announced in an aria-live region. Final button: Enter Harbour. On success the profile is saved, set active, the arrival animation plays, and the app opens.

### Login (profile picker)

- Heading: Welcome back. Subhead: Choose your profile.
- Each saved profile is a real button showing avatar, nickname, country flag and a small university logo.
- The list is capped at max-block-size 60svh and scrolls. A Create new profile button sits below.
- Remove from this device sits in a profile menu behind a confirmation dialog. Manage profiles also offers export and import as JSON.
- Selecting a profile flattens the WaveLine, then opens the app.
- Empty state: a single Create your profile button.
- There is no passcode. Anyone with access to this browser can open any profile, so profiles hold no sensitive content.

### Profile store

```ts
type Profile = { id: string; nickname: string; countryCode: string; universityId: string; createdAt: string };
// keys: harbour:v1:profiles, harbour:v1:activeProfileId, harbour:theme
```

Use Zustand persist with a versioned schema and zod validation on read. Wrap every storage access in try/catch. If storage is blocked, fall back to memory and show a banner: Profiles cannot be saved in this browser mode. Generate ids with crypto.randomUUID(). App routes require an active profile, otherwise redirect to login.

## 11. Theme engine and coverage

- Modes: system, light, dark, stored in harbour:theme. The result is data-theme and color-scheme set on the html element.
- The theme lives on html, never on a wrapper, so Radix and shadcn portals (menus, dialogs, toasts) inherit it.
- Pre-paint script in the head, so there is no flash:

```html
<script>
(function () {
  try {
    var s = localStorage.getItem('harbour:theme') || 'system';
    var d = s === 'dark' || (s === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    var r = document.documentElement;
    r.dataset.theme = d ? 'dark' : 'light';
    r.style.colorScheme = d ? 'dark' : 'light';
  } catch (e) { document.documentElement.dataset.theme = 'dark'; }
})();
</script>
```

- Tailwind v4 dark variant keyed to data-theme (verify the exact custom-variant syntax in the current Tailwind docs).
- When the mode is system, listen for matchMedia changes. Update the meta theme-color tag on every change.
- Switching uses the View Transitions API with a circular reveal from the toggle, with a short colour crossfade as the fallback. Suspend other transitions during the switch.
- Canvas and SVG scenes read their colours from CSS variables and refresh on a harbour:themechange event.
- Illustrations use currentColor or tokens, never baked-in colours. Raster images that need two versions switch via CSS classes.

**Coverage checklist (every item verified in both themes):** text levels, links, borders, focus rings, text selection, placeholders, disabled states, hover and active states, shadows (use borders and glow in dark), glass and its fallbacks, native controls and scrollbars, form fields and errors, dropdowns and popovers, modals and backdrops, toasts, skeletons, charts (axes, grid, tooltips, legends), SVG scenes, avatars, university logos, nav (both layouts), and the browser theme-color.

## 12. Quality gates

- **Stylelint:** ban px except 1px; ban hex, rgb and hsl outside the token file; restrict padding, margin, gap and inset values to the spacing scale, the section/container tokens, `0`, `auto` or the aurora geometry tokens. **ESLint:** flag Tailwind arbitrary values such as w-\[437px\], and off-scale spacing steps such as `p-5` or `gap-7` (see the §6 mapping table).
- **Playwright matrix:** every route at 360, 390, 768, 1024 and 1440 px, in both themes, with screenshots. Fail if scrollWidth exceeds clientWidth. Add a 200% zoom pass.
- **axe-core:** no serious or critical violations, in both themes.
- **Gallery page** at /dev/gallery showing every component in every state, with a theme toggle, behind a dev flag.
- **Performance targets:** LCP at or under 2.5s on throttled mid-range mobile, CLS at or under 0.1, landing initial JavaScript at or under 250 KB gzipped (a target to measure, not a guarantee). Code-split below-the-fold sections and the demo.

**Definition of done for every brick:** both themes, five viewports, 200% zoom, keyboard only, reduced motion, no px beyond hairlines, no raw colours, axe clean, and screenshots shown before moving on.

## 13. Build order

| Brick | Scope |
| --- | --- |
| 0 | Tokens, theme engine, fonts, aurora, gallery page |
| 1 | Layout primitives |
| 2 | Glass and interactive cards, button, input, combobox, toast, avatar, logo box |
| 3 | Landing nav and footer |
| 4 | Landing hero and WaveLine |
| 5 | Remaining landing sections |
| 6 | Profile store and login |
| 7 | Signup and RouteHome |
| 8 | Audit pass: theme, responsive, accessibility, performance |
| 9 | App shell, then app pages one by one |

## 14. Assumptions to verify

- University logos must come from each institution's official media page and be used only to identify the institution.
- Every Cantonese string needs a native-speaker check.
- Contrast values are estimates until axe passes.
- Package names and versions, and the Tailwind v4 custom-variant syntax, must be checked at install time.
- The trust claims (hidden sensitive details, privacy rules) must match what the prototype actually does and what the policy section says.
- Landing copy is a first draft for the team to edit.
