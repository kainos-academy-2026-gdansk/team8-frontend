# Approved Decisions

- Repository workflow instructions live in the root `AGENTS.md`.
- Custom workflow agents live in `.github/agents/`.
- Committed repository memory lives in `.ai/memory/`.
- Story-specific working files use unique directories under `.ai/sessions/` and are ignored by Git.
- The planning agent requires explicit implementation approval before handing work to the writing agent.
- The writing agent requires explicit developer approval after manual verification before performing a retrospective.
- Retrospectives may update committed repository memory automatically after developer approval.
