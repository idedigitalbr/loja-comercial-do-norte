import { defineConfig } from 'vitest/config';

const url = new URL(process.env.DATABASE_URL ?? 'postgresql://invalid/invalid');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || !/^\/cn_api_test_[a-f0-9]{32}$/.test(url.pathname)) {
  throw new Error('Run pnpm --filter api test:e2e: E2E requires its own disposable local database.');
}
export default defineConfig({
  test: { include: ['src/**/*.e2e-spec.ts'], maxWorkers: 4, testTimeout: 15_000, hookTimeout: 30_000 },
});
