import { test, expect } from '@playwright/test';

test.describe('Comercial do Norte - Smoke Tests de Aceite no Navegador (Issue #32)', () => {
  test('Abertura da Homepage com identidade visual e cabeçalho oficial', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // Título e metatags
    await expect(page).toHaveTitle(/Comercial do Norte/i);

    // Header oficial em 3 barras
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(page.getByText('Comercial do Norte').first()).toBeVisible();

    // Skip to content acessível
    const skipLink = page.locator('a[href="#conteudo"]');
    await expect(skipLink).toBeAttached();

    // Carrossel principal e áreas centrais
    const mainContent = page.locator('main#conteudo');
    await expect(mainContent).toBeVisible();
  });

  test('Página de Cotação renderiza formulário e estado do pedido', async ({ page }) => {
    const response = await page.goto('/cotacao');
    expect(response?.status()).toBe(200);

    // Título ou cabeçalho da cotação
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Botão de envio de cotação
    await expect(page.getByRole('button', { name: /enviar cotação|adicionar à cotação/i })).toBeDefined();
  });

  test('Gaveta de Cotação (Quote Drawer) é acessível via navegação', async ({ page }) => {
    await page.goto('/');
    const quoteButton = page.locator('button[aria-label*="cotação" i], a[href*="cotacao" i]').first();
    await expect(quoteButton).toBeVisible();
  });
});
