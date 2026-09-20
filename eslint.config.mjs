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
    /**
     * `next/image` bills per transformation, and uploads no longer need one.
     *
     * Sharp builds a WebP ladder for every upload and `ImageMedia` serves it,
     * so a document rendered through `Media` costs nothing at request time.
     * Rendering one with `next/image` instead puts it back on the optimiser —
     * silently, because the picture looks identical. That is exactly how the
     * home page's hero came to be the last upload still being resized per
     * request: it was written before the ladder existed and nothing said it
     * could not be.
     *
     * A test cannot hold this line. `pnpm ci` is `lint && migrate:deploy &&
     * build`, so `lint` is the only check between a commit and production —
     * hence `error` rather than `warn`, since `eslint .` exits 0 on warnings.
     *
     * The type import is allowed: `StaticImageData` describes a file imported
     * from disk and has nothing to do with the optimiser.
     */
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'next/image',
              allowTypeImports: true,
              message:
                'Render uploads with `Media` from @/components/Media — it serves the sizes sharp already generated. next/image is billed per transformation and is only for remote images and files imported from disk.',
            },
          ],
        },
      ],
    },
  },
  {
    /**
     * The three places an optimiser still earns its keep: thumbnails fetched
     * from platforms whose dimensions nobody here controls, and two images
     * imported from disk, which are hashed and served immutable rather than
     * read out of the media collection.
     */
    files: [
      'src/app/(frontend)/about/page.tsx',
      'src/Footer/FederationLogo.tsx',
      'src/blocks/MediaLinks/Component.tsx',
    ],
    rules: {
      '@typescript-eslint/no-restricted-imports': 'off',
    },
  },
  {
    ignores: ['.next/', 'node_modules/', 'src/app/(payload)/admin/importMap.js'],
  },
])
