import { loadConfig, saveConfig } from "../internal/config";
import { mergeDotenv } from "../internal/dotenv";
import { EnvboxError } from "../internal/errors";
import { readPositionals, readStringOption } from "../internal/options";
import { success } from "../internal/output";
import { addVariableToScope, resolveScope } from "../internal/scopes";
import type { Command } from "../internal/types";
import { assertVariableName } from "../internal/variables";

export const setCommand: Command = {
  name: "set",
  description: "Set a dotenv value",
  usage: "set NAME value [--scope scope]",
  async handler(args, context) {
    const [name, ...valueParts] = readPositionals(args, ["--scope"]);
    const scopeName = readStringOption(args, "--scope");
    const value = valueParts.join(" ");

    if (!name || !value) {
      throw new EnvboxError("Usage: envbox set NAME value [--scope scope]");
    }

    assertVariableName(name);
    const loadedConfig = await loadConfig(context.cwd);

    loadedConfig.config.variables[name] ??= {
      name,
      type: "string",
      required: false,
      secret: false,
    };

    if (scopeName) {
      addVariableToScope(loadedConfig.config, scopeName, name);
    }

    await saveConfig(loadedConfig);

    if (scopeName) {
      const scope = resolveScope(loadedConfig, scopeName, context.cwd);
      const contents = (await Bun.file(scope.path).exists())
        ? await Bun.file(scope.path).text()
        : "";

      await Bun.write(scope.path, mergeDotenv(contents, { [name]: value }));
      context.stdout.log(success(`Set ${name} and wrote ${scope.label}.`));
      return;
    }

    const scope = resolveScope(loadedConfig, undefined, context.cwd);
    const contents = (await Bun.file(scope.path).exists()) ? await Bun.file(scope.path).text() : "";
    await Bun.write(scope.path, mergeDotenv(contents, { [name]: value }));
    context.stdout.log(success(`Set ${name} and wrote ${scope.label}.`));
  },
};
