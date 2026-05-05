import { EnvboxError } from "./errors";
import type { VariableDefinition, VariableType } from "./types";

const variableNamePattern = /^[A-Z][A-Z0-9_]*$/;

export function assertVariableName(name: string): void {
  if (!variableNamePattern.test(name)) {
    throw new EnvboxError(
      "Variable names must use uppercase letters, numbers, and underscores, and start with a letter.",
    );
  }
}

export function createVariableDefinition(
  name: string,
  type: VariableType = "string",
): VariableDefinition {
  assertVariableName(name);

  return {
    name,
    type,
    required: false,
    secret: type === "secret",
  };
}

export function inferVariableType(value: string): VariableType {
  if (value === "true" || value === "false") {
    return "boolean";
  }

  if (value.trim() !== "" && !Number.isNaN(Number(value))) {
    return "number";
  }

  return "string";
}

export function maskValue(value: string, shouldMask: boolean): string {
  if (!shouldMask) {
    return value;
  }

  if (value.length <= 4) {
    return "****";
  }

  return `${value.slice(0, 2)}${"*".repeat(Math.min(value.length - 4, 8))}${value.slice(-2)}`;
}
