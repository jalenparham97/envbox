import { basename, dirname, join, parse } from "node:path";

import { $ } from "bun";

import { EnvboxError } from "./errors";
import type { EnvboxConfig, EnvboxScope, VariableDefinition } from "./types";

export const configDirectoryName = ".envbox";
export const configFileName = "config.json";

export type LoadedConfig = {
  config: EnvboxConfig;
  path: string;
};

export type CreateConfigOptions = {
  projectName?: string;
  activeProfile?: string;
  variables?: Record<string, VariableDefinition>;
  scopes?: Record<string, EnvboxScope>;
};

export async function createConfig(
  cwd: string,
  options: CreateConfigOptions = {},
): Promise<LoadedConfig> {
  const path = getConfigPath(cwd);

  if (await fileExists(path)) {
    throw new EnvboxError(`Envbox config already exists at ${path}.`);
  }

  const config: EnvboxConfig = {
    projectName: options.projectName ?? basename(cwd),
    activeProfile: options.activeProfile ?? "dev",
    variables: options.variables ?? {},
    scopes: options.scopes ?? {},
  };

  await saveConfig({ config, path });

  return { config, path };
}

export async function loadConfig(cwd: string): Promise<LoadedConfig> {
  const path = await findConfigPath(cwd);

  if (!path) {
    throw new EnvboxError("No envbox config found. Run envbox init first.");
  }

  try {
    const contents = await Bun.file(path).text();
    const config = normalizeConfig(JSON.parse(contents) as Partial<EnvboxConfig>);

    return { config, path };
  } catch {
    throw new EnvboxError(`Could not read envbox config at ${path}.`);
  }
}

export async function saveConfig(loadedConfig: LoadedConfig): Promise<void> {
  await $`mkdir -p ${dirname(loadedConfig.path)}`.quiet();
  await Bun.write(loadedConfig.path, `${JSON.stringify(loadedConfig.config, null, 2)}\n`);
}

function getConfigPath(cwd: string): string {
  return join(cwd, configDirectoryName, configFileName);
}

async function findConfigPath(startDirectory: string): Promise<string | null> {
  let currentDirectory = startDirectory;

  while (true) {
    const path = getConfigPath(currentDirectory);

    if (await fileExists(path)) {
      return path;
    }

    const parentDirectory = dirname(currentDirectory);

    if (parentDirectory === currentDirectory || parse(currentDirectory).root === currentDirectory) {
      return null;
    }

    currentDirectory = parentDirectory;
  }
}

async function fileExists(path: string): Promise<boolean> {
  return Bun.file(path).exists();
}

function normalizeConfig(config: Partial<EnvboxConfig>): EnvboxConfig {
  return {
    projectName: config.projectName ?? "envbox",
    activeProfile: config.activeProfile ?? "dev",
    variables: config.variables ?? {},
    scopes: config.scopes ?? {},
  };
}
