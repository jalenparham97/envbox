import { basename, dirname, join, parse } from "node:path";

import { $ } from "bun";

import { EnvboxError } from "./errors";
import type { EnvboxConfig } from "./types";

export const configDirectoryName = ".envbox";
export const configFileName = "config.json";

export type LoadedConfig = {
  config: EnvboxConfig;
  path: string;
};

export async function createConfig(cwd: string, projectName?: string): Promise<LoadedConfig> {
  const path = getConfigPath(cwd);

  if (await fileExists(path)) {
    throw new EnvboxError(`Envbox config already exists at ${path}.`);
  }

  const config: EnvboxConfig = {
    projectName: projectName ?? basename(cwd),
    activeProfile: "dev",
    variables: {},
    profiles: {
      dev: {},
    },
    targets: {},
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
    const config = JSON.parse(contents) as EnvboxConfig;
    config.profiles[config.activeProfile] ??= {};
    config.targets ??= {};

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
