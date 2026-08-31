import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Generated output; jest and npm own these directories.
  { ignores: ["node_modules/", "coverage/", "reports/"] },

  {
    files: ["**/*.js"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      ecmaVersion: 2022,
      // This is a CommonJS Node service, not browser code. The previous
      // config declared globals.browser, which left require, module,
      // process and __dirname undefined and made no-undef fire on nearly
      // every file — invisible only because CI ran eslint with `|| true`.
      sourceType: "commonjs",
      globals: globals.node,
    },
    rules: {
      // Express identifies error middleware by a four-parameter signature,
      // so an unused trailing `_next` has to be allowed.
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  {
    files: ["tests/**/*.js", "jest.config.js"],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
  },

  {
    files: ["**/*.mjs"],
    languageOptions: { sourceType: "module" },
  },
]);
