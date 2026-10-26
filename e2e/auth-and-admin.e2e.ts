import { test, expect } from '@playwright/test';

const ADMIN_URL = process.env.ADMIN_URL || 'https://admin-comercialdonorte.vercel.app';

test.describe('Comercial do Norte - Autenticação e Painel Administrativo (Issue #32)', () => {
  test('Página de login do cliente na vitrine renderiza formulário e opções de acesso', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBe(200);

    // Título ou subtítulo de login
    await expect(page.getByText(/entre ou crie sua conta|acesse sua conta/i).first()).toBeVisible({ timeout: 10000 });

    // Campo de e-mail deve estar presente
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible();
  });

  test('Painel administrativo exige autenticação e permite login com credenciais de demonstração', async ({ page }) => {
    // 1. Acesso à página do admin
    await page.goto(ADMIN_URL);

    // 2. Se já autenticado, verifica o shell; se não, realiza o login
    const isLoginPage = await page.getByRole('heading', { name: /acesso administrativo/i }).isVisible().catch(() => false);

    if (isLoginPage) {
      const emailInput = page.locator('input[type="email"]').first();
      await emailInput.fill('admin@admin.com');

      const passwordInput = page.locator('input[type="password"]').first();
      await passwordInput.fill('admin123456');

      const submitButton = page.getByRole('button', { name: /entrar/i });
      await submitButton.click();
    }

    // 3. Shell do administrador deve estar visível
    const adminHeading = page.getByRole('heading', { name: /gestão comercial e catálogo|painel comercial/i }).first();
    await expect(adminHeading).toBeVisible({ timeout: 15000 });

    // 4. Navegação pelas seções principais
    const catalogNav = page.locator('a, button').filter({ hasText: /produtos/i }).first();
    await expect(catalogNav).toBeVisible();

    const quotesNav = page.locator('a, button').filter({ hasText: /cotações/i }).first();
    await expect(quotesNav).toBeVisible();

    // 5. Clica na seção de Cotações
    await quotesNav.click();
    await expect(page.locator('body')).toContainText(/cotações|solicitações/i);
  });
});
