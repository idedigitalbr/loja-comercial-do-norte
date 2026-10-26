import { defineConfig } from 'vitest/config';

// Direct mock-only Vitest runs stay usable without credentials. Never let Prisma
// discover a production .env when the caller did not provide an isolated URL.
if (!process.env.DATABASE_URL) process.env.DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:1/cn_api_test_unmanaged';
const url = new URL(process.env.DATABASE_URL);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || !/^\/cn_api_test_(?:[a-f0-9]{32}|unmanaged)$/.test(url.pathname)) {
  throw new Error('API tests require a disposable local database. Run pnpm --filter api test.');
}
export default defineConfig({ test: { maxWorkers: 4, testTimeout: 15_000, hookTimeout: 30_000 } });
