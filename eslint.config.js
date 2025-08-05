import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintPluginAstro from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y";
import pluginReact from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

// File path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

const baseConfig = tseslint.config({
  extends: [eslint.configs.recommended, tseslint.configs.strict],
  rules: {
    "no-console": ["error", { allow: ["error", "warn"] }],
    "no-unused-vars": "off",
    // Disable all formatting rules that conflict with Prettier
    "@typescript-eslint/comma-dangle": "off",
    "@typescript-eslint/comma-spacing": "off",
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/key-spacing": "off",
    "@typescript-eslint/object-curly-spacing": "off",
    "@typescript-eslint/quotes": "off",
    "@typescript-eslint/semi": "off",
    "@typescript-eslint/space-before-function-paren": "off",
    "@typescript-eslint/space-infix-ops": "off",
    "@typescript-eslint/type-spacing": "off",
    "@typescript-eslint/brace-style": "off",
    "@typescript-eslint/array-element-newline": "off",
    "@typescript-eslint/array-bracket-newline": "off",
    "@typescript-eslint/object-property-newline": "off",
    "@typescript-eslint/object-curly-newline": "off",
    "@typescript-eslint/function-paren-newline": "off",
    "@typescript-eslint/implicit-arrow-linebreak": "off",
    "@typescript-eslint/no-extra-parens": "off",
    "@typescript-eslint/no-mixed-spaces-and-tabs": "off",
    "@typescript-eslint/no-tabs": "off",
    "@typescript-eslint/operator-linebreak": "off",
    "@typescript-eslint/space-before-blocks": "off",
    "@typescript-eslint/space-in-parens": "off",
    "@typescript-eslint/space-unary-ops": "off",
    "@typescript-eslint/template-curly-spacing": "off",
    "@typescript-eslint/wrap-regex": "off",
  },
});

const jsxA11yConfig = tseslint.config({
  files: ["**/*.{js,jsx,ts,tsx}"],
  extends: [jsxA11y.flatConfigs.recommended],
  languageOptions: {
    ...jsxA11y.flatConfigs.recommended.languageOptions,
  },
  rules: {
    ...jsxA11y.flatConfigs.recommended.rules,
  },
});

const reactConfig = tseslint.config({
  files: ["**/*.{js,jsx,ts,tsx}"],
  extends: [pluginReact.configs.flat.recommended],
  languageOptions: {
    ...pluginReact.configs.flat.recommended.languageOptions,
    globals: {
      window: true,
      document: true,
    },
  },
  plugins: {
    "react-hooks": eslintPluginReactHooks,
    "react-compiler": reactCompiler,
  },
  settings: { react: { version: "detect" } },
  rules: {
    ...eslintPluginReactHooks.configs.recommended.rules,
    "react/react-in-jsx-scope": "off",
    "react-compiler/react-compiler": "error",
  },
});

const astroConfig = eslintPluginAstro.configs["flat/recommended"];

const prettierConfig = tseslint.config({
  files: ["**/*.{js,jsx,ts,tsx}"],
  plugins: {
    prettier: eslintPluginPrettier,
  },
  rules: {
    "prettier/prettier": "error",
  },
});

const astroPrettierConfig = tseslint.config({
  files: ["**/*.astro"],
  plugins: {
    prettier: eslintPluginPrettier,
  },
  rules: {
    "prettier/prettier": "off",
  },
});

export default tseslint.config(
  includeIgnoreFile(gitignorePath),
  baseConfig,
  jsxA11yConfig,
  reactConfig,
  astroConfig,
  prettierConfig,
  astroPrettierConfig,
);
