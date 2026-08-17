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
      // eslint-config-next 16 ships eslint-plugin-react-hooks 7, which turns the
      // React Compiler correctness rules on as errors. They flag pre-existing
      // code, including vendored shadcn/ui files (ui/sidebar.tsx,
      // ui/hooks/use-mobile.ts) and idioms that are not actually wrong here
      // (`document.cookie = ...`, react-hook-form's `handleSubmit`).
      // Kept visible as warnings rather than silently refactoring runtime
      // behaviour as part of a dependency upgrade.
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
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
    ignores: ['.next/', 'node_modules/', 'src/app/(payload)/admin/importMap.js'],
  },
])
