import { loadConfig, saveConfig } from "@envbox/core/config";
import { removeDotenvValue } from "@envbox/core/dotenv";
import { EnvboxError } from "@envbox/core/errors";
import { readPositionals, readStringOption } from "../internal/options";
import { success } from "../internal/output";
import { resolveScope } from "@envbox/core/scopes";
import type { Command } from "../internal/types";
import { assertVariableName } from "@envbox/core/variables";

export const unsetCommand: Command = {
  name: "unset",
  description: "Remove a value from dotenv",
  usage: "unset NAME [--scope scope]",
  async handler(args, context) {
    const [name] = readPositionals(args, ["--scope"]);
    const scopeName = readStringOption(args, "--scope");

    if (!name) {
      throw new EnvboxError("Usage: envbox unset NAME");
    }

    assertVariableName(name);
    const loadedConfig = await loadConfig(context.cwd);
    const scope = resolveScope(loadedConfig, scopeName, context.cwd);

    if (!(await Bun.file(scope.path).exists())) {
      throw new EnvboxError(`${scope.label} does not exist.`);
    }

    const contents = await Bun.file(scope.path).text();
    await saveConfig(loadedConfig);
    await Bun.write(scope.path, removeDotenvValue(contents, name));
    context.stdout.log(success(`Unset ${name} from ${scope.label}.`));
  },
};
