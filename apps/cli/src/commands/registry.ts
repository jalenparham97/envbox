import type { Command } from "../internal/types";
import { addCommand } from "./add";
import { getCommand } from "./get";
import { initCommand } from "./init";
import { listCommand } from "./list";
import { pullCommand } from "./pull";
import { pushCommand } from "./push";
import { scopeCommand } from "./scope";
import { setCommand } from "./set";
import { statusCommand } from "./status";
import { unsetCommand } from "./unset";
import { updateCommand } from "./update";
import { useCommand } from "./use";
import { validateCommand } from "./validate";

export const commands: Command[] = [
  initCommand,
  addCommand,
  listCommand,
  getCommand,
  setCommand,
  updateCommand,
  unsetCommand,
  useCommand,
  validateCommand,
  pushCommand,
  pullCommand,
  scopeCommand,
  statusCommand,
];
