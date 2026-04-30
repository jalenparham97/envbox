import { loadConfig, saveConfig } from "../internal/config";
import { EnvboxError } from "../internal/errors";
import { success } from "../internal/output";
import { assertTargetName, createTarget } from "../internal/targets";
import type { Command } from "../internal/types";

export const targetCommand: Command = {
  name: "target",
  description: "Manage named dotenv targets",
  usage: "target <add|list|remove> ...",
  async handler(args, context) {
    const [action, name, path, ...variables] = args;

    if (action === "add") {
      if (!name || !path) {
        throw new EnvboxError("Usage: envbox target add NAME path [VARIABLE...]");
      }

      assertTargetName(name);
      const loadedConfig = await loadConfig(context.cwd);
      loadedConfig.config.targets[name] = createTarget(path, variables);
      await saveConfig(loadedConfig);
      context.stdout.log(success(`Added target ${name} -> ${path}.`));
      return;
    }

    if (action === "list") {
      const { config } = await loadConfig(context.cwd);
      const targets = Object.entries(config.targets);

      if (targets.length === 0) {
        context.stdout.log("No targets configured.");
        return;
      }

      for (const [targetName, target] of targets) {
        const variablesLabel =
          target.variables.length > 0 ? target.variables.join(", ") : "all variables";
        context.stdout.log(`${targetName}: ${target.path} (${variablesLabel})`);
      }
      return;
    }

    if (action === "remove") {
      if (!name) {
        throw new EnvboxError("Usage: envbox target remove NAME");
      }

      const loadedConfig = await loadConfig(context.cwd);

      if (!loadedConfig.config.targets[name]) {
        throw new EnvboxError(`${name} target does not exist.`);
      }

      delete loadedConfig.config.targets[name];
      await saveConfig(loadedConfig);
      context.stdout.log(success(`Removed target ${name}.`));
      return;
    }

    throw new EnvboxError("Usage: envbox target <add|list|remove> ...");
  },
};
