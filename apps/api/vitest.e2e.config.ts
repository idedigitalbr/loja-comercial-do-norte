import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.e2e-spec.ts'],
    testTimeout: 15_000,
    hookTimeout: 15_000,
  },
});
