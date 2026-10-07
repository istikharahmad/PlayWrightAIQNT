import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import node from 'eslint-plugin-node';
import playwright from 'eslint-plugin-playwright';
import { fixupPluginRules } from '@eslint/compat';
import { defineConfig } from 'eslint/config';

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        plugins: {
            node: fixupPluginRules(node),
            playwright: playwright,
        },
    },
    {
        rules: {
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/no-useless-constructor': 'off',
            '@typescript-eslint/promise-function-async': 'error',
            '@typescript-eslint/require-await': 'error',

            '@typescript-eslint/explicit-member-accessibility': [
                'error',
                {
                    accessibility: 'no-public',
                },
            ],

            '@typescript-eslint/no-empty-object-type': 'off',
            'no-promise-executor-return': 'error',
            'no-await-in-loop': 'off',
            'node/no-sync': 'error',
            'node/handle-callback-err': 'error',
            'node/no-callback-literal': 'error',
            'no-useless-constructor': 'off',

            'playwright/missing-playwright-await': [
                'error',
                {
                    customMatchers: ['toHaveCount', 'toHaveCountGreaterThan', 'toHaveTitle', 'toHaveURL', 'toBeVisible', 'toHaveScreenshot'],
                },
            ],

            'one-var': ['error', 'never'],
            'sort-keys': 'off',
        },
    },
    {
        ignores: [
            'eslint.config.js',
            'node_modules/*',
            'playwright-report/*',
            'test-results/*',
            '**/dbg.spec.ts',
            'dashboard/assets/*',
            'dashboard/scripts/*',
        ],
    },
);
