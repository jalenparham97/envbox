import { dirname, resolve } from "node:path";

import type { LoadedConfig } from "./config";
import { EnvboxError } from "./errors";
import type { EnvboxConfig, EnvboxTarget } from "./types";
import { assertVariableName } from "./variables";

const targetNamePattern = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

export type ResolvedTarget = {
  label: string;
  path: string;
  variables: string[] | null;
};

export function assertTargetName(name: string): void {
  if (!targetNamePattern.test(name)) {
    throw new EnvboxError(
      "Target names must start with a letter and use letters, numbers, underscores, or dashes.",
    );
  }
}

export function createTarget(path: string, variables: string[]): EnvboxTarget {
  for (const variable of variables) {
    assertVariableName(variable);
  }

  return { path, variables };
}

export function resolveTarget(
  loadedConfig: LoadedConfig,
  arg: string | undefined,
  cwd: string,
): ResolvedTarget {
  const targetOrFile = arg ?? ".env";
  const target = loadedConfig.config.targets[targetOrFile];

  if (target) {
    return {
      label: targetOrFile,
      path: resolve(getProjectRoot(loadedConfig), target.path),
      variables: target.variables,
    };
  }

  return {
    label: targetOrFile,
    path: resolve(cwd, targetOrFile),
    variables: null,
  };
}

export function filterValues(
  values: Record<string, string>,
  variables: string[] | null,
): Record<string, string> {
  if (!variables) {
    return values;
  }

  const filteredValues: Record<string, string> = {};

  for (const variable of variables) {
    const value = values[variable];

    if (value !== undefined) {
      filteredValues[variable] = value;
    }
  }

  return filteredValues;
}

export function addVariableToTarget(
  config: EnvboxConfig,
  targetName: string,
  variableName: string,
): void {
  const target = config.targets[targetName];

  if (!target) {
    throw new EnvboxError(`${targetName} target does not exist.`);
  }

  if (target.variables.length > 0 && !target.variables.includes(variableName)) {
    target.variables.push(variableName);
  }
}

export function assertVariableInTarget(
  config: EnvboxConfig,
  targetName: string,
  variableName: string,
): void {
  const target = config.targets[targetName];

  if (!target) {
    throw new EnvboxError(`${targetName} target does not exist.`);
  }

  if (target.variables.length > 0 && !target.variables.includes(variableName)) {
    throw new EnvboxError(`${variableName} is not assigned to the ${targetName} target.`);
  }
}

function getProjectRoot(loadedConfig: LoadedConfig): string {
  return dirname(dirname(loadedConfig.path));
}
