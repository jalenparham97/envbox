export function parseDotenv(contents: string): Record<string, string> {
  const values: Record<string, string> = {};

  for (const line of contents.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const name = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
    values[name] = unquoteValue(rawValue);
  }

  return values;
}

export function formatDotenv(values: Record<string, string>): string {
  return `${Object.entries(values)
    .map(([name, value]) => `${name}=${quoteValue(value)}`)
    .join("\n")}\n`;
}

export function mergeDotenv(contents: string, values: Record<string, string>): string {
  const remainingValues = new Map(Object.entries(values));
  const lines = contents.split(/\r?\n/).map((line) => {
    const name = getDotenvName(line);

    if (!name || !remainingValues.has(name)) {
      return line;
    }

    const value = remainingValues.get(name) ?? "";
    remainingValues.delete(name);

    return `${name}=${quoteValue(value)}`;
  });

  if (lines.at(-1) === "") {
    lines.pop();
  }

  for (const [name, value] of remainingValues) {
    lines.push(`${name}=${quoteValue(value)}`);
  }

  return `${lines.join("\n")}\n`;
}

export function removeDotenvValue(contents: string, variableName: string): string {
  const lines = contents.split(/\r?\n/).filter((line) => getDotenvName(line) !== variableName);

  if (lines.at(-1) === "") {
    lines.pop();
  }

  return `${lines.join("\n")}\n`;
}

function getDotenvName(line: string): string | null {
  const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/);

  return match?.[1] ?? null;
}

function unquoteValue(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function quoteValue(value: string): string {
  if (!/[\s#"']/.test(value)) {
    return value;
  }

  return JSON.stringify(value);
}
