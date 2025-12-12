# Mash (Gelt Take Home)

Front-end for a web version of the MASH game built with Vue 3 + TypeScript (Vite). The backend for usernames/saved choices will be added later; this repo focuses purely on the client.

## What is being built
- Interactive MASH experience: ask the usual life prompts, collect answers, and run the elimination loop.
- Visible, slow-ish elimination steps to add suspense before revealing the final outcome.
- Final results surfaced clearly to the player.
- Rules can follow the classic approach or a small twist as long as the flow matches the expectations above.

## Stack and structure
- Vue 3 + TypeScript, Vite tooling.
- Playwright for end-to-end tests.
- ESLint, Prettier, and Oxlint for lint/format.
- Source lives in `frontend/` to keep the client isolated from future backend work.

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

## Follow-up talking points
1) Nice-to-haves: richer prompts, shareable results, accessibility polish, sound/animation cues, theming.  
2) AI ideas: generate personalized prompts/endings, suggest funny options, adapt pacing to the player.  
3) Infra for AI: prompt service, model hosting (or API), guardrails, caching, observability.  
4) Safety: moderation on inputs/outputs, prompt constraints, evaluation checks, clear opt-in.  
5) Saving results: user auth or device storage, a simple history endpoint, and a replay view.
