import js from '@eslint/js'
import compat from 'eslint-plugin-compat'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig(
  // Build output is generated, not authored. ESLint 9's flat config does not read .gitignore.
  { ignores: ['cjs/', 'es/', 'umd/'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  compat.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.commonjs
      }
    },
    settings: {
      polyfills: ['Promise', 'fetch', 'URL', 'URLSearchParams']
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_'
        }
      ]
    }
  }
)
