import { loadConfig } from "../internal/config";
import { EnvboxError } from "../internal/errors";
import { readPositionals, readStringOption } from "../internal/options";
import { assertVariableInTarget } from "../internal/targets";
import type { Command } from "../internal/types";
import { assertVariableName, maskValue } from "../internal/variables";

export const getCommand: Command = {
  name: "get",
  description: "Print a value from the active profile",
  usage: "get NAME [--target target] [--show-secret]",
  async handler(args, context) {
    const [name] = readPositionals(args, ["--target"]);
    const targetName = readStringOption(args, "--target");

    if (!name) {
      throw new EnvboxError("Usage: envbox get NAME [--target target] [--show-secret]");
    }

    assertVariableName(name);
    const { config } = await loadConfig(context.cwd);

    if (targetName) {
      assertVariableInTarget(config, targetName, name);
    }

    const value = config.profiles[config.activeProfile]?.[name];

    if (value === undefined) {
      throw new EnvboxError(`${name} is not set for ${config.activeProfile}.`);
    }

    const variable = config.variables[name];
    context.stdout.log(
      maskValue(value, Boolean(variable?.secret) && !args.includes("--show-secret")),
    );
  },
};
