import { defineConfig } from "oxfmt";

export default defineConfig({
  tabWidth: 2,
  printWidth: 100,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  arrowParens: "always",
  sortPackageJson: false,
  sortImports: {
    internalPattern: ["~/", "@/", "@envbox/"],
  },
});