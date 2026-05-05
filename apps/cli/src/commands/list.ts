import { loadConfig } from "@envbox/core/config";
import { parseDotenv } from "@envbox/core/dotenv";
import { readStringOption } from "../internal/options";
import { formatRows, muted, value } from "../internal/output";
import { filterValues, resolveScope } from "@envbox/core/scopes";
import type { Command } from "../internal/types";
import { maskValue } from "@envbox/core/variables";

export const listCommand: Command = {
  name: "list",
  description: "List dotenv values",
  usage: "list [--scope scope] [--show-secrets]",
  async handler(args, context) {
    const loadedConfig = await loadConfig(context.cwd);
    const { config } = loadedConfig;
    const scopeName = readStringOption(args, "--scope");
    const scope = resolveScope(loadedConfig, scopeName, context.cwd);
    const values = filterValues(
      (await Bun.file(scope.path).exists()) ? parseDotenv(await Bun.file(scope.path).text()) : {},
      scope.variables,
    );
    const entries = Object.entries(values);

    if (entries.length === 0) {
      context.stdout.log(muted(`No variables set in ${scope.label}.`));
      return;
    }

    const rows = entries.map(([name, currentValue]): [string, string] => {
      const variable = config.variables[name];
      const visibleValue = maskValue(
        currentValue,
        Boolean(variable?.secret) && !args.includes("--show-secrets"),
      );

      return [name, value(visibleValue)];
    });

    context.stdout.log(formatRows(rows));
  },
};
