// eslint.config.js
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import jsdoc from "eslint-plugin-jsdoc";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Compat wrapper to merge ESLint’s recommended configs
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  // 1) Files/globs to ignore entirely
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "dist/**",
      "coverage/**",
      "build/**",
      "next.config.mjs",
      "postcss.config.js",
      "tailwind.config.js",
      "eslint.config.js",
    ],
  },

  // 2) JSDoc recommended rules for TypeScript (report as errors)
  jsdoc.configs["flat/recommended-typescript-error"],

  // 3) Bring in ESLint, TypeScript-ESLint, React/Next and Prettier recommended rules
  ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@next/next/recommended",
    "plugin:@next/next/core-web-vitals",
    "prettier"
  ),

  // 4) Project-specific overrides
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    plugins: {
      "@typescript-eslint": typescriptEslint,
      prettier,
      jsdoc,
    },

    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs"],
        },
      },
      jsdoc: {
        mode: "typescript",
      },
    },

    rules: {
      // No unused variables
      "@typescript-eslint/no-unused-vars": "error",

      // Prettier formatting enforcement
      "prettier/prettier": ["error", { endOfLine: "crlf" }],
      "linebreak-style": ["error", "windows"],

      // Consistent type definitions
      "@typescript-eslint/consistent-type-definitions": "error",

      // JSDoc enforcement rules
      "jsdoc/require-jsdoc": "error",
      "jsdoc/require-param": "error",
      "jsdoc/require-param-description": "error",
      "jsdoc/require-returns": "error",
      "jsdoc/require-returns-description": "error",
      "jsdoc/check-param-names": "error",
      "jsdoc/check-tag-names": "error",
      "jsdoc/no-undefined-types": "error",

      // Explicit return types (warn)
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        { allowExpressions: true },
      ],
    },
  },
];