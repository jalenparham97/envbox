# Envbox

Envbox is a local-first CLI for managing environment variables across project `.env` files.

It keeps lightweight metadata in `.envbox/config.json` and treats your `.env` files as the source of truth for values.

## Local Development

Install dependencies:

```sh
bun install
```

Run the CLI locally from the repo root:

```sh
bun run envbox help
bun run eb help
```

The local scripts run the CLI source directly with Bun:

```sh
bun apps/cli/src/index.ts
```

## Happy Path

Initialize envbox in a project:

```sh
bun run envbox init
```

When no project name is provided, envbox starts a setup flow and prompts for:

- project name, defaulting to the current folder name
- default profile, defaulting to `dev`
- whether to create a root `.env` file, when one does not exist
- whether to create an initial scope, defaulting to no
- scope name and `.env` path, defaulting to `app` and `.env`
- optional variables for that scope
- whether to import existing values from that `.env` file, when it exists

You can still skip the setup flow by passing the project name directly:

```sh
bun run envbox init my-app
```

Create a named scope for an app `.env` file:

```sh
bun run envbox scope add web apps/web/.env NEXT_PUBLIC_API_URL
```

Or use the guided scope flow:

```sh
bun run envbox scope add
```

Add a variable and write its value to the scoped `.env` file:

```sh
bun run envbox add NEXT_PUBLIC_API_URL http://localhost:3001 --scope web
```

Or use the guided variable flow:

```sh
bun run envbox add
```

Read the value back:

```sh
bun run envbox get NEXT_PUBLIC_API_URL --scope web
```

Import existing variables from the scoped `.env` file into envbox metadata:

```sh
bun run envbox push web
```

## Profiles

The active profile defaults to `dev`.

Switch profiles:

```sh
bun run envbox use staging
bun run envbox use prod
```

Values are not stored in `.envbox/config.json`. Profiles are metadata only right now, so the `.env` files remain the source of truth.

## Scopes

Scopes give names to `.env` files and optionally limit which variables a scoped command can manage.

App scope:

```sh
bun run envbox scope add web apps/web/.env NEXT_PUBLIC_API_URL API_URL
```

Package scope:

```sh
bun run envbox scope add db packages/db/.env DATABASE_URL DIRECT_URL
```

List scopes:

```sh
bun run envbox scope list
```

Remove a scope:

```sh
bun run envbox scope remove db
```

If a scope has variables listed, scoped commands only read and write those variables. If no variables are listed, scoped commands can use all variables in that scope's `.env` file.

## Default `.env`

Commands default to `.env` when no scope is provided:

```sh
bun run envbox add PORT 3000
bun run envbox get PORT
bun run envbox list
bun run envbox validate
```

`push` imports existing `.env` variables into envbox metadata:

```sh
bun run envbox push
bun run envbox push apps/api/.env
```

## Variables

Use the guided flow:

```sh
bun run envbox add
```

Add a variable definition:

```sh
bun run envbox add PORT --type number
```

Add a variable and set its value in one command:

```sh
bun run envbox add PORT 3000 --type number
```

When `--type` is omitted, envbox infers `number` and `boolean` values:

```sh
bun run envbox add PORT 3000
bun run envbox add FEATURE_ENABLED true
```

Update an existing variable value:

```sh
bun run envbox update PORT 3001
```

`update` also infers `number` and `boolean` values unless `--type` is provided.

Add a required secret:

```sh
bun run envbox add API_KEY --type secret --required
```

Set a value without changing metadata:

```sh
bun run envbox set PORT 3000
```

Add a value to a scope:

```sh
bun run envbox add DATABASE_URL postgres://localhost:5432/app --scope db
```

Update a value in a scope:

```sh
bun run envbox update DATABASE_URL postgres://localhost:5432/app --scope db
```

`add` only creates new variables. Use `update` when the variable already exists.

List values:

```sh
bun run envbox list
```

Validate required variables and basic types:

```sh
bun run envbox validate
```

Show project status:

```sh
bun run envbox status
```

## Monorepos

For monorepos, initialize envbox at the repo root and create scopes for each app or package that needs its own `.env` file.

```sh
bun run envbox init
bun run envbox scope add web apps/web/.env NEXT_PUBLIC_API_URL
bun run envbox scope add api apps/api/.env DATABASE_URL PORT
bun run envbox scope add db packages/db/.env DATABASE_URL DIRECT_URL
```

Then manage each scope independently:

```sh
bun run envbox add NEXT_PUBLIC_API_URL http://localhost:3001 --scope web
bun run envbox add PORT 3001 --scope api
bun run envbox validate --scope web
bun run envbox validate --scope api
```

Reusable packages like `ui` or `utils` usually should not need their own `.env` file. Runtime packages like `db`, `auth`, or `stripe` can be modeled as scopes.

## Commands

```sh
bun install
bun run dev
bun run build
bun run lint
bun run typecheck
```
