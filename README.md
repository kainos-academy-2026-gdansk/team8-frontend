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
| `AZURE_CLIENT_ID_RAFAL` | The service principal application (client) ID |
| `AZURE_CLIENT_SECRET_RAFAL` | A valid client secret for that service principal |
| `AZURE_TENANT_ID` | The Microsoft Entra tenant ID containing the subscription |
| `AZURE_SUBSCRIPTION_ID` | The Azure subscription ID containing `acraiacademy26` |

The service principal must have access to the subscription so `azure/login` can select it, and must have the `AcrPush` role on the `acraiacademy26` registry. Do not commit these values to the repository. The workflow publishes both an immutable commit-SHA tag and a branch-specific tag to the `team8-frontend` repository in ACR.

GitHub OIDC is recommended for production because it removes the long-lived client secret.

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
