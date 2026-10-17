# Harbour

Harbour is a web app for international students finding their footing in Hong Kong. It brings practical first-weeks support into one place: understand a suspicious message, work through a settling-in checklist, get help with Cantonese phrases, and find a useful next step when something feels unfamiliar.

Harbour is designed to feel like a steady guide through unfamiliar waters: welcoming, clear, and honest about what it can and cannot do.

## What’s in the website

### Public and onboarding pages
https://harbour-v2-delta.vercel.app/
- **Landing page (`/`)** — introduces Harbour, its tools, and how it can help.
- **Sign up (`/signup`)** — creates a local profile through a short, three-step flow. University is optional.
- **Log in (`/login`)** — lets someone choose a profile saved in the current browser.
- **Arrival story (`/arrival`)** — an illustrated introduction to the move from uncertainty toward a calmer start in Hong Kong.

Profiles are stored in the browser on the device. This local profile flow is not a real account system; it does not provide cross-device sign-in or password recovery.

### Signed-in app (`/app`)

| Page | What it is for |
| --- | --- |
| Home (`/app/home`) | Starting point for the signed-in experience. |
| Scam Shield (`/app/scam`) | Helps users review suspicious messages and practise spotting warning signs. |
| Settle-in list (`/app/checklist`) | Checklist for organising practical steps after arriving. |
| Cantonese helper (`/app/translate`) | Translation and useful phrase support. |
| Ask Harbour (`/app/chat`) | A place to ask questions and find suggested next steps. |
| Rental Shield (`/app/rental`) | Rental listing and lease guidance with a first-hour playbook. |
| Dashboard (`/app/dashboard`) | Personal overview of activity and progress. |
| People (`/app/people`) | Community directory experience. |
| Community (`/app/community`) | Events and ways to connect. |
| Profile (`/app/profile`) | View and edit the local profile. |
| Tide Bank (`/app/tide-bank`) | A financial-literacy simulation. |
| Voice SOS (`/app/voice-sos`) | An emergency-support interface demonstration. |

Some experiences use sample or simulated content. The interface labels these states; they must not be read as live services, verified listings, emergency response, or guaranteed outcomes. Harbour provides general information and does not replace official, legal, financial, or emergency services.

## Run locally

Requirements: Node.js and npm. From the repository root:

```sh
npm ci
npm ci --prefix server
npm run dev
```

The full development command starts the Vite frontend and the Express API server. Open the local address printed by Vite (normally `http://127.0.0.1:5173`). The frontend proxies `/api` requests to the local server.

To run only the frontend:

```sh
npm run dev:web
```

For LAN access from another device, use `npm run dev:lan` for the frontend. API-dependent features still require the server and appropriate local configuration.

## Build and checks

```sh
npm run build
npm run lint
npm run lint:css
npm run typecheck
npm test
npm run test:e2e
```

## Technology

- React 18, TypeScript, and Vite
- Tailwind CSS v4 and Harbour’s CSS design tokens
- React Router for page navigation
- Motion and GSAP for interface and scene animation
- Express server for API routes
- Vitest and Playwright for unit and browser-flow checks

## Design and accessibility

Harbour’s design uses deep sea-green surfaces, bright teal accents, warm gold highlights, and separately designed dark and light themes. Motion is optional and respects reduced-motion preferences. The interface aims for keyboard access, visible focus, readable contrast, responsive layouts, and clear labels for sample or simulated content.

See [`design.md`](design.md) for the exact brand colours, typography, slide visual guidance, and a copy-ready prompt for creating Harbour pitch slides.

## Deployment

Deployment notes for GitHub Pages, Vercel, and the separately hosted API are in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). The frontend can be deployed as a static Vite site; API-backed production features require a separately deployed backend and configuration.
