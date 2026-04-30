import { loadConfig, saveConfig } from "../internal/config";
import { mergeDotenv } from "../internal/dotenv";
import { EnvboxError } from "../internal/errors";
import { readPositionals, readStringOption } from "../internal/options";
import { success } from "../internal/output";
import { addVariableToTarget, filterValues, resolveTarget } from "../internal/targets";
import type { Command } from "../internal/types";
import { assertVariableName } from "../internal/variables";

export const setCommand: Command = {
  name: "set",
  description: "Set a value in the active profile",
  usage: "set NAME value [--target target]",
  async handler(args, context) {
    const [name, ...valueParts] = readPositionals(args, ["--target"]);
    const targetName = readStringOption(args, "--target");
    const value = valueParts.join(" ");

    if (!name || !value) {
      throw new EnvboxError("Usage: envbox set NAME value [--target target]");
    }

    assertVariableName(name);
    const loadedConfig = await loadConfig(context.cwd);

    loadedConfig.config.variables[name] ??= {
      name,
      type: "string",
      required: false,
      secret: false,
    };

    loadedConfig.config.profiles[loadedConfig.config.activeProfile] ??= {};
    loadedConfig.config.profiles[loadedConfig.config.activeProfile][name] = value;

    if (targetName) {
      addVariableToTarget(loadedConfig.config, targetName, name);
    }

    await saveConfig(loadedConfig);

    if (targetName) {
      const target = resolveTarget(loadedConfig, targetName, context.cwd);
      const targetValues = filterValues(
        loadedConfig.config.profiles[loadedConfig.config.activeProfile] ?? {},
        target.variables,
      );
      const contents = (await Bun.file(target.path).exists())
        ? await Bun.file(target.path).text()
        : "";

      await Bun.write(target.path, mergeDotenv(contents, targetValues));
      context.stdout.log(
        success(`Set ${name} for ${loadedConfig.config.activeProfile} and pulled ${target.label}.`),
      );
      return;
    }

    context.stdout.log(success(`Set ${name} for ${loadedConfig.config.activeProfile}.`));
  },
};
