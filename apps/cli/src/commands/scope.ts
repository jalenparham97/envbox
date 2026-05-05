import { loadConfig, saveConfig } from "@envbox/core/config";
import { EnvboxError } from "@envbox/core/errors";
import { formatRows, muted, success, value } from "../internal/output";
import { parseVariableList, promptText } from "../internal/prompts";
import { assertScopeName, createScope } from "@envbox/core/scopes";
import type { Command } from "../internal/types";

export const scopeCommand: Command = {
  name: "scope",
  description: "Manage named dotenv scopes",
  usage: "scope <add|list|remove> ...",
  async handler(args, context) {
    const [action, nameArg, pathArg, ...variableArgs] = args;

    if (action === "add") {
      const name =
        nameArg ??
        (await promptText({
          message: "Scope name",
          placeholder: "web",
          validate(value) {
            if (!value) {
              return "Scope name is required.";
            }

            try {
              assertScopeName(value);
            } catch (error) {
              return error instanceof EnvboxError ? error.message : "Invalid scope name.";
            }
          },
        }));
      const path =
        pathArg ?? (await promptText({ message: ".env path", placeholder: "apps/web/.env" }));
      const variables =
        variableArgs.length > 0
          ? variableArgs
          : parseVariableList(
              await promptText({
                message: "Variables",
                placeholder: "NEXT_PUBLIC_API_URL API_URL",
                defaultValue: "",
              }),
            );

      if (!name || !path) {
        throw new EnvboxError("Usage: envbox scope add NAME path [VARIABLE...]");
      }

      assertScopeName(name);
      const loadedConfig = await loadConfig(context.cwd);
      loadedConfig.config.scopes[name] = createScope(path, variables);
      await saveConfig(loadedConfig);
      context.stdout.log(success(`Added scope ${name} -> ${path}.`));
      return;
    }

    if (action === "list") {
      const { config } = await loadConfig(context.cwd);
      const scopes = Object.entries(config.scopes);

      if (scopes.length === 0) {
        context.stdout.log(muted("No scopes configured."));
        return;
      }

      const rows = scopes.map(([scopeName, scope]): [string, string] => {
        const variablesLabel =
          scope.variables.length > 0 ? scope.variables.join(", ") : "all variables";

        return [scopeName, `${value(scope.path)} ${muted(`(${variablesLabel})`)}`];
      });

      context.stdout.log(formatRows(rows));
      return;
    }

    if (action === "remove") {
      if (!nameArg) {
        throw new EnvboxError("Usage: envbox scope remove NAME");
      }

      const loadedConfig = await loadConfig(context.cwd);

      if (!loadedConfig.config.scopes[nameArg]) {
        throw new EnvboxError(`${nameArg} scope does not exist.`);
      }

      delete loadedConfig.config.scopes[nameArg];
      await saveConfig(loadedConfig);
      context.stdout.log(success(`Removed scope ${nameArg}.`));
      return;
    }

    throw new EnvboxError("Usage: envbox scope <add|list|remove> ...");
  },
};
