import { EnvboxError } from "../internal/errors";
import type { Command, CommandContext } from "../internal/types";

export const pullCommand: Command = {
  name: "pull",
  description: "Deprecated: dotenv files are the source of truth",
  usage: "pull [scope|file] [--force]",
  handler: pullDotenv,
};

export async function pullDotenv(args: string[], context: CommandContext): Promise<void> {
  void args;
  void context;
  throw new EnvboxError("pull is no longer needed because .env files are the source of truth.");
}
