import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração dos testes de fumaça (smoke tests) e aceite no navegador (Playwright - Issue #32).
 * Foco exclusivo na pasta ./e2e para não colidir com suites Vitest (*.spec.ts).
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.e2e\.(ts|js)/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: process.env.STOREFRONT_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
