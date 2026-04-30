import { loadConfig } from "../internal/config";
import type { Command } from "../internal/types";
import { validateConfig } from "../internal/validation";

export const validateCommand: Command = {
  name: "validate",
  description: "Validate required variables and basic types",
  usage: "validate",
  async handler(_args, context) {
    const { config } = await loadConfig(context.cwd);
    const issues = validateConfig(config);

    if (issues.length === 0) {
      context.stdout.log(`Valid: ${config.activeProfile} has no validation issues.`);
      return;
    }

    context.stdout.log(`Invalid: ${issues.length} issue${issues.length === 1 ? "" : "s"} found.`);

    for (const issue of issues) {
      context.stdout.log(`- ${issue.name}: ${issue.message}`);
    }
  },
};
