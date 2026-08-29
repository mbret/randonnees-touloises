import { defineConfig } from 'eslint/config'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import reactHooks from 'eslint-plugin-react-hooks'

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // Flat config resolves a rule's plugin within the config object that sets
    // it, so the overrides below need `react-hooks` registered here too.
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // The React Compiler correctness rules that eslint-plugin-react-hooks 7
      // turns on are left at the error they ship as. They were held at `warn`
      // through the upgrade that introduced them, so as not to refactor
      // runtime behaviour in the same change; that refactor has since been
      // done, and the one place the advice genuinely does not apply — the
      // header's theme, which has to wait for hydration — says so on the line
      // itself rather than for the whole repository.
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    /**
     * Migrations are written by `payload migrate:create`, which gives every
     * `up` and `down` the same `{ db, payload, req }` signature whether or not
     * the body uses all three. Renaming the arguments would fix the warning
     * once and be undone by the next generated file, so the rule is off for
     * generated code instead.
     */
    files: ['src/migrations/**'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    ignores: ['.next/', 'node_modules/', 'src/app/(payload)/admin/importMap.js'],
  },
])
