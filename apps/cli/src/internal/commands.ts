import { brand, heading, muted } from "./output";
import type { Command } from "./types";

export function printHelp(commands: Command[]): void {
  console.log(`${brand("envbox")} ${muted("manage local .env files")}`);
  console.log("");
  console.log(`${heading("Usage")} envbox <command> [args]`);
  console.log("");
  console.log(heading("Commands"));

  for (const command of commands) {
    console.log(`  ${command.usage.padEnd(38)} ${muted(command.description)}`);
  }
}
