import { EnvboxError } from "./errors";
import type { VariableType } from "./types";

const variableTypes = new Set<VariableType>(["string", "number", "boolean", "secret"]);

export function readTypeOption(args: string[]): VariableType {
  const typeIndex = args.indexOf("--type");

  if (typeIndex === -1) {
    return "string";
  }

  const type = args[typeIndex + 1];

  if (!type || !variableTypes.has(type as VariableType)) {
    throw new EnvboxError("--type must be one of string, number, boolean, or secret.");
  }

  return type as VariableType;
}

export function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

export function readStringOption(args: string[], option: string): string | undefined {
  const optionIndex = args.indexOf(option);

  if (optionIndex === -1) {
    return undefined;
  }

  const value = args[optionIndex + 1];

  if (!value || value.startsWith("--")) {
    throw new EnvboxError(`${option} requires a value.`);
  }

  return value;
}

export function readPositionals(args: string[], optionsWithValues: string[] = []): string[] {
  const positionals: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg) {
      continue;
    }

    if (arg.startsWith("--")) {
      if (optionsWithValues.includes(arg)) {
        index += 1;
      }

      continue;
    }

    positionals.push(arg);
  }

  return positionals;
}
