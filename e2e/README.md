# Playwright UI Test Framework

Playwright + TypeScript framework for the Team8 frontend.

## Structure

| Folder | Purpose |
| --- | --- |
| `pages/` | Page objects. `basePage.ts` holds shared navigation and GOV.UK error helpers. |
| `fixtures/` | Custom Playwright fixtures that inject page objects and API clients into tests. |
| `data/` | Test data and expected messages. No literals in specs. |
| `api/` | API clients for setup, teardown and contract checks. |
| `tests/ui/` | Browser tests. |
| `tests/api/` | HTTP-level tests that need no browser. |
| `global-setup.ts` | Fails fast if the app under test is not reachable. |
| `global-teardown.ts` | Hook for cleaning up data created during a run. |

## Running

```bash
npm run test:ui              # all browsers
npm run test:ui -- --project=chromium
npm run test:ui:headed
npm run test:ui:report       # open the last HTML report
```

The config starts the app automatically via `webServer` and reuses an already
running server locally. Base URL defaults to `http://localhost:${PORT}` (3001)
and can be overridden with `E2E_BASE_URL`.

## Conventions

- Specs contain assertions only. Selectors and interactions live in page objects.
- Prefer role- and label-based locators over CSS or XPath.
- Use `expect` web-first assertions; never add manual waits or `waitForTimeout`.
- Import test data from `data/`; use `uniqueEmail()` when a test creates real records.
- Add a fixture instead of repeating `beforeEach` construction logic.

## Adding a new page

1. Create `pages/<name>Page.ts` extending `BasePage`.
2. Expose locators as readonly fields and interactions as methods.
3. Register it in `fixtures/testFixtures.ts`.
4. Add the spec under `tests/ui/`.
