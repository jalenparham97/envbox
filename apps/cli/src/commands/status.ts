import { loadConfig } from "@envbox/core/config";
import { parseDotenv } from "@envbox/core/dotenv";
import { formatRows, value } from "../internal/output";
import { resolveScope } from "@envbox/core/scopes";
import type { Command } from "../internal/types";
import { validateConfig } from "@envbox/core/validation";

export const statusCommand: Command = {
  name: "status",
  description: "Show project status",
  usage: "status",
  async handler(_args, context) {
    const loadedConfig = await loadConfig(context.cwd);
    const { config, path } = loadedConfig;
    const defaultScope = resolveScope(loadedConfig, undefined, context.cwd);
    const values = (await Bun.file(defaultScope.path).exists())
      ? parseDotenv(await Bun.file(defaultScope.path).text())
      : {};
    const issues = validateConfig(config, values);

    context.stdout.log(
      formatRows([
        ["Project", value(config.projectName)],
        ["Profile", value(config.activeProfile)],
        ["Config", value(path)],
        [
          "Variables",
          value(
            `${Object.keys(values).length} in .env, ${Object.keys(config.variables).length} defined`,
          ),
        ],
        ["Scopes", value(String(Object.keys(config.scopes).length))],
        [
          "Validation",
          value(
            issues.length === 0
              ? "valid"
              : `${issues.length} issue${issues.length === 1 ? "" : "s"}`,
          ),
        ],
      ]),
    );
  },
};
