import { loadConfig, saveConfig } from "@envbox/core/config";
import { parseDotenv } from "@envbox/core/dotenv";
import { success } from "../internal/output";
import { filterValues, resolveScope } from "@envbox/core/scopes";
import type { Command, CommandContext } from "../internal/types";
import {
  assertVariableName,
  createVariableDefinition,
  inferVariableType,
} from "@envbox/core/variables";

export const pushCommand: Command = {
  name: "push",
  description: "Import dotenv variables into envbox metadata",
  usage: "push [scope|file]",
  handler: pushDotenv,
};

export async function pushDotenv(args: string[], context: CommandContext): Promise<void> {
  const scopeOrFile = args.find((arg) => !arg.startsWith("--"));
  const loadedConfig = await loadConfig(context.cwd);
  const scope = resolveScope(loadedConfig, scopeOrFile, context.cwd);

  if (!(await Bun.file(scope.path).exists())) {
    await Bun.write(scope.path, "");
  }

  const contents = await Bun.file(scope.path).text();
  const values = filterValues(parseDotenv(contents), scope.variables);

  for (const [name, value] of Object.entries(values)) {
    assertVariableName(name);
    loadedConfig.config.variables[name] ??= createVariableDefinition(
      name,
      inferVariableType(value),
    );
  }

  await saveConfig(loadedConfig);
  context.stdout.log(
    success(`Imported ${Object.keys(values).length} variables from ${scope.label}.`),
  );
}
