import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    maxWorkers: 2,
    teardownTimeout: 1000,
    testTimeout: 15000,
    hookTimeout: 15000,
  },
});
