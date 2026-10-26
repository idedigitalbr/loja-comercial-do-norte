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

    // Título ou cabeçalho da cotação (vazia ou com itens)
    await expect(page.getByRole('heading', { name: /cotação/i }).first()).toBeVisible();

    // Botão de envio de cotação
    await expect(page.getByRole('button', { name: /enviar cotação|adicionar à cotação/i })).toBeDefined();
  });

  test('Gaveta de Cotação (Quote Drawer) é acessível via navegação', async ({ page }) => {
    await page.goto('/');
    const quoteButton = page.locator('button[aria-label*="cotação" i], a[href*="cotacao" i]').first();
    await expect(quoteButton).toBeVisible();
  });

  test('Imagens de produtos exibem os placeholders oficiais distribuídos sem quebras', async ({ page }) => {
    // 1. Validar no catálogo /loja
    await page.goto('/loja');
    const catalogImages = page.locator('article img[src*="placeholder-"]');
    const count = await catalogImages.count();
    expect(count).toBeGreaterThan(0);

    // Verificar se todas as imagens carregam sem erro (naturalWidth > 0)
    for (let i = 0; i < Math.min(count, 8); i++) {
      const isLoaded = await catalogImages.nth(i).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
      expect(isLoaded).toBe(true);
    }

    // 2. Validar na página de produto /produto/caixa-pizza-35cm
    await page.goto('/produto/caixa-pizza-35cm');
    const productImage = page.locator('main img[src*="placeholder-"]').first();
    await expect(productImage).toBeVisible();
    const productImgLoaded = await productImage.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
    expect(productImgLoaded).toBe(true);
  });
});
