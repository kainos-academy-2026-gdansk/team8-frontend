# BDD Test Framework

Playwright + playwright-bdd + TypeScript framework for the Team8 frontend.
Behaviour is described in Gherkin so scenarios stay readable by non-engineers,
while step definitions hold the Playwright interactions and API assertions.

## Structure

| Folder | Purpose |
| --- | --- |
| `features/` | Gherkin `.feature` files — Given/When/Then, no implementation detail. |
| `steps/` | Step definitions. Playwright logic, response capture and status/UI assertions live here. |
| `pages/` | Page objects. `basePage.ts` holds shared navigation and GOV.UK error helpers. |
| `fixtures/` | Custom Playwright fixtures (page objects, shared `lastResponse` state) bound to steps via `steps/fixtures.ts`. |
| `data/` | Test data and expected messages. No literals in features or steps. |
| `global-setup.ts` | Fails fast if the app under test is not reachable. |
| `global-teardown.ts` | Hook for cleaning up data created during a run. |

`playwright.config.ts` calls `defineBddConfig()` to generate runnable Playwright
specs from `features/**/*.feature` + `steps/**/*.ts` on every `playwright test`
run — no separate generation step required.

## Running

```bash
npm run test:ui              # all browsers
npm run test:ui -- --project=chromium
npm run test:ui:headed
npm run test:ui:report       # open the last HTML report
npm run test:bdd             # generate and run executable Gherkin in Chromium
```

The config starts the app automatically via `webServer` and reuses an already
running server locally. Base URL defaults to `http://localhost:${PORT}` (3001)
and can be overridden with `E2E_BASE_URL`.

## Conventions

- Feature files describe user behaviour only — no selectors, requests or status codes.
- Step definitions hold Playwright interactions, network response capture and assertions.
- Where a scenario has a UI outcome and an API outcome for the same request, verify
  both in the same scenario/step (e.g. capture the response driving a form submit via
  `page.waitForResponse` rather than writing a separate API-only test).
- Prefer role- and label-based locators over CSS or XPath.
- Use `expect` web-first assertions; never add manual waits or `waitForTimeout`.
- Import test data from `data/`; use `uniqueEmail()` when a test creates real records.
- Add a fixture instead of repeating step-level construction logic.

## BDD scenarios

Executable Gherkin lives in `features/` and its bindings live in `steps/`.
`npm run test:bdd` generates native Playwright tests into the ignored
`.features-gen/` directory and runs them with the dedicated Chromium config.
Scenarios may use existing API-client fixtures for real setup, but must not
commit credentials or replace backend behavior with browser mocks.

## Adding a new page

1. Create `pages/<name>Page.ts` extending `BasePage`.
2. Expose locators as readonly fields and interactions as methods.
3. Register it in `fixtures/testFixtures.ts`.
4. Add the spec under `tests/ui/`.
