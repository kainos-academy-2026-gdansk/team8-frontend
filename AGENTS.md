# Repository Agent Workflow

This repository uses two custom agents to move a user story from discovery to developer verification:

1. `planning-agent`: reads memory, fetches a user story, asks clarifying questions, and prepares an approved plan.
2. `developing-agent`: reads the prepared story and plan, implements and validates the approved work, performs a local review, and hands the result to the developer for manual verification.

The expected flow is:

```text
Memory
  -> Fetch user story
  -> Plan and clarify
  -> Implementation approval
  -> Implement
  -> Validate
  -> Local code review
  -> Developer handover: manual verification
      -> Approved: retrospective and memory update
      -> Declined: return to planning
```

## Non-negotiable workflow rules

- Read the relevant committed repository memory before planning or changing code.
- A story may come from a CSV file supplied by path, an attached CSV, or text pasted into chat. Never assume a fixed CSV filename.
- Record each story in a unique session folder under `.ai/sessions/`.
- Store the story details in `user-story.md` and the proposed work in `plan.md` before implementation.
- Planning is conversational. Ask focused questions whenever the story, acceptance criteria, API contract, visual behavior, or validation expectations are unclear.
- Do not implement while required questions remain unanswered.
- Ask for explicit approval before inventing a new dependency, public route/API, architectural layer, persistence mechanism, design pattern, or team-wide convention.
- The write agent may implement only the approved plan. A developer decline returns the work to planning with the feedback recorded.
- Do not commit changes automatically. The developer owns commits and branch management.
- After an approved manual verification, perform a retrospective and update the appropriate committed memory file automatically.

## Repository memory

Committed memory lives in `.ai/memory/`:

- `general.md`: stable repository facts and operating assumptions.
- `patterns.md`: reusable implementation and UI patterns.
- `decisions.md`: approved architectural or product decisions.
- `testing.md`: test strategy, commands, and validation lessons.
- `styling.md`: shared visual language and page consistency rules.

Session-specific working files live in `.ai/sessions/<unique-session>/` and are intentionally ignored by Git.

## Existing architecture

Follow the current boundaries unless an approved plan changes them:

- `src/router/`: thin route registration and delegation.
- `src/controllers/`: HTTP request/response handling.
- `src/services/`: API calls, mapping, and business logic.
- `src/models/`: domain and form validation models.
- `src/views/`: Nunjucks presentation only; templates do not contain business logic.
- `src/styles/`: shared component styles and page-specific styles.
- `src/config/apiClient.ts`: shared Axios client configuration.
- `src/lib/logger.ts`: centralized Winston logger. Avoid `console.log` in application code.

Keep frontend/backend boundaries intact. Services should not depend on Express request or response objects, and controllers should not own API-call details.

## Visual consistency

Read `.ai/memory/styling.md` before creating or modifying a page. Reuse the existing GOV.UK markup, Kainos CSS variables, shared component styles, typography, spacing, focus treatment, and responsive conventions. Add a page stylesheet only when the behavior is genuinely page-specific. New colors, fonts, radii, shadows, or visual patterns require approval unless they are an extension of existing tokens.

## Required validation

Unless the approved plan gives a narrower justified command, run:

```bash
npm run lint
npm test
npm run build
```

Report every command and its result. Do not hide failures or weaken tests to make validation pass.

## Local review

The local review must read `.github/copilot-review-instructions.md`, compare the current branch with `origin/main`, prioritize correctness, regressions, security, architecture, accessibility, and missing tests, and save the report under `code_reviews/`. Review findings come before summary. Do not rewrite the developer's code in review comments.

## Developer handover

The handover must include the story, changed behavior, automated validation results, local review report, manual verification steps, and known limitations. Stop for an explicit approve or decline response. Approval triggers the retrospective; decline triggers planning.
