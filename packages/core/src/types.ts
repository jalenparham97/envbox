export type VariableType = "string" | "number" | "boolean" | "secret";

export type VariableDefinition = {
  name: string;
  type: VariableType;
  required: boolean;
  secret: boolean;
};

export type EnvboxScope = {
  path: string;
  variables: string[];
};

export type EnvboxConfig = {
  projectName: string;
  activeProfile: string;
  variables: Record<string, VariableDefinition>;
  scopes: Record<string, EnvboxScope>;
};

export type ValidationIssue = {
  name: string;
  message: string;
};
