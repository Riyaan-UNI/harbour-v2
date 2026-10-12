# Harbour Spec Addendum 1: Product alignment

Companion to docs/DESIGN\_SPEC.md · 12 Oct 2026 · Source: the feature, workflow and interaction brief for the previous build

## 0. Purpose and rules

The previous build's brief defines what Harbour must do. This addendum folds it into the spec. Two rules carry over from that brief:

1. **Keep the functionality**, the workflows, the safety boundaries and the honesty labelling.
2. **Do not copy the old visual design:** its palette, typography, harbour and portal metaphor, bunny, garden, identical card grids and animations.

Where this addendum and the spec disagree, this addendum wins until it is merged into the spec.

## 1. What changes in the spec

| Area | Spec v1 said | Now |
| --- | --- | --- |
| Landing tools | Settlement Assistant, Anti-Scam Centre, Translation Gateway, Voice SOS and Community | Four real tools shown with sample output: Scam X-ray, Settle-in list, Cantonese helper, Ask Harbour. Rental Shield gets its own band. |
| Tide Bank, Voice SOS, events | Copy read as if live | Clearly labelled SIMULATION, DEMO or SAMPLE everywhere |
| Country list | Names from i18n-iso-countries | Override so Hong Kong, Macao and Taiwan appear as parts of China |
| Signup | Three steps | Still three steps, but university is optional and a privacy line is added |
| Login | Profile picker | Picker plus an honesty line; logging out of the device clears the profile |
| Light-theme neutrals | Warm ivory #F7F3E9 | Cooler sea-glass neutrals (proposed, section 6) |
| Route home | Ship and harbour glyphs | Abstract marker and destination node |
| Shared components | Not listed | Honesty, status, state and safety components (section 8) |
| Signed-in Home and Dashboard | Not specified | Specified in section 7 |

## 2. Non-negotiable product rules

1. **Four states on every data screen:** empty, loading, result and error. The empty state is warm and has a call to action. Loading is a calm skeleton, never a jarring spinner. The error state is useful: it offers retry and an offline alternative.
2. **Honesty is a feature.** Every simulation, sample and degraded result is labelled (SIMULATION, DEMO, SAMPLE, fictional, basic keyword check). A degraded result is never shown as a full one. Never imply a real human where there is none, and never present a simulation as live.
3. **Safety is always one tap away.** A safety rail shows 999, the Police Anti-Scam Helpline 18222 and Immigration enquiries 2824 6111, plus the Hospital Authority enquiry line. The rail is on every signed-in surface, and Voice SOS always shows 999. Copy every number from the old repo's constants and verify each against its official source before shipping. Do not type them from memory.
4. **Status is never colour alone.** Risk and status always use colour plus an icon plus a label.
5. **Privacy is demonstrated.** Before text leaves the device, the browser redacts email, HKID, phone, card number and one-time-code patterns, shows how many items it hid, and warns that patterns can miss things. Pasted text is never stored or logged.
6. **Every AI feature has a deterministic fallback.** The app must be fully usable with no external calls.
7. **Disclaimers stay.** General information, not legal advice. Not an emergency service. Not verification of any listing, person or message.
8. **Touch and keyboard are first-class.** 44px minimum targets, visible focus, no keyboard traps, and no hover-only interaction (every hover has a tap equivalent).
9. **Motion is optional.** Everything respects prefers-reduced-motion, no meaning depends on animation, and a calm mode turns off heavy effects.
10. **Country names:** Hong Kong, Macao and Taiwan are always presented as parts of China, in every country selector and directory. Use the labels Hong Kong, China; Macao, China; and Taiwan, China. Put the override in one module and cover it with a unit test.
11. **Voice:** calm, warm, plain-spoken, honest about limits, action-oriented, non-judgemental, and deferential on serious matters. Every result ends with a next step. Errors are calm (the app is taking a breather), never alarming.
12. **Handoffs between tools:** every result asks what the next step is and which tool owns it, then links there (message to checklist to translator; listing to lease to playbook; question to checklist or translator).

## 3. Feature map (all must be rebuilt)

