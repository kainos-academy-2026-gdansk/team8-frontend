# General Repository Knowledge

- The application is a TypeScript CommonJS Express server using Nunjucks for server-rendered pages.
- The frontend integrates with backend APIs through Axios.
- The source is organized by responsibility: routers, controllers, services, models, views, and styles.
- `src/app.ts` configures the Express app and middleware; `src/index.ts` starts the listener.
- `src/config/apiClient.ts` is the shared Axios client configuration.
- `src/lib/logger.ts` is the centralized Winston logger.
- GOV.UK Frontend provides the base markup and component styles.
- Team-wide review guidance is in `.github/copilot-review-instructions.md`.
