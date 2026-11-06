<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:material-ui-nextjs-agent-skill -->

## Material UI + Next.js (agent skill)

This project integrates Material UI with Next.js, providing pre-configured components and patterns for building user interfaces within the Next.js framework. This agent skill is implemented in the following directory: `.agents/skills/material-ui-nextjs`

<!-- END:material-ui-nextjs-agent-skill -->

<!-- BEGIN:project-documentation -->

## Project Documentation

### Required Documents

Before implementing a feature or modifying existing behavior, read the relevant documents:

- `docs/spec/product-spec.md`
  - Defines functional requirements, business rules, safety constraints, and responsibilities across the frontend, static data files, and browser localStorage (there is no backend).
  - Treat this document as the source of truth for expected system behavior.

- `docs/spec/development-plan.md`
  - Defines development workstreams, weekly milestones, task status, and acceptance criteria.
  - Use this document to identify the current development scope and track implementation progress.
  - Update it when task status, progress, blockers, or acceptance results change.

- `docs/architecture/api-contracts.md`
  - Defines the agreed API contracts between the frontend and backend.
  - Read the relevant sections before implementing or modifying API integration.
  - Update it when an API contract is agreed upon or changed.

- `docs/architecture/frontend-architecture.md`
  - Defines the tech stack, directory structure, layer responsibilities, mock mechanism, and `config/` rules.
  - Follow it for every code change. Do not introduce parallel structures or libraries.

### Frontend Architecture Rules (summary)

The full rules are in `frontend-architecture.md`. The key constraints are:

- Client Components by default. `app/layout.tsx` stays a Server Component for metadata and providers only. Do not use Server Actions, Route Handlers, or server-side data fetching.
- The app is deployed to GitHub Pages as a static export (`output: 'export'` in `next.config.ts`). Do not use dynamic route segments (`[param]`), Proxy, `cookies()`/`headers()`, redirects/rewrites/headers config, `'use cache'`/`cacheComponents`, or default image optimization. Use `next/link` for internal links so `basePath` is applied. After `npm run build`, every route in the output list must be `○ (Static)`; a `ƒ (Dynamic)` route will not exist on GitHub Pages and must be removed. See `frontend-architecture.md` §3.2.
- Organize code by resource under `domain/<resource>/`, using `schema.ts` (types), `api.ts` (axios requests), `hooks.ts` (SWR), and `store.ts` (zustand) only as needed.
- axios defines HTTP requests (`api.ts`, shared instance in `lib/http.ts`). SWR hooks own resource access and its business logic. zustand holds general client state only and must not duplicate server data. Stores define state only. State-changing functions are exported outside the store and call `useXxxStore.setState()`.
- Components access data only through hooks, never by calling `api.ts`, axios, or `fetch` directly.
- Mock data is static, typed, and lives in `mock/`. `api.ts` returns it wrapped in `sleep` when mock mode is on. Do not build dynamic or automated mocks (no MSW, in-memory databases, or random failures).
- User settings such as height, weight, and exercise toggles are frontend-only state in `domain/settings/store.ts`; the current and previous drinking rounds live in `domain/drink-session/store.ts`. Both are persisted to localStorage with zustand `persist` and have no API. Calorie, exercise, and result calculations are pure functions in `domain/<resource>/calc.ts` (see `frontend-architecture.md` §5.8).
- Spec values and defaults live in `config/`, each annotated as either defined by `product-spec` or provisional. Do not hard-code them in components.
- Do not add dependencies, including test frameworks, without stating the reason and recording it in `development-plan.md`.

### Example Module

`docs/guides/example-exercise-toggle.md` describes a minimal reference module that covers part of FE-04. It exists for students to study and then reset.

- Do not extend the example module into the full FE-04 workstream.
- When a student is re-implementing it, work one file per step as the guide describes. Do not restore the example files from git in bulk.
- The example does not count toward any workstream's progress in `development-plan.md`.

### Development Plan Maintenance

- Before starting a task, identify its workstream and acceptance criteria in `development-plan.md`.
- If the task is not covered by the current plan, identify the missing scope before proceeding.
- Update task status only when supported by actual implementation and verification results.
- Do not mark a task as completed merely because code has been generated or written.
- Record blockers and unresolved dependencies explicitly.
- Keep the plan concise and focused on actionable work. Do not turn it into a daily activity log.
- Do not change the planned scope or milestones without an explicit reason.

### API Contract Maintenance

- Check existing API implementations and documented contracts before inventing or modifying endpoints.
- Do not assume that an endpoint, request field, response field, error format, or device capability exists unless supported by the current implementation or an agreed specification.
- When an API requirement is unclear, document the open question instead of silently making assumptions.
- When a new API contract is agreed upon, document its method, path, request, response, error behavior, and relevant constraints.
- When an existing contract changes, update the documentation and affected implementation together whenever possible.
- Mark every contract with exactly one status: `Proposed`, `Confirmed`, `Implemented`, or `Deprecated`. List undecided items under Open Questions instead of inventing a status.
- Do not describe a proposed or mocked API as an implemented backend capability.

### Task Completion and Documentation Updates

Before considering a task complete:

1. Verify the implementation against its acceptance criteria.
2. Verify as defined in `development-plan.md` §3.5. Static checks (`npm run typecheck`, `npm run lint`, `npm run build`) must all pass. Then manually verify each acceptance criterion in the browser using mock data. This project has no automated test framework, so do not add one.
3. Update `development-plan.md` with the actual status and verification results.
4. Update `api-contracts.md` if the agreed API contract was added or changed.
5. Summarize what changed, what was verified, and any remaining blockers.

Do not modify unrelated documentation or mark unverified work as complete.

<!-- END:project-documentation -->
