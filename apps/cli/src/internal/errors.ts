export class EnvboxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvboxError";
  }
}
