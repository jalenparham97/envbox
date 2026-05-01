import { loadConfig, saveConfig } from "../internal/config";
import { mergeDotenv } from "../internal/dotenv";
import { EnvboxError } from "../internal/errors";
import { hasFlag, readPositionals, readStringOption, readTypeOption } from "../internal/options";
import { success } from "../internal/output";
import { addVariableToScope, resolveScope } from "../internal/scopes";
import type { Command } from "../internal/types";
import { assertVariableName, inferVariableType } from "../internal/variables";

export const updateCommand: Command = {
  name: "update",
  description: "Update an existing variable",
  usage: "update NAME [value] [--scope scope] [--type type] [--required] [--secret]",
  async handler(args, context) {
    const [name, ...valueParts] = readPositionals(args, ["--scope", "--type"]);
    const scopeName = readStringOption(args, "--scope");
    const variableValue = valueParts.join(" ");

    if (!name) {
      throw new EnvboxError(
        "Usage: envbox update NAME [value] [--scope scope] [--type type] [--required] [--secret]",
      );
    }

    assertVariableName(name);
    const loadedConfig = await loadConfig(context.cwd);
    const variable = loadedConfig.config.variables[name];

    if (!variable) {
      throw new EnvboxError(`${name} does not exist. Use envbox add to create it.`);
    }

    if (args.includes("--type")) {
      variable.type = readTypeOption(args);
    }

    if (variableValue && !args.includes("--type") && !hasFlag(args, "--secret")) {
      variable.type = inferVariableType(variableValue);
      variable.secret = false;
    }

    if (hasFlag(args, "--required")) {
      variable.required = true;
    }

    if (hasFlag(args, "--secret")) {
      variable.type = "secret";
      variable.secret = true;
    }

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
      context.stdout.log(success(`Updated ${name} and wrote ${scope.label}.`));
      return;
    }

    context.stdout.log(success(`Updated ${name}.`));
  },
};
