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

Playwright API tests: [login.api.spec.ts](../../e2e/tests/api/login.api.spec.ts)
(data in [loginData.ts](../../e2e/data/loginData.ts), client in
[loginApiClient.ts](../../e2e/api/loginApiClient.ts)).

| Variation | Input |
| --- | --- |
| Page load | `GET /login` returns `200` |
| Valid login | Registers a unique account, then logs in with it; expects the redirect to land on `/job-roles` |
| Wrong password | Registered email, incorrect password → `401` |
| Unknown email | Never-registered email → `401` |
| Missing password | Empty password → `400`, frontend validation message |
| Missing email | Empty email → `400`, frontend validation message |

Run with:

```bash
npm run test:ui -- e2e/tests/api/login.api.spec.ts
```
