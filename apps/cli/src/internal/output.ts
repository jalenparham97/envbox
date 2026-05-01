const reset = "\u001b[0m";
const boldCode = "\u001b[1m";
const dimCode = "\u001b[2m";

function color(value: string, colorValue: string): string {
  const ansiColor = Bun.color(colorValue, "ansi") ?? "";

  return `${ansiColor}${value}${reset}`;
}

export function brand(value: string): string {
  return color(value, "#7dd3fc");
}

export function heading(value: string): string {
  return `${boldCode}${value}${reset}`;
}

export function muted(value: string): string {
  return `${dimCode}${value}${reset}`;
}

export function label(value: string): string {
  return color(value, "#a7f3d0");
}

export function value(value: string): string {
  return color(value, "#f8fafc");
}

export function success(message: string): string {
  return `${color("Success", "#22c55e")}: ${message}`;
}

export function warning(message: string): string {
  return `${color("Warning", "#f59e0b")}: ${message}`;
}

export function error(message: string): string {
  return `${color("Error", "#ef4444")}: ${message}`;
}

export function formatRows(rows: Array<[string, string]>): string {
  const width = Math.max(...rows.map(([name]) => Bun.stringWidth(name)), 0);

  return rows
    .map(([name, rowValue]) => `${label(padEndVisible(name, width))}  ${rowValue}`)
    .join("\n");
}

function padEndVisible(input: string, width: number): string {
  return `${input}${" ".repeat(Math.max(width - Bun.stringWidth(input), 0))}`;
}
