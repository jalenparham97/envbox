export type VariableType = "string" | "number" | "boolean" | "secret";

export type VariableDefinition = {
  name: string;
  type: VariableType;
  required: boolean;
  secret: boolean;
};

export type EnvboxTarget = {
  path: string;
  variables: string[];
};

export type EnvboxConfig = {
  projectName: string;
  activeProfile: string;
  variables: Record<string, VariableDefinition>;
  profiles: Record<string, Record<string, string>>;
  targets: Record<string, EnvboxTarget>;
};

export type ValidationIssue = {
  name: string;
  message: string;
};

export type CommandContext = {
  cwd: string;
  stdout: Pick<typeof console, "log">;
  stderr: Pick<typeof console, "error">;
};

export type CommandHandler = (args: string[], context: CommandContext) => Promise<void>;

export type Command = {
  name: string;
  description: string;
  usage: string;
  handler: CommandHandler;
};
