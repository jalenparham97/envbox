import { loadConfig } from "../internal/config";
import type { Command } from "../internal/types";
import { validateConfig } from "../internal/validation";

export const statusCommand: Command = {
  name: "status",
  description: "Show project and active profile status",
  usage: "status",
  async handler(_args, context) {
    const { config, path } = await loadConfig(context.cwd);
    const values = config.profiles[config.activeProfile] ?? {};
    const issues = validateConfig(config);

    context.stdout.log(`Project: ${config.projectName}`);
    context.stdout.log(`Active profile: ${config.activeProfile}`);
    context.stdout.log(`Config: ${path}`);
    context.stdout.log(
      `Variables: ${Object.keys(values).length} set, ${Object.keys(config.variables).length} defined`,
    );
    context.stdout.log(`Targets: ${Object.keys(config.targets).length}`);
    context.stdout.log(
      `Validation: ${issues.length === 0 ? "valid" : `${issues.length} issue${issues.length === 1 ? "" : "s"}`}`,
    );
  },
};
