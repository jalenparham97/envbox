import { loadConfig, saveConfig } from "../internal/config";
import { parseDotenv } from "../internal/dotenv";
import { success } from "../internal/output";
import { filterValues, resolveTarget } from "../internal/targets";
import type { Command, CommandContext } from "../internal/types";
import { assertVariableName } from "../internal/variables";

export const pushCommand: Command = {
  name: "push",
  description: "Push dotenv values into the active profile",
  usage: "push [target|file]",
  handler: pushDotenv,
};

export async function pushDotenv(args: string[], context: CommandContext): Promise<void> {
  const targetOrFile = args.find((arg) => !arg.startsWith("--"));
  const loadedConfig = await loadConfig(context.cwd);
  const target = resolveTarget(loadedConfig, targetOrFile, context.cwd);

  if (!(await Bun.file(target.path).exists())) {
    await Bun.write(target.path, "");
  }

  const contents = await Bun.file(target.path).text();
  const values = filterValues(parseDotenv(contents), target.variables);
  const activeValues = (loadedConfig.config.profiles[loadedConfig.config.activeProfile] ??= {});

  for (const [name, value] of Object.entries(values)) {
    assertVariableName(name);
    loadedConfig.config.variables[name] ??= {
      name,
      type: "string",
      required: false,
      secret: false,
    };
    activeValues[name] = value;
  }

  await saveConfig(loadedConfig);
  context.stdout.log(
    success(
      `Pushed ${Object.keys(values).length} variables from ${target.label} into ${loadedConfig.config.activeProfile}.`,
    ),
  );
}
