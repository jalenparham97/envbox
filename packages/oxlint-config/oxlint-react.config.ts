import { defineConfig } from "oxlint";

import baseConfig from "./oxlint-base.config.ts";

export default defineConfig({
  ...baseConfig,
  plugins: ["react", "typescript"],
});