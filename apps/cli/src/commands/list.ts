import { loadConfig } from "../internal/config";
import type { Command } from "../internal/types";
import { maskValue } from "../internal/variables";

export const listCommand: Command = {
  name: "list",
  description: "List values for the active profile",
  usage: "list [--show-secrets]",
  async handler(args, context) {
    const { config } = await loadConfig(context.cwd);
    const values = config.profiles[config.activeProfile] ?? {};
    const entries = Object.entries(values);

    if (entries.length === 0) {
      context.stdout.log(`No variables set for ${config.activeProfile}.`);
      return;
    }

    for (const [name, value] of entries) {
      const variable = config.variables[name];
      const visibleValue = maskValue(
        value,
        Boolean(variable?.secret) && !args.includes("--show-secrets"),
      );
      context.stdout.log(`${name}=${visibleValue}`);
    }
  },
};
