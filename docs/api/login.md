# Login API — request reference and automated coverage

Source of truth: [authController.ts](../../src/controllers/authController.ts),
[authApiService.ts](../../src/services/authApiService.ts),
[authRouter.ts](../../src/router/authRouter.ts).

## Captured request

The browser only ever calls this frontend server. The frontend then calls the
real backend (`${API_BASE_URL}/auth/login`) server-side with JSON; that second
hop never appears in the browser's Network tab.

```bash
curl 'http://localhost:3001/login' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'Accept: text/html,application/xhtml+xml' \
  --data-urlencode 'email=test.user@kainos.com' \
  --data-urlencode 'password=Password1!' \
  -i
```

| Header / field | Purpose |
| --- | --- |
| `Content-Type: application/x-www-form-urlencoded` | The login form has no `enctype`, so the browser posts standard form-encoded data, not JSON. |
| `email` | Read via `req.body.email`, trimmed before use. |
| `password` | Read via `req.body.password`, never logged or echoed back. |
| `Set-Cookie: connect.sid=...` (response) | Session cookie holding `jwtToken` and `userRole` after a successful login. |

## Response contract

| Scenario | Status | Body |
| --- | --- | --- |
| Missing email or password | `400` | Login page re-rendered with "Enter both email and password" |
| Wrong password / unknown email | `401` | Login page re-rendered with a generic invalid-credentials error (exact copy comes from the backend) |
| Backend unreachable or 5xx | `502` | Login page re-rendered with "Unable to sign in right now. Please try again later." |
| Valid credentials | `302` → `/job-roles` | Session cookie set; email/password never echoed back |

## Automated coverage

BDD scenarios: [login.feature](../../e2e/features/login.feature)
(step definitions in [login.steps.ts](../../e2e/steps/login.steps.ts), data in
[loginData.ts](../../e2e/data/loginData.ts), page object in
[loginPage.ts](../../e2e/pages/loginPage.ts)).

Each scenario drives the real login form and, in the same step, captures the
underlying `POST /login` response via `page.waitForResponse` — asserting the
UI validation message and the API status code together rather than testing
each layer in isolation. Scenarios are restricted to frontend-only validation
(missing email/password) so they don't depend on a live backend being
reachable in CI:

| Variation | Input | UI assertion | API assertion |
| --- | --- | --- | --- |
| Page load | - | Form renders | - |
| Missing email | Empty email, valid password | "Enter both email and password" shown | `400` |
| Missing password | Valid email, empty password | "Enter both email and password" shown | `400` |
| Empty form | Empty email and password | "Enter both email and password" shown | `400` |

Scenarios that need a real backend round trip (valid login, wrong password,
unknown email) are intentionally not covered here — this repo doesn't run a
seeded backend instance in CI. Add them back as backend-integration tests once
a backend service is available in the pipeline.

Run with:

```bash
npm run test:ui -- --grep "User sign in"
```
