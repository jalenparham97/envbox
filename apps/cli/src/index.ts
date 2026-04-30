#!/usr/bin/env bun

import { commands } from "./commands/registry";
import { EnvboxError } from "./internal/errors";
import { error } from "./internal/output";
import type { CommandContext } from "./internal/types";

const context: CommandContext = {
  cwd: process.cwd(),
  stdout: console,
  stderr: console,
};

const [commandName, ...args] = Bun.argv.slice(2);
const command = commands.find((candidateCommand) => candidateCommand.name === commandName);

if (!commandName || commandName === "help" || commandName === "--help" || commandName === "-h") {
  const { printHelp } = await import("./internal/commands");
  printHelp(commands);
  process.exit(0);
}

if (!command) {
  context.stderr.error(
    error(`Unknown command "${commandName}". Run envbox help for available commands.`),
  );
  process.exit(1);
}

try {
  await command.handler(args, context);
} catch (caughtError) {
  if (caughtError instanceof EnvboxError) {
    context.stderr.error(error(caughtError.message));
    process.exit(1);
  }

  throw caughtError;
}
