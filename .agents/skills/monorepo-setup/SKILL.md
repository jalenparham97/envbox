---
name: monorepo-setup
description: "Use when setting up, scaffolding, or configuring a reusable JavaScript/TypeScript monorepo with Bun workspaces, Turborepo, TypeScript 6, shared tsconfig, Oxlint, Oxfmt, apps/, packages/, and internal workspace packages."
argument-hint: "Describe the apps, packages, framework, and package scope"
---

# Monorepo Setup Skill

Use this skill as the setup guide for a minimal Bun + Turbo monorepo with TypeScript 6, Oxlint, and Oxfmt.

Keep the setup generic and reusable. Use placeholder scope names like `@acme/` unless the user gives a real package scope. Prefer direct, minimal config over layered abstractions.

## Structure

Use this baseline structure:

```txt
repo/
  package.json
  turbo.json
  oxfmt.config.ts

  apps/
    web/
      package.json
      tsconfig.json
      oxlint.config.ts
      src/

    api/
      package.json
      tsconfig.json
      oxlint.config.ts
      src/

  packages/
    tsconfig/
      package.json
      base.json
      nextjs.json

    oxlint-config/
      package.json
      oxlint-base.config.ts
      oxlint-react.config.ts
      oxlint-next.config.ts

    ui/
      package.json
      tsconfig.json
      oxlint.config.ts
      src/

    utils/
      package.json
      tsconfig.json
      oxlint.config.ts
      src/
```

Adjust app and package names to the project. Do not add framework-specific folders or config unless the user asks for them or the existing project requires them.

## Root Package

The root `package.json` should only manage workspaces, shared scripts, and global tooling.

```json
{
  "private": true,
  "type": "module",
  "workspaces": ["apps/*", "packages/*"],
  "packageManager": "bun@latest",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "format": "oxfmt",
    "format:check": "oxfmt --check"
  },
  "devDependencies": {
    "turbo": "latest",
    "oxfmt": "latest",
    "typescript": "^6.0.0"
  }
}
```

Root scripts for app/package work must delegate to Turbo with `turbo run <task>`.

## Turbo

Keep Turbo generic. Each app and package should define its own `build`, `lint`, `typecheck`, and `dev` scripts.

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

Adjust `outputs` for the actual frameworks in use. Keep env configuration specific to the apps that need it.

## Shared TypeScript Config

Create `packages/tsconfig` as a private shared config package.

Use TypeScript 6 for the project, and check the latest official TypeScript setup guidance before installing or finalizing compiler options.

```json
{
  "name": "@acme/tsconfig",
  "version": "0.0.0",
  "private": true,
  "files": ["base.json", "nextjs.json"]
}
```

### `base.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "moduleDetection": "force",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "incremental": true
  }
}
```

### `nextjs.json`

Only include this when a Next.js app exists.

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }]
  }
}
```

### App Or Package `tsconfig.json`

```json
{
  "extends": "@acme/tsconfig/base.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist", ".next"]
}
```

For Next.js apps, extend `@acme/tsconfig/nextjs.json` instead.

## Shared Oxlint Config

Create `packages/oxlint-config` as a private shared lint config package.

```json
{
  "name": "@acme/oxlint-config",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "devDependencies": {
    "oxlint": "latest",
    "typescript": "^6.0.0"
  }
}
```

### Base Oxlint Config

```ts
import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript"],
  ignorePatterns: ["dist/**", "node_modules/**"],
  env: {
    builtin: true,
  },
  rules: {
    "no-unused-vars": "warn",
    "typescript/no-explicit-any": "warn",
    "typescript/consistent-type-imports": "warn",
  },
});
```

### App Or Package `oxlint.config.ts`

```ts
import { defineConfig } from "oxlint";

import baseConfig from "../oxlint-config/oxlint-base.config.ts";

export default defineConfig({
  ...baseConfig,
});
```

For Next.js apps, create an `oxlint-next.config.ts` preset with the `nextjs`, `react`, and `typescript` plugins, then import that preset from the app.

Use only the plugins needed for the project, such as `typescript`, `react`, `nextjs`, `jsx-a11y`, `import`, or `unicorn`.

## Root Oxfmt Config

Keep formatting centralized at the root.

```ts
import { defineConfig } from "oxfmt";

export default defineConfig({
  tabWidth: 2,
  printWidth: 100,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  arrowParens: "always",
  sortPackageJson: false,
  sortImports: {
    internalPattern: ["~/", "@/", "@acme/"],
  },
});
```

If using Tailwind, add the stylesheet path used for class sorting.

```ts
sortTailwindcss: {
  stylesheet: "./packages/ui/src/styles/globals.css",
}
```

## Internal Package Pattern

Use this for shared packages like `ui`, `utils`, `database`, or `config`.

```json
{
  "name": "@acme/utils",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "bun run typecheck",
    "lint": "oxlint",
    "typecheck": "tsc --noEmit"
  },
  "exports": {
    "./*": "./src/*.ts"
  },
  "devDependencies": {
    "@acme/tsconfig": "workspace:*",
    "oxlint": "latest",
    "typescript": "^6.0.0"
  }
}
```

## App Pattern

Apps should own their runtime scripts and consume shared packages through `workspace:*`.

```json
{
  "name": "@acme/web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "oxlint",
    "typecheck": "tsc --noEmit",
    "start": "next start"
  },
  "dependencies": {
    "@acme/ui": "workspace:*",
    "@acme/utils": "workspace:*"
  },
  "devDependencies": {
    "@acme/tsconfig": "workspace:*",
    "oxlint": "latest",
    "typescript": "^6.0.0"
  }
}
```

## Decision Points

- If the user asks for documentation only, create a concise markdown setup guide using this skill as the source.
- If the user asks to scaffold a repo, create the files directly using this skill as the source.
- If the user has an existing monorepo, inspect current package names, workspace aliases, package manager, and config style before editing.
- If the project uses Next.js, include a `nextjs.json` TypeScript config and a Next-focused Oxlint preset.
- If the project does not use React or Next.js, avoid React and Next-specific config.
- If the user provides an organization scope, replace `@acme/` with that scope everywhere.

## Validation

- Run Oxfmt check on created docs/configs when available.
- Run the narrowest relevant command for implementation changes, usually `bun install`, `bun run typecheck`, or `bun run lint` depending on scope.
- Do not add tests unless the user explicitly asks.

## Quality Criteria

- Root package orchestration is minimal.
- Turbo tasks live in `turbo.json`; package-specific work lives in package scripts.
- TypeScript config is shared from `packages/tsconfig`.
- TypeScript 6 is explicitly used and checked against current official setup guidance.
- Oxlint config is shared from `packages/oxlint-config`.
- Oxfmt config is centralized at the root.
- Apps and packages extend shared config instead of duplicating it.
- The final structure is generic, reusable, and not tied to a specific product unless requested.

## Minimum Rule

Root runs the monorepo. `packages/tsconfig` owns TypeScript defaults. `packages/oxlint-config` owns lint presets. Root `oxfmt.config.ts` owns formatting. Each app and package extends the shared config while keeping its own scripts local.
