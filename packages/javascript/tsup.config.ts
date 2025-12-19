import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'cypress/index': 'src/cypress/index.ts',
    'playwright/index': 'src/playwright/index.ts',
    'jest/index': 'src/jest/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: ['cypress', '@playwright/test', 'jest'],
});
