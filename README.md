# team8-frontend
Team8 Frontend

## Prerequisites

- Node.js (LTS recommended)
- npm
- PostgreSQL database

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in this folder:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME"
PORT=3001
```

## Run The API

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

## Test The API

- Run tests once:

```bash
npm test
```

- Run tests with coverage:

```bash
npm run test:coverage
```

## Lint The API

- Lint:

```bash
npm run lint
```

- Lint and auto-fix:

```bash
npm run lint:fix
```

## Logger Usage

This API uses a centralized Winston logger and HTTP request logging via Morgan.

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
