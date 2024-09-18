import js from '@eslint/js'
import functional from 'eslint-plugin-functional'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import ts from 'typescript-eslint'

export default [
  {
    ignores: [
      'dist',
      '**/*.d.ts',
      '**/*.config.{js,ts}',
      '**/{vite,vitest}.*.{js,ts}',
    ],
  },
  { files: ['src/**/*.{ts,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        project: ['tsconfig.app.json'],
        sourceType: 'module',
      },
    },
  },
  {
    ...functional.configs.recommended,
    ignores: [
      'src/main.ts',
      '**/*.test.{js,ts}',
      '**/react-*.{js,ts}',
      '**/xstate-*.{js,ts}',
    ],
  },
  {
    ...functional.configs.strict,
    ignores: ['**/*', '!src/lib/{matrix,transform}.ts'],
  },
  prettierRecommended,
]
