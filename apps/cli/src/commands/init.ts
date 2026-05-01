import { basename, resolve } from "node:path";

import { createConfig } from "../internal/config";
import { parseDotenv } from "../internal/dotenv";
import { success } from "../internal/output";
import { parseVariableList, promptConfirm, promptText } from "../internal/prompts";
import { assertScopeName, createScope } from "../internal/scopes";
import type { Command } from "../internal/types";
import { createVariableDefinition, inferVariableType } from "../internal/variables";

export const initCommand: Command = {
  name: "init",
  description: "Create local envbox config",
  usage: "init [project-name]",
  async handler(args, context) {
    const isInteractive = args.length === 0;
    const defaultProjectName = basename(context.cwd);
    const projectName =
      args[0] ??
      (await promptText({
        message: "Project name",
        defaultValue: defaultProjectName,
        placeholder: defaultProjectName,
      }));
    const activeProfile = isInteractive
      ? await promptText({ message: "Default profile", defaultValue: "dev", placeholder: "dev" })
      : "dev";
    const variables: Record<string, ReturnType<typeof createVariableDefinition>> = {};
    const scopes: Parameters<typeof createConfig>[1]["scopes"] = {};
    const rootDotenvPath = resolve(context.cwd, ".env");
    const shouldCreateRootDotenv =
      isInteractive &&
      !(await Bun.file(rootDotenvPath).exists()) &&
      (await promptConfirm({ message: "Create a root .env file?", initialValue: true }));

    if (shouldCreateRootDotenv) {
      await Bun.write(rootDotenvPath, "");
    }

    if (
      isInteractive &&
      (await promptConfirm({ message: "Add a scope now?", initialValue: false }))
    ) {
      const scopeName = await promptText({
        message: "Scope name",
        defaultValue: "app",
        placeholder: "web",
        validate(value) {
          try {
            assertScopeName(value);
          } catch {
            return "Use letters, numbers, underscores, or dashes.";
          }
        },
      });
        message: ".env path",
        defaultValue: ".env",
        placeholder: "apps/web/.env",
      });
      const scopeVariables = parseVariableList(
        await promptText({
          message: "Variables (optional)",
          placeholder: "DATABASE_URL API_KEY",
          defaultValue: "",
        }),
      );
      const dotenvPath = resolve(context.cwd, scopePath);
      const shouldImportValues =
        (await Bun.file(dotenvPath).exists()) &&
        (await promptConfirm({ message: `Import values from ${scopePath}?`, initialValue: true }));

      scopes[scopeName] = createScope(scopePath, scopeVariables);

      for (const variableName of scopeVariables) {
        variables[variableName] = createVariableDefinition(variableName);
      }

      if (shouldImportValues) {
        const values = parseDotenv(await Bun.file(dotenvPath).text());
        const importedValues = scopeVariables.length > 0 ? scopeVariables : Object.keys(values);

        for (const variableName of importedValues) {
          const value = values[variableName];

          if (value === undefined) {
            continue;
          }

          variables[variableName] = createVariableDefinition(
            variableName,
            inferVariableType(value),
          );
          profileValues[variableName] = value;
        }
      }
    }

    const { path } = await createConfig(context.cwd, {
      projectName,
      activeProfile,
      variables,
      scopes,
    });

    context.stdout.log(success(`Created envbox config at ${path}.`));
  },
};
