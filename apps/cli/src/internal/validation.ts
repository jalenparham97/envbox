import type { EnvboxConfig, ValidationIssue } from "./types";

export function validateConfig(
  config: EnvboxConfig,
  values: Record<string, string>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const variable of Object.values(config.variables)) {
    const value = values[variable.name];

    if (variable.required && !value) {
      issues.push({ name: variable.name, message: "required value is missing" });
      continue;
    }

    if (!value) {
      continue;
    }

    if (variable.type === "number" && Number.isNaN(Number(value))) {
      issues.push({ name: variable.name, message: "must be a number" });
    }

    if (variable.type === "boolean" && value !== "true" && value !== "false") {
      issues.push({ name: variable.name, message: "must be true or false" });
    }
  }

  return issues;
}
