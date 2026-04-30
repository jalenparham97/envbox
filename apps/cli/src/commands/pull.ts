import { loadConfig } from "../internal/config";
import { formatDotenv, mergeDotenv } from "../internal/dotenv";
import { success } from "../internal/output";
import { filterValues, resolveTarget } from "../internal/targets";
import type { Command, CommandContext } from "../internal/types";

export const pullCommand: Command = {
  name: "pull",
  description: "Pull active profile values into dotenv",
  usage: "pull [target|file] [--force]",
  handler: pullDotenv,
};

export async function pullDotenv(args: string[], context: CommandContext): Promise<void> {
  const targetOrFile = args.find((arg) => !arg.startsWith("--"));

  const loadedConfig = await loadConfig(context.cwd);
  const { config } = loadedConfig;
  const target = resolveTarget(loadedConfig, targetOrFile, context.cwd);
  const values = filterValues(config.profiles[config.activeProfile] ?? {}, target.variables);
  const shouldForce = args.includes("--force");
  const contents =
    !shouldForce && (await Bun.file(target.path).exists())
      ? await Bun.file(target.path).text()
      : "";
  const nextContents = shouldForce ? formatDotenv(values) : mergeDotenv(contents, values);

  await Bun.write(target.path, nextContents);
  context.stdout.log(
    success(
      `Pulled ${Object.keys(values).length} variables from ${config.activeProfile} to ${target.label}.`,
    ),
  );
}
