import type { Command } from "./types";

export function printHelp(commands: Command[]): void {
  console.log("envbox - manage local environment profiles");
  console.log("");
  console.log("Usage: envbox <command> [args]");
  console.log("");
  console.log("Commands:");

  for (const command of commands) {
    console.log(`  ${command.usage.padEnd(34)} ${command.description}`);
  }
}
