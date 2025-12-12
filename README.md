# Mash (Gelt Take Home)

Front-end for a web version of the MASH game built with Vue 3 + TypeScript (Vite). 
The backend for usernames/saved choices will be added later; this repo focuses purely on the client.

## What is being built
- Interactive MASH experience: ask the usual life prompts, collect answers, and run the elimination loop.
- Visible, slow-ish elimination steps to add suspense before revealing the final outcome. ( Maybe like these old games where the word brights up until stops for every loop? )
- Final results surfaced clearly to the player. Maybe as a combination of the output object at the bottom or something like that.
- Rules can follow the classic approach or a small twist as long as the flow matches the expectations above. ( maybe I will implement a twist where the player can press it and it loads ? Would be fun )

## Stack and structure
- Vue 3 + TypeScript, Vite tooling.
- Playwright for end-to-end tests.
- ESLint, Prettier, and Oxlint for lint/format.
- Source lives in `frontend/` to keep the client isolated from future backend work.
- As Gelt projects are host as monorepo I will try to make a frontend folder here, and leave a backend empty without deployment. ( but it will leave a taste that BE could be implemented. )

## Getting started
```bash
# from repo root
cd frontend
npm install

# dev server (defaults to 5173; add --host if needed)
npm run dev

# typecheck and lint
npm run build        # includes typecheck
npm run lint

# run unit tests (if added later)
npm run test:unit
```

## End-to-end flow while building
- Install browsers once: `npx playwright install`.
- Run dev server: `npm run dev -- --host --port 4173` (match the port in `playwright.config.ts`).
- In another terminal, open the Playwright UI watcher: `npx playwright test --ui` (or `npm run test:e2e -- --ui`).
- To record a draft scenario: `npx playwright codegen http://localhost:4173`.

## Project expectations (from the prompt)
- Vue 3 + TypeScript.
- Prompt player with initial MASH questions.
- Working selection/elimination algorithm.
- Show elimination steps slowly/visually for suspense.
- Present final results to the player.

## Notes for later backend work
- Keep player identities and saved choice lists out of the client for now.
- When ready, add a thin API layer for saving/replaying games; avoid coupling UI state to storage format.