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
