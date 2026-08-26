# team8-frontend
Team8 Frontend

## Prerequisites

- Node.js (LTS recommended)
- npm

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in this folder:

```env
PORT=3001
```

## Run the app

- Development (watch mode):

```bash
npm run dev
```

- Production build:

```bash
npm run build
```

- Run built app:

```bash
npm start
```

## Test the app

- Run tests once:

```bash
npm test
```

- Run tests with coverage:

```bash
npm run test:coverage
```

## Lint the app

- Lint:

```bash
npm run lint
```

- Lint and auto-fix:

```bash
npm run lint:fix
```

## Publish the Docker image to ACR

The CI workflow publishes images after a push to the `main` or `platforms-01-rafal` branch. Pull requests and pushes to other branches still build the Docker image but do not log in to Azure or push anything.

Add these repository secrets in GitHub under **Settings > Secrets and variables > Actions**:

| Secret | Value |
| --- | --- |
| `ACR_LOGIN_SERVER` | The registry login server, for example `myregistry.azurecr.io` |
| `ACR_USERNAME` | The Azure Container Registry username |
| `ACR_PASSWORD` | The Azure Container Registry password |

For this exercise, the username and password can come from the ACR admin credentials. Do not put them in this repository. The workflow publishes both an immutable commit-SHA tag and `latest` to the `team8-frontend` repository in ACR.

For production, replace these long-lived credentials with GitHub OIDC and an Azure service principal that has only the `AcrPush` role on this registry.

## Logger Usage

This app uses a centralized Winston logger and HTTP request logging via Morgan.

- Logger file: `src/lib/logger.ts`
- Request logging middleware: `src/config/morganMiddleware.ts`

### How Logging Works

- Console logs are always enabled.
- File logs are written to `logs/error.log` (errors) and `logs/all.log` (all levels) when the filesystem is writable.
- Log level is based on `NODE_ENV`:
	- `development` -> `debug`
	- all other values -> `warn`

### Use Logger In Code

Import and use the shared logger instead of `console.log`:

```ts
import Logger from "./lib/logger";

Logger.info("Application started");
Logger.warn("Potential issue detected");
Logger.error("Unexpected error occurred");
Logger.debug("Debug payload");
```

### Inspect Logs

```bash
tail -f logs/all.log
```

```bash
tail -f logs/error.log
```
