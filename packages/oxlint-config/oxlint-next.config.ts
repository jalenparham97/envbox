import { defineConfig } from "oxlint";

import reactConfig from "./oxlint-react.config.ts";

export default defineConfig({
  ...reactConfig,
  plugins: ["nextjs", "react", "typescript"],
});