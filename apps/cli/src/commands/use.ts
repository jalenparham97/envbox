import { loadConfig, saveConfig } from "../internal/config";
import { EnvboxError } from "../internal/errors";
import { success } from "../internal/output";
import type { Command } from "../internal/types";

const profileNamePattern = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

export const useCommand: Command = {
  name: "use",
  description: "Switch the active profile",
  usage: "use profile",
  async handler(args, context) {
    const profileName = args[0];

    if (!profileName) {
      throw new EnvboxError("Usage: envbox use profile");
    }

    if (!profileNamePattern.test(profileName)) {
      throw new EnvboxError(
        "Profile names must start with a letter and use letters, numbers, underscores, or dashes.",
      );
    }

    const loadedConfig = await loadConfig(context.cwd);
    loadedConfig.config.activeProfile = profileName;

    await saveConfig(loadedConfig);
    context.stdout.log(success(`Using ${profileName}.`));
  },
};
