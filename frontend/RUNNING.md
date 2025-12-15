# Running, linting, testing

## Quick start
```sh
npm install
npm run dev        # http://localhost:5173
```

## Builds
```sh
npm run build
```

## Lint
```sh
npm run lint
```

## E2E tests (Playwright)
```sh
npx playwright install   # first time only (browser binaries)
npm run test:e2e         # runs all projects serially
# limit to Chromium
npm run test:e2e -- --project=chromium
```

## How the spin experience works
- **Intro**: MASH letters glow in sequence; music toggle controls the intro loop.
- **Spin start**: clicking “Spin wheel” stops the intro music, plays a drum roll, shows a big step number with a cheer, then starts an 8‑bit loop (2s lead-in).
- **Elimination**: each option highlights; when removed it flashes twice, pauses briefly, and plays a random stinger from `src/sounds/elimination`.
- **Results**: loop stops; results modal appears with another cheer and a “Start again” button.

## Troubleshooting
- If Playwright is slow on constrained machines, keep `workers: 1` (already configured) and prefer the Chromium-only command above.
- The music toggle is hidden during a spin; it reappears afterward.***
