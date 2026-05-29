import js from '@eslint/js';
import compat from 'eslint-plugin-compat';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';


export default defineConfig(
  js.configs.recommended,
  tseslint.configs.recommended,
  compat.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.commonjs,
      },
    },
    settings: {
      polyfills: ['Promise', 'fetch', 'URL', 'URLSearchParams'],
    },
    rules: {
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
)
