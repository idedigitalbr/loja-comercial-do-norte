import { test, expect } from './fixtures';

const ADMIN_URL = process.env.ADMIN_URL ?? 'http://127.0.0.1:5179';

test('storefront login exposes its email form', async ({ page }) => {
  expect((await page.goto('/login'))?.status()).toBe(200);
  await expect(page.locator('input[type="email"]').first()).toBeVisible();
});

test('admin requires a session, persists login and logs out against an isolated fixture', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill('admin@isolated.test');
  await page.locator('input[type="password"]').fill('IsolatedTest!2026');
  await page.getByRole('button', { name: /entrar/i }).click();

  await page.goto(ADMIN_URL);
  await expect(page.locator('.admin-user')).toContainText('admin@isolated.test', { timeout: 15000 });

  await page.reload();
  await expect(page.locator('.admin-user')).toContainText('admin@isolated.test', { timeout: 15000 });

  const quotesNav = page.locator('a, button').filter({ hasText: /cotações/i }).first();
  await quotesNav.click();
  await expect(page.getByText(/nenhuma cotação/i).first()).toBeVisible({ timeout: 10000 });

  await page.getByRole('button', { name: /sair/i }).click();
  await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 15000 });
});
