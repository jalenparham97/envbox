import { createConfig } from "../internal/config";
import { success } from "../internal/output";
import type { Command } from "../internal/types";

export const initCommand: Command = {
  name: "init",
  description: "Create local envbox config",
  usage: "init [project-name]",
  async handler(args, context) {
    const projectName = args[0];
    const { path } = await createConfig(context.cwd, projectName);

    context.stdout.log(success(`Created envbox config at ${path}.`));
  },
};
