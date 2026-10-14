import { defineConfig } from 'vitest/config';

/**
 * Unit tests for the pure feature engines under `src/lib/features/`.
 *
 * Node environment on purpose: the engines are deterministic and DOM-free, so
 * the tests run without a browser. `vite.config.ts` is deliberately untouched
 * — this file is the whole test configuration.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
