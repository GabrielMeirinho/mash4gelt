# MASH 4 Gelt (frontend)

A playful Vue 3 + Vite single-page app that animates the classic MASH game: intro lights, looping music, drum roll + cheer reveal, elimination flashes, and a celebratory results modal.

## How to run

```sh
npm install          # install deps
npm run dev          # start local dev server (http://localhost:5173)
npm run build        # production build
npm run lint         # eslint + oxlint
npm run test:e2e     # Playwright E2E (serial, all browsers; first run: npx playwright install)
```

## Game flow (audio + animations)

- Landing: MASH letters glow in sequence; music toggle controls the intro loop.
- Spin: click “Spin wheel” → drum roll plays, big step number shows with a cheer, 8-bit loop starts, then elimination begins.
- Elimination: options highlight one-by-one; removed items flash twice and trigger a random stinger from `/src/sounds/elimination`; MASH letters cross/flash when eliminated.
- Results: loop stops; results modal opens with a cheer and a “Start again” reset.

## Notes

- Music toggle hides during a spin and auto-stops the intro loop when spinning starts.
- Playwright runs with a single worker to reduce resource pressure and uses the dev server locally (preview build on CI).

For more detail on commands and flow, see `RUNNING.md`.
