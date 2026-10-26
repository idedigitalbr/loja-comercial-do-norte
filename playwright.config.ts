import { defineConfig, devices } from '@playwright/test';
import { isolated, storefrontUrl, fixtureApiUrl } from './e2e/environment.mjs';
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, forbidOnly: !!process.env.CI, retries: process.env.CI ? 1 : 0,
  workers: 1, reporter: 'list', timeout: 45_000,
  use: { baseURL: storefrontUrl, trace: 'retain-on-failure', ...devices['Desktop Chrome'] },
  projects: [{ name: isolated ? 'isolated' : 'public-readonly', testMatch: isolated ? /(?:auth-and-admin|catalog-and-search|product-and-quote)\.e2e\.ts$/ : /smoke\.e2e\.ts$/ }],
  webServer: isolated ? [
    { command: 'node e2e/start-server.mjs api', url: fixtureApiUrl + '/health', reuseExistingServer: false },
    { command: 'node e2e/start-server.mjs storefront', url: storefrontUrl, reuseExistingServer: false, timeout: 120_000 },
    { command: 'node e2e/start-server.mjs admin', url: process.env.ADMIN_URL ?? 'http://127.0.0.1:5179', reuseExistingServer: false, timeout: 60_000 },
  ] : undefined,
});
