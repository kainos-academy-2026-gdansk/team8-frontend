# Testing Knowledge

- Run `npm run lint` for Biome linting.
- Run `npm test` for Vitest and Supertest tests.
- Run `npm run build` for the TypeScript compiler check.
- CI currently runs `npm run lint` and `npm test` on pushes and pull requests targeting `main`.
- Tests use a Node environment and import the Express app without starting a listener.
- Prefer focused behavior tests for changed routes, controllers, services, models, and rendered page output.
- Do not use real external APIs in unit or route tests; mock API service boundaries.
