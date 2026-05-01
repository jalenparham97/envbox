import { loadConfig } from "../internal/config";
import { parseDotenv } from "../internal/dotenv";
import { readStringOption } from "../internal/options";
import { error, formatRows, success, value } from "../internal/output";
import { filterValues, resolveScope } from "../internal/scopes";
import type { Command } from "../internal/types";
import { validateConfig } from "../internal/validation";

export const validateCommand: Command = {
  name: "validate",
  description: "Validate required variables and basic types",
  usage: "validate [--scope scope]",
  async handler(args, context) {
    const loadedConfig = await loadConfig(context.cwd);
    const scopeName = readStringOption(args, "--scope");
    const scope = resolveScope(loadedConfig, scopeName, context.cwd);
    const values = filterValues(
      (await Bun.file(scope.path).exists()) ? parseDotenv(await Bun.file(scope.path).text()) : {},
      scope.variables,
    );
    const issues = validateConfig(loadedConfig.config, values);

    if (issues.length === 0) {
      context.stdout.log(success(`${scope.label} has no validation issues.`));
      return;
    }

    context.stdout.log(error(`${issues.length} issue${issues.length === 1 ? "" : "s"} found.`));
    context.stdout.log(formatRows(issues.map((issue) => [issue.name, value(issue.message)])));
  },
};
