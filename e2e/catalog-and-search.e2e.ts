import { test, expect } from '@playwright/test';

test.describe('Comercial do Norte - Catálogo, Busca e Filtros de Categoria (Issue #32)', () => {
  test('Listagem completa de produtos em /loja exibe grade e total de itens', async ({ page }) => {
    const response = await page.goto('/loja');
    expect(response?.status()).toBe(200);

    // Título do catálogo
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/catálogo/i);

    // Grade de produtos
    const productCards = page.locator('article');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);

    // Cada card deve possuir botão "Adicionar à cotação"
    const firstCard = productCards.first();
    await expect(firstCard.getByRole('button', { name: /adicionar à cotação/i })).toBeVisible();
  });

  test('Filtros de categoria por pílulas filtram os produtos corretamente', async ({ page }) => {
    await page.goto('/loja');

    // Identificar botões/links de filtro de categoria
    const categoryPills = page.locator('a.rounded-pill');
    await expect(categoryPills.first()).toBeVisible();

    // Clicar na primeira categoria específica disponível (se houver mais de uma pill)
    const pillsCount = await categoryPills.count();
    if (pillsCount > 1) {
      const secondPill = categoryPills.nth(1);
      const categoryName = (await secondPill.textContent())?.trim();
      await secondPill.click();

      await page.waitForURL(/categoria=/);
      if (categoryName) {
        await expect(page.getByRole('heading', { level: 1 })).toContainText(new RegExp(categoryName, 'i'));
      }
    }
  });

  test('Busca de produtos por termo exibe resultados correspondentes', async ({ page }) => {
    await page.goto('/loja');

    const searchInput = page.locator('input#catalog-search, input[name="q"]').first();
    await expect(searchInput).toBeVisible();

    // Buscar termo "pizza"
    await searchInput.fill('pizza');
    await page.keyboard.press('Enter');

    await page.waitForURL(/q=pizza/);
    await expect(page.locator('body')).toContainText(/pizza/i);
  });
});
