import { loadConfig } from "../internal/config";
import { parseDotenv } from "../internal/dotenv";
import { EnvboxError } from "../internal/errors";
import { readPositionals, readStringOption } from "../internal/options";
import { value as formatValue } from "../internal/output";
import { assertVariableInScope, resolveScope } from "../internal/scopes";
import type { Command } from "../internal/types";
import { assertVariableName, maskValue } from "../internal/variables";

export const getCommand: Command = {
  name: "get",
  description: "Print a dotenv value",
  usage: "get NAME [--scope scope] [--show-secret]",
  async handler(args, context) {
    const [name] = readPositionals(args, ["--scope"]);
    const scopeName = readStringOption(args, "--scope");

    if (!name) {
      throw new EnvboxError("Usage: envbox get NAME [--scope scope] [--show-secret]");
    }

    assertVariableName(name);
    const loadedConfig = await loadConfig(context.cwd);
    const { config } = loadedConfig;

    if (scopeName) {
      assertVariableInScope(config, scopeName, name);
    }

    const scope = resolveScope(loadedConfig, scopeName, context.cwd);
    const values = (await Bun.file(scope.path).exists())
      ? parseDotenv(await Bun.file(scope.path).text())
      : {};
    const value = values[name];

    if (value === undefined) {
      throw new EnvboxError(`${name} is not set in ${scope.label}.`);
    }

    const variable = config.variables[name];
    context.stdout.log(
      formatValue(maskValue(value, Boolean(variable?.secret) && !args.includes("--show-secret"))),
    );
  },
};
