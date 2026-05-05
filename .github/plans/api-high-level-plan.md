# Envbox API High-Level Plan

## Goal

Build a Hono API focused on managing environment variables, scopes, values, and sync operations while keeping the CLI's local `.env` workflow intact.

The API should not be the dashboard or general project-management backend. The Next.js web app may own those product workflows separately and may or may not call this API when it needs env-management behavior.

The API should start small: health routes and env-management routes scoped by project id. Authentication should be designed later around API keys, with the web app handling user authentication.

## Framework

Use Hono for the API.

Reasons:

- It is simple and explicit.
- It works well with Bun.
- It keeps route handlers easy to understand.
- It does not force a heavy application structure early.
- It leaves room for OpenAPI generation later.

## Source Of Truth Model

Envbox should keep separate responsibilities for local and remote state.

- `.env` files are the project-side source of truth for values that actually land in a local project.
- `.envbox/config.json` remains local CLI metadata for now.
- The API/database becomes the remote source of truth for environment variable state, value history, and programmatic env-management workflows.
- The Next.js web app owns dashboard and product workflows such as browsing projects, account UI, and team/product screens.
- The CLI should sync between `.env` files and the API explicitly instead of treating config as the value store.

Project ids are still needed, but only as a namespace for env data. The env-management API should know which variables, scopes, values, and profiles belong to a project; it should not be shaped around dashboard project screens.

## API Boundary

Use two separate mental models:

- Product/dashboard API: owned by the Next.js app. Handles user sessions, dashboard workflows, project browsing, account UI, and product-specific screens.
- Env-management API: owned by `apps/api`. Handles CLI and programmatic operations for scopes, variables, values, validation, push, pull, and sync.

The web app can call the env-management API if that becomes useful, but the env-management API should stand on its own for CLI and external clients.

## Initial API Scope

Start with routes that do not require auth decisions yet.

### Health

- `GET /health`
- Returns basic service status.
- Useful for local development, deployment checks, and future CLI connectivity checks.

### Project Env State

- `GET /projects/:projectId/env`
- Returns environment metadata for a project.
- Useful as the first route for proving the project-scoped env API shape.

The response should map cleanly to the env-related parts of the current local config shape:

- default profile
- scopes
- variable definitions

## Next API Resources

Add these after the basic project routes are stable.

### Scopes

- `GET /projects/:projectId/scopes`
- `POST /projects/:projectId/scopes`
- `PATCH /projects/:projectId/scopes/:scopeName`
- `DELETE /projects/:projectId/scopes/:scopeName`

Scopes should represent named `.env` targets like `web`, `api`, or `db`.

### Variables

- `GET /projects/:projectId/variables`
- `POST /projects/:projectId/variables`
- `PATCH /projects/:projectId/variables/:name`
- `DELETE /projects/:projectId/variables/:name`

Variables should represent metadata: name, type, required flag, and secret flag.

### Values

- `GET /projects/:projectId/values`
- `PUT /projects/:projectId/values`

Values should be handled separately from variable definitions so metadata and secret/value storage do not get mixed together.

### Sync

- `POST /projects/:projectId/push`
- Accepts local `.env` state from the CLI.
- `POST /projects/:projectId/pull`
- Returns remote env state for the CLI to write into local `.env` files.

## CLI Sync Semantics

The API should preserve clear CLI verbs.

- `push` should read from local `.env` files and send values or metadata to the API.
- `pull` should fetch values from the API and write them into local `.env` files.
- `sync` can be added later if bidirectional behavior becomes necessary.

Do not make `.envbox/config.json` the value source. It should stay metadata-only unless there is a deliberate migration later.

## Auth Direction

Defer full auth until the API shape is clearer.

Expected direction:

- The web app handles user login and account/session authentication.
- The CLI uses API keys for machine-to-API access.
- API keys should be scoped to a user, workspace, project, or environment once those ownership concepts exist.

Do not block health and project route work on auth.

## Database Direction

The database should eventually model:

- project env namespaces
- scopes
- variable definitions
- environment values
- profiles or environments
- API keys
- audit/history events

Start with the smallest schema needed for project-scoped env state, then add scopes and variables as the API expands. Avoid adding dashboard/product tables to `apps/api` unless env management needs them.

## First Implementation Slice

1. Install and wire Hono in `apps/api`.
2. Replace the current Bun server handler with a Hono app.
3. Add `GET /health`.
4. Add an in-memory `GET /projects/:projectId/env` route to confirm the project-scoped env shape.
5. Validate with `bun typecheck` and a local API smoke check.
6. Add persistence only after the route contract feels right.

## Non-Goals For The First Slice

- No auth implementation yet.
- No database schema yet.
- No dashboard or general project-management routes.
- No secret encryption design yet.
- No CLI network sync yet.
- No OpenAPI generation until the first routes settle.