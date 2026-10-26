import { test, expect } from './fixtures';

test.describe('Comercial do Norte - Fluxo de Produto e Cotação (Issue #32)', () => {
  test('Página de produto renderiza detalhes, especificações e CTA de cotação', async ({ page }) => {
    const response = await page.goto('/produto/caixa-pizza-35cm');
    expect(response?.status()).toBe(200);

    // Título do produto
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Caixa de Pizza/i);

    // Imagem ilustrativa
    const productImage = page.locator('main img[alt*="Caixa de Pizza"]');
    await expect(productImage).toBeVisible();

    // Preço de referência
    await expect(page.getByText('Preço de referência para cotação')).toBeVisible();

    // CTA exclusivo de cotação (sem botão "Comprar")
    const quoteButton = page.getByRole('button', { name: /adicionar à cotação/i }).first();
    await expect(quoteButton).toBeVisible();
    await expect(page.getByRole('button', { name: /^comprar$/i })).toHaveCount(0);
  });

  test('Adicionar produto à cotação abre a gaveta com contador atualizado', async ({ page }) => {
    await page.goto('/produto/caixa-pizza-35cm');

    const quoteButton = page.getByRole('button', { name: /adicionar à cotação/i }).first();
    await quoteButton.click();

    // Gaveta (QuoteDrawer / WebSheet) deve abrir
    const drawerTitle = page.getByRole('heading', { name: /carrinho de cotação/i });
    await expect(drawerTitle).toBeVisible({ timeout: 5000 });

    // Link para enviar cotação na gaveta
    const sendQuoteLink = page.getByRole('link', { name: /enviar cotação/i });
    await expect(sendQuoteLink).toBeVisible();
  });

  test('Fluxo completo: adicionar à cotação, preencher formulário e submeter solicitação', async ({ page }) => {
    // 1. Acessa produto e adiciona à cotação
    await page.goto('/produto/caixa-pizza-35cm');
    const quoteButton = page.getByRole('button', { name: /adicionar à cotação/i }).first();
    await quoteButton.click();

    // 2. Vai para a página de cotação
    await page.goto('/cotacao');

    // 3. Verifica item na lista
    await expect(page.getByText(/Caixa de Pizza/i).first()).toBeVisible({ timeout: 10000 });

    // 4. Preenche formulário de cotação
    const nameInput = page.locator('input[name="customerName"]');
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Cliente E2E Isolado');

    const phoneInput = page.locator('input[name="customerPhone"]');
    await phoneInput.fill('91900007777');

    const companyInput = page.locator('input[name="companyName"]');
    if (await companyInput.isVisible()) {
      await companyInput.fill('Empresa Fixture');
    }

    const notesInput = page.locator('textarea[name="notes"]');
    if (await notesInput.isVisible()) {
      await notesInput.fill('Cotação automatizada via suite E2E Playwright da Comercial do Norte.');
    }

    // 5. Submete cotação
    const submitButton = page.getByRole('button', { name: /enviar cotação/i });
    await submitButton.click();

    // 6. Confirma redirecionamento para página de sucesso com protocolo
    await page.waitForURL(/\/cotacao\/[A-Za-z0-9_-]+/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /cotação enviada com sucesso/i })).toBeVisible();
    await expect(page.getByText(/protocolo/i).first()).toBeVisible();
  });
});

test('API failure keeps the quote draft and displays an error instead of success',async({page})=>{
 await page.goto('/produto/caixa-pizza-35cm');
 await page.getByRole('button',{name:/adicionar à cotação/i}).first().click();
 await page.goto('/cotacao');
 await page.locator('input[name="customerName"]').fill('Cliente E2E Isolado');
 await page.locator('input[name="customerPhone"]').fill('91900007777');
 await page.route('**/api/v1/quotes',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:{message:'Falha de API simulada'}})}));
 await page.getByRole('button',{name:/enviar cotação/i}).click();
 await expect(page.getByRole('alert')).toContainText('Falha de API simulada');
 await expect(page).toHaveURL(/\/cotacao$/);
 await expect(page.getByText(/Caixa de Pizza Fixture/i).first()).toBeVisible();
});