| Feature | Route | Notes |
| --- | --- | --- |
| Landing | / | Returning-user and new-user states |
| Signup | /signup | Local profile, three steps |
| Login | /login | Continue as a saved profile |
| Home | /app | Signed-in hub, section 7 |
| Scam Shield | /app/scam | Tabs: Scam X-ray, Scam Drill |
| Rental Shield | /app/rental | Tabs: Listing check, Lease X-ray, First-hour playbook |
| Cantonese helper | /app/helper | Tabs: Translate, Counter card |
| Ask Harbour | /app/ask | Chat with suggestions and offline fallback |
| Settle-in list | /app/checklist | Country-aware, custom lists, celebration |
| Dashboard | /app/dashboard | Section 7 |
| People | /app/people | Fictional directory, labelled SAMPLE |
| Community | /app/community | Sample events, filter, save |
| Tide Bank | /app/tide-bank | Simulation only |
| Voice SOS | /app/voice-sos | Simulation only, with a failed state |
| Profile | /app/profile | View and edit mode, photo, friends, log out of device |

Proposed order after Home: Settle-in list, Scam Shield, Cantonese helper, Ask Harbour, Rental Shield, Dashboard and Profile, then People, Community, Tide Bank and Voice SOS. We revisit this when we get there.

## 4. Landing page (replaces section 9 of the spec)

**Hero.** Eyebrow: FOR INTERNATIONAL STUDENTS IN HONG KONG. Headline: Your safe harbour in Hong Kong. Subhead: Scams, language, paperwork, loneliness — the things nobody warns you about. Harbour helps you through them, one small step at a time. New visitor: Create your profile (primary) and See how it works. Returning visitor with a saved profile: Continue as the saved nickname (primary) and Not you? Choose a profile. The WaveLine animation sits across the lower third.

**Four tools.** H2: Four tools for your first weeks. Each card shows a real sample of its output, labelled SAMPLE, and expands on click or tap.

1. **Scam X-ray.** A fictional parcel-fee text, then the result: an amber risk badge with icon and label, a one-line issue, two warning signs and a next step. Line: Paste a message. See the patterns, not a verdict.
2. **Settle-in list.** A mini list from First 48 hours with three tasks and a progress ring. Line: Small steps count.
3. **Cantonese helper.** One phrase with characters, jyutping and a tone note. Line: Carry the right words, and the right way to say them.
4. **Ask Harbour.** Suggestion chips and a calm answer card marked as guidance. Line: Ask the thing you think is silly.

**Rental band.** H2: Before you pay a deposit. Body: Check a listing for warning signs, read your lease clause by clause, and know the first-hour plan if something goes wrong. Three chips: Listing check, Lease X-ray, First-hour playbook. Small print: General information, not legal advice. Do not state how common rental scams are unless a source is cited.

**Problem.** H2: Arriving is the easy part. Three interactive cards: Lost in translation, Scams that find newcomers, Alone in a full city (copy as in spec v1).

**Live demo.** H2: Say it your way. We will make it clear. Canned examples only, labelled DEMO. Each result shows English, Cantonese characters, jyutping and a one-line tone note.

- Input: Hi uh sorry, so I was wondering if maybe you could, like, take me to Central station, the MTR one, if it is not too much trouble? Output: Please take me to Central MTR station. / 唔該，我想去中環站。 / m4 goi1, ngo5 soeng2 heoi3 zung1 waan4 zaam6. Tone: polite and natural for a taxi.
- Input: Um, my landlord says I have to pay two months deposit but I do not understand if that is normal. Output: Is a two-month deposit normal for a rental? / 請問租屋要俾兩個月按金係咪正常？ Add jyutping and a tone note. All Cantonese needs a native-speaker check before release.

**Practice teaser.** H2: Rehearse the hard conversation first. A short Scam Drill preview: three response options, one safe, with a gentle score band. Line: It is safe to try.

**A look at what is next.** Three cards, each with a permanent badge: Voice SOS preview (SIMULATION: no call is placed; for danger call 999), Tide Bank (DEMO: no monetary value, no real people), Community events (SAMPLE). This replaces the earlier Tide Bank copy that read as a real exchange of help. Do not promise live matching or real credits anywhere.

**How it works.** H2: Three steps to feeling at home. Create a profile, tell Harbour what you need, get a clear next step.

**Trust.** H2: Built to be careful with you. Your profile stays on this device. Pasted text is cleaned of emails, phone numbers and IDs in your browser before anything is sent, and Harbour tells you what it hid. There are no accounts or passwords in this prototype.

