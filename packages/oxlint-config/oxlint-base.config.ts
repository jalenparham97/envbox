import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript"],
  ignorePatterns: ["dist/**", "node_modules/**"],
  env: {
    builtin: true,
  },
  rules: {
    "no-unused-vars": "warn",
    "typescript/no-explicit-any": "warn",
    "typescript/consistent-type-imports": "warn",
  },
});