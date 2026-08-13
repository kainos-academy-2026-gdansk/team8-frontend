# Reusable Patterns

- Keep routers thin and delegate request handling to controllers.
- Keep controllers focused on HTTP concerns and services focused on API calls, mapping, and business logic.
- Keep Nunjucks templates presentational; prepare display data in controllers or services.
- Validate external input at the boundary with Zod and derive types from schemas when practical.
- Reuse the shared Axios client rather than creating clients in controllers or page code.
- Prefer focused page styles in `src/styles/pages/` and shared reusable styles in `src/styles/components/`.
- Add tests for changed behavior, including success, validation, empty/not-found, and error paths when relevant.
- Preserve accessibility: semantic GOV.UK markup, associated labels/errors, keyboard focus, and sufficient contrast.
