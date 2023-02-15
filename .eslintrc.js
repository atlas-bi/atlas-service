/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        '@remix-run/eslint-config',
        '@remix-run/eslint-config/node',
        '@remix-run/eslint-config/jest-testing-library',
        'prettier',
        'plugin:prettier/recommended',
    ],
    env: {
        'cypress/globals': true,
    },
    plugins: ['cypress', 'remix', 'prettier', '@typescript-eslint'],
    // We're using vitest which has a very similar API to jest
    // (so the linting plugins work nicely), but we have to
    // set the jest version explicitly.
    settings: {
        jest: {
            version: 28,
        },
    },
    rules: {
        'remix/node-server-imports': 'error',
        'remix/use-loader-data-types': 'error',
        'prettier/prettier': 'error',
        'no-return-await': 'error',
        'no-duplicate-imports': 'error',
        'no-unreachable-loop': 'error',
        'no-use-before-define': 'error',
        'arrow-body-style': 'warn',
        camelcase: 'warn',
        'consistent-return': 'warn',
        'dot-notation': 'warn',
        eqeqeq: 'warn',
        'prefer-arrow-callback': 'warn',
    },
    reportUnusedDisableDirectives: true,
    ignorePatterns: ['!.*.js', 'app/plugins/', 'mocks/', 'cypress/'],
};