**Final call and footer.** H2: Come in from the storm. Buttons: Create your profile, Log in. Footer states plainly: Harbour is guidance, not an emergency service, legal or financial advice, or verification. Emergency numbers are in the footer.

## 5. Signup and login alignment

**Signup** keeps three steps (nickname, country, university) with the Route home animation.

- Step 1 asks what we should call you, with a privacy line: Nothing leaves this device.
- Country uses the override in rule 10.
- University is optional. Offer Other / not enrolled yet and a Skip. Social handles are not asked at signup; they live in Profile edit.
- Profile shape starts as id, nickname, countryCode, universityId (nullable), createdAt. Before Brick 7, compare it with the old repo's profile module, record any difference, and decide per field. No migration of old profiles is needed because this is a fresh build.

**Login** keeps the picker and adds the honesty line: Real accounts and passwords are not enabled in this prototype. Profiles live on this device only. Logging out of the device clears the profile and its related local data. Both profile-found and profile-absent states are fully designed.

## 6. Visual boundary decisions

- **Light-theme neutrals (proposed):** bg #F2F7F6, bg-elevated #FFFFFF, on-accent #F2F7F6, glass-tint rgba(242,247,246,0.55). Teal and gold keep their roles. Re-run the contrast solver and log every change. The warm ivory is the strongest carry-over from the old design.
- **Route home:** the moving marker is a small circle with a heading wedge, and the destination is a ringed node with a soft pulse. No ship or harbour illustration, no portal or zone shapes.
- **Not reused:** Fraunces and DM Sans, the bunny, the garden, the harbour scene, and grids of identical cards. Bento layouts must vary sizes.
- **Tide Bank** may be renamed later. The requirement is that it stays clearly a simulation.

## 7. Signed-in Home and Dashboard

**App shell.** Top bar with the logo, an Ask Harbour button available everywhere, theme toggle and profile menu. The safety rail is always reachable. On mobile, a bottom tab bar with four items (Home, Safety, Language, Settle-in) and a More sheet (Ask, Dashboard, Community, People, Tide Bank, Voice SOS, Profile).

**Home (Brick 9).**

1. Greeting with the nickname, the day and place line (for example MONDAY · HONG KONG), and a gentle opening question. A weather glance with loading, success and retry states. It hides itself gracefully offline.
2. Four interactive tool cards: Scam X-ray, Settle-in list, Cantonese helper, Ask Harbour. Each shows a one-line purpose and, where relevant, a progress hint.
3. A seven-day activity chart from checklist progress, built with Recharts and the chart tokens. Empty state: a warm prompt with a call to action, never a blank plot.
4. A preview strip: Voice SOS (SIMULATION), Tide Bank with a demo balance masked by default and revealed on demand (labelled as having no monetary value), and saved sample events.
5. A next-step nudge to make the space your own.
6. The safety rail with 999, 18222 and 2824 6111.

**Dashboard (later brick).** A header about progress at your own pace. Metric cards for checklist steps completed, demo tide points and friends added. The seven-day chart. A next-step card. Friends and shared social links with empty states. An anonymous impact panel with counts for listing checks, leases read, cards built and drills completed, mapped to the relevant Sustainable Development Goals. Counters below the minimum threshold are hidden, not shown as small numbers. Until a real source exists, this panel shows a labelled DEMO state.

## 8. Shared components added to the roadmap

**Brick 2a (simple):** Button, Input, Textarea, FormField, Card (static, interactive, flat), Chip, StatusBadge (risk level with icon and label), DemoBadge (SIMULATION, DEMO, SAMPLE), Disclaimer, Skeleton, EmptyState, ErrorState (retry plus offline-alternative slot), Toast, Avatar, UniversityLogo, SafetyRail, RedactionNotice.

**Brick 2b (complex):** Combobox and CountryCombobox (with the country override), Dialog and Sheet, Tabs, Progress ring and bar, interactive-card effects (spotlight, tilt, expand).

## 9. Open items

- Emergency numbers: copy from the old repo and verify against official sources before shipping.
- Cantonese strings and jyutping need a native-speaker check.
- Flag beside Taiwan in the country list: the team decides. Until then show no flag glyph for it. Hong Kong and Macao may show their SAR flags.
- If there is a second brief (for example workflows or the UI audit), share it before Brick 5, because landing copy depends on it.
- Impact panel data source: decide whether it reads real anonymous counts or stays a labelled demo.
