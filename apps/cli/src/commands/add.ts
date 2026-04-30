import { loadConfig, saveConfig } from "../internal/config";
import { EnvboxError } from "../internal/errors";
import { hasFlag, readPositionals, readStringOption, readTypeOption } from "../internal/options";
import { success } from "../internal/output";
import { addVariableToTarget } from "../internal/targets";
import type { Command } from "../internal/types";
import { createVariableDefinition } from "../internal/variables";

export const addCommand: Command = {
  name: "add",
  description: "Add a variable definition",
  usage: "add NAME [--target target] [--type type] [--required] [--secret]",
  async handler(args, context) {
    const [name] = readPositionals(args, ["--target", "--type"]);
    const targetName = readStringOption(args, "--target");

    if (!name) {
      throw new EnvboxError(
        "Usage: envbox add NAME [--target target] [--type type] [--required] [--secret]",
      );
    }

    const loadedConfig = await loadConfig(context.cwd);

    if (loadedConfig.config.variables[name]) {
      if (!targetName) {
        throw new EnvboxError(`${name} already exists.`);
      }
    } else {
      const type = hasFlag(args, "--secret") ? "secret" : readTypeOption(args);
      const variable = createVariableDefinition(name, type);
      variable.required = hasFlag(args, "--required");
      variable.secret = variable.secret || hasFlag(args, "--secret");
      loadedConfig.config.variables[name] = variable;
    }

    if (targetName) {
      addVariableToTarget(loadedConfig.config, targetName, name);
    }

    await saveConfig(loadedConfig);
    context.stdout.log(success(targetName ? `Added ${name} to ${targetName}.` : `Added ${name}.`));
  },
};
