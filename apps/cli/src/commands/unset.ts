import { loadConfig, saveConfig } from "../internal/config";
import { EnvboxError } from "../internal/errors";
import { success } from "../internal/output";
import type { Command } from "../internal/types";
import { assertVariableName } from "../internal/variables";

export const unsetCommand: Command = {
  name: "unset",
  description: "Remove a value from the active profile",
  usage: "unset NAME",
  async handler(args, context) {
    const name = args[0];

    if (!name) {
      throw new EnvboxError("Usage: envbox unset NAME");
    }

    assertVariableName(name);
    const loadedConfig = await loadConfig(context.cwd);
    const activeValues = loadedConfig.config.profiles[loadedConfig.config.activeProfile] ?? {};

    if (activeValues[name] === undefined) {
      throw new EnvboxError(`${name} is not set for ${loadedConfig.config.activeProfile}.`);
    }

    delete activeValues[name];
    await saveConfig(loadedConfig);
    context.stdout.log(success(`Unset ${name} for ${loadedConfig.config.activeProfile}.`));
  },
};
