# Horse Racing Game

Horse Racing Game is a Vue 3 + TypeScript project that simulates horse races with seeded randomness, lap-based flow, live board updates, and a polished UI. The codebase follows large-scale application conventions: modular Vuex store, shared utilities, structured components, comprehensive test coverage.



## Features
- Reproducible race simulations with seeded randomness
- Multi-lap race flow with a 5-second countdown and automatic restart
- Live results board, program panel, and race track sections
- Responsive layout with shared base, widget, and section components
- Vitest unit & integration coverage with Testing Library matchers
- End-to-end scenarios powered by Playwright
- One-command GitHub Pages deployment via `gh-pages`

## Tech Stack
- **Framework**: Vue 3, TypeScript, Vite
- **State Management**: Vuex 4 modules (`horses`, `race`)
- **Testing**: Vitest, Vue Test Utils, @testing-library/vue, Playwright
- **Styling**: CSS variables, scoped component styles
- **Tooling**: vite.config with Vitest integration, `gh-pages` deploy script

## Getting Started
1. Clone the repository:
   ```bash
   git clone https://github.com/esraerdim/HorseRacingGame.git
   cd HorseRacingGame
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Development Commands
- Start local dev server:  
  ```bash
  npm run dev
  ```
- Type-check and create production build:  
  ```bash
  npm run build
  ```
- Preview the production build locally:  
  ```bash
  npm run preview
  ```

## Testing
- Run all unit & integration tests (Vitest):  
  ```bash
  npm run test
  ```
- Watch mode for unit & integration tests:  
  ```bash
  npm run test:watch
  ```
- Collect coverage reports:  
  ```bash
  npm run test:coverage
  ```
- Playwright end-to-end suite:  
  ```bash
  npm run test:e2e
  ```
- Playwright Test UI:  
  ```bash
  npm run test:e2e:ui
  ```

Vitest suites leverage `jsdom` and custom fast timers; Playwright tests boot the dev server (or attach if already running) and interact through real browser contexts.

## Project Structure

```text
├─ public/                  # Static assets
├─ src/
│  ├─ App.vue
│  ├─ main.ts
│  ├─ layouts/              # Application layouts
│  ├─ pages/                # Page-level components
│  ├─ components/
│  │  ├─ base/              # Atomic reusable components (AppButton, AppBadge, …)
│  │  ├─ widgets/           # Composite building blocks (HorseCard, LiveBoardEntry, …)
│  │  └─ sections/          # Page sections (RaceTrack, LiveBoard, …)
│  ├─ shared/
│  │  ├─ config/            # Domain configuration (race settings)
│  │  ├─ hooks/             # Composables (useRaceTrack, useLiveBoard, …)
│  │  └─ utils/             # Helper utilities (colors, random, race logic)
│  ├─ store/
│  │  └─ modules/           # Vuex modules (horses, race)
│  ├─ styles/               # Global styles and CSS variables
│  └─ types/                # Type declarations
├─ tests/
│  ├─ unit/                 # Component & composable specs (Vitest)
│  ├─ integration/          # Store and flow integration specs
│  └─ e2e/                  # Playwright scenarios
├─ playwright.config.ts
├─ vite.config.ts
└─ tsconfig*.json
```

## Deployment
The repo ships with GitHub Pages automation.

- `vite.config.ts` sets `base` to `/HorseRacingGame/` for production builds.
- Deploy with:
  ```bash
  npm run deploy
  ```
  The command builds the project and publishes the `dist/` folder to the `gh-pages` branch via the `gh-pages` CLI.
  Live:https://esraerdim.github.io/HorseRacingGame/

