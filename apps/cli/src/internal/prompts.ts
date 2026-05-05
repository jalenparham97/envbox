import { cancel, confirm, isCancel, select, text } from "@clack/prompts";

import type { VariableType } from "@envbox/core/types";

type PromptResult<T> = T | symbol;

export function readPromptValue<T>(value: PromptResult<T>): T {
  if (isCancel(value)) {
    cancel("Cancelled.");
    process.exit(0);
  }

  return value;
}

export async function promptText(options: Parameters<typeof text>[0]): Promise<string> {
  return readPromptValue(await text(options));
}

export async function promptConfirm(options: Parameters<typeof confirm>[0]): Promise<boolean> {
  return readPromptValue(await confirm(options));
}

export async function promptType(initialValue: VariableType): Promise<VariableType> {
  return readPromptValue(
    await select({
      message: "Type",
      initialValue,
      options: [
        { label: "String", value: "string" },
        { label: "Number", value: "number" },
        { label: "Boolean", value: "boolean" },
        { label: "Secret", value: "secret" },
      ],
    }),
  );
}

export async function promptScopeName(scopeNames: string[]): Promise<string | undefined> {
  if (scopeNames.length === 0) {
    return undefined;
  }

  const scopeName = readPromptValue(
    await select({
      message: "Scope",
      options: [
        { label: "None", value: "" },
        ...scopeNames.map((name) => ({ label: name, value: name })),
      ],
    }),
  );

  return scopeName || undefined;
}

export function parseVariableList(value: string): string[] {
  return value
    .split(/[\s,]+/)
    .map((variable) => variable.trim())
    .filter(Boolean);
}
