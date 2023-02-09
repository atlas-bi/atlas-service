/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
  root: true,
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    "@remix-run/eslint-config/jest-testing-library",
    "prettier",
    "plugin:prettier/recommended",
  ],
  env: {
    "cypress/globals": true,
  },
  plugins: ["cypress", "remix", "prettier"],
  // We're using vitest which has a very similar API to jest
  // (so the linting plugins work nicely), but we have to
  // set the jest version explicitly.
  settings: {
    jest: {
      version: 28,
    },
  },
  rules: {
    "remix/node-server-imports": "error",
    "remix/use-loader-data-types": "error",
    "prettier/prettier": "error",
  },
  reportUnusedDisableDirectives: true,
  ignorePatterns: ["!.*.js"],
};
