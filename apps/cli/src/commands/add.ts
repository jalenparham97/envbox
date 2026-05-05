import { loadConfig, saveConfig } from "@envbox/core/config";
import { mergeDotenv } from "@envbox/core/dotenv";
import { EnvboxError } from "@envbox/core/errors";
import { hasFlag, readPositionals, readStringOption, readTypeOption } from "../internal/options";
import { success } from "../internal/output";
import { promptConfirm, promptScopeName, promptText, promptType } from "../internal/prompts";
import { addVariableToScope, resolveScope } from "@envbox/core/scopes";
import type { Command } from "../internal/types";
import {
  assertVariableName,
  createVariableDefinition,
  inferVariableType,
} from "@envbox/core/variables";

export const addCommand: Command = {
  name: "add",
  description: "Add a variable definition",
  usage: "add NAME [value] [--scope scope] [--type type] [--required] [--secret]",
  async handler(args, context) {
    const [nameArg, ...valueParts] = readPositionals(args, ["--scope", "--type"]);
    const isInteractive = !nameArg;
    const loadedConfig = await loadConfig(context.cwd);
    const name =
      nameArg ??
      (await promptText({
        message: "Variable name",
        placeholder: "DATABASE_URL",
        validate(value) {
          if (!value) {
            return "Variable name is required.";
          }

          try {
            assertVariableName(value);
          } catch (error) {
            return error instanceof EnvboxError ? error.message : "Invalid variable name.";
          }
        },
      }));
    const variableValue = isInteractive
      ? await promptText({ message: "Value", placeholder: "optional", defaultValue: "" })
      : valueParts.join(" ");
    const scopeName =
      readStringOption(args, "--scope") ??
      (isInteractive ? await promptScopeName(Object.keys(loadedConfig.config.scopes)) : undefined);

    if (!name) {
      throw new EnvboxError(
        "Usage: envbox add NAME [value] [--scope scope] [--type type] [--required] [--secret]",
      );
    }

    if (loadedConfig.config.variables[name]) {
      throw new EnvboxError(`${name} already exists. Use envbox update to change it.`);
    }

    const inferredType = hasFlag(args, "--secret")
      ? "secret"
      : args.includes("--type")
        ? readTypeOption(args)
        : inferVariableType(variableValue);
    const type =
      isInteractive && !args.includes("--type") && !hasFlag(args, "--secret")
        ? await promptType(inferredType)
        : inferredType;
    const variable = createVariableDefinition(name, type);
    variable.required =
      hasFlag(args, "--required") ||
      (isInteractive ? await promptConfirm({ message: "Required?", initialValue: false }) : false);
    variable.secret = variable.secret || hasFlag(args, "--secret");
    loadedConfig.config.variables[name] = variable;

    if (scopeName) {
      addVariableToScope(loadedConfig.config, scopeName, name);
    }

    await saveConfig(loadedConfig);

    if (variableValue) {
      const scope = resolveScope(loadedConfig, scopeName, context.cwd);
      const contents = (await Bun.file(scope.path).exists())
        ? await Bun.file(scope.path).text()
        : "";

      await Bun.write(scope.path, mergeDotenv(contents, { [name]: variableValue }));
      context.stdout.log(success(`Added ${name} and wrote ${scope.label}.`));
      return;
    }

    context.stdout.log(success(scopeName ? `Added ${name} to ${scopeName}.` : `Added ${name}.`));
  },
};
