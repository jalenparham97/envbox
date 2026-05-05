import { dirname, resolve } from "node:path";

import type { LoadedConfig } from "./config";
import { EnvboxError } from "./errors";
import type { EnvboxConfig, EnvboxScope } from "./types";
import { assertVariableName } from "./variables";

const scopeNamePattern = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

export type ResolvedScope = {
  label: string;
  path: string;
  variables: string[] | null;
};

export function assertScopeName(name: string): void {
  if (!scopeNamePattern.test(name)) {
    throw new EnvboxError(
      "Scope names must start with a letter and use letters, numbers, underscores, or dashes.",
    );
  }
}

export function createScope(path: string, variables: string[]): EnvboxScope {
  for (const variable of variables) {
    assertVariableName(variable);
  }

  return { path, variables };
}

export function resolveScope(
  loadedConfig: LoadedConfig,
  arg: string | undefined,
  cwd: string,
): ResolvedScope {
  const scopeOrFile = arg ?? ".env";
  const scope = loadedConfig.config.scopes[scopeOrFile];

  if (scope) {
    return {
      label: scopeOrFile,
      path: resolve(getProjectRoot(loadedConfig), scope.path),
      variables: scope.variables,
    };
  }

  return {
    label: scopeOrFile,
    path: resolve(cwd, scopeOrFile),
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

export function addVariableToScope(
  config: EnvboxConfig,
  scopeName: string,
  variableName: string,
): void {
  const scope = config.scopes[scopeName];

  if (!scope) {
    throw new EnvboxError(`${scopeName} scope does not exist.`);
  }

  if (scope.variables.length > 0 && !scope.variables.includes(variableName)) {
    scope.variables.push(variableName);
  }
}

export function assertVariableInScope(
  config: EnvboxConfig,
  scopeName: string,
  variableName: string,
): void {
  const scope = config.scopes[scopeName];

  if (!scope) {
    throw new EnvboxError(`${scopeName} scope does not exist.`);
  }

  if (scope.variables.length > 0 && !scope.variables.includes(variableName)) {
    throw new EnvboxError(`${variableName} is not assigned to the ${scopeName} scope.`);
  }
}

function getProjectRoot(loadedConfig: LoadedConfig): string {
  return dirname(dirname(loadedConfig.path));
}
