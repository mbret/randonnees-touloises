import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      // `tsconfig.json` points `react` at `@types/react` so that the app builds
      // against a single copy of the types. That mapping has no runtime meaning,
      // and `vite-tsconfig-paths` applies it here too, so anything rendering a
      // component resolves React to a package with no code in it.
      react: fileURLToPath(new URL('./node_modules/react', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts', 'tests/int/**/*.int.spec.tsx'],
  },
})
