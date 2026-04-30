import type { Command } from "../internal/types";
import { addCommand } from "./add";
import { getCommand } from "./get";
import { initCommand } from "./init";
import { listCommand } from "./list";
import { pullCommand } from "./pull";
import { pushCommand } from "./push";
import { setCommand } from "./set";
import { statusCommand } from "./status";
import { targetCommand } from "./target";
import { unsetCommand } from "./unset";
import { useCommand } from "./use";
import { validateCommand } from "./validate";

export const commands: Command[] = [
  initCommand,
  addCommand,
  listCommand,
  getCommand,
  setCommand,
  unsetCommand,
  useCommand,
  validateCommand,
  pushCommand,
  pullCommand,
  targetCommand,
  statusCommand,
];
