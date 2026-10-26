import { test, expect } from './fixtures';
test('catalog renders the fixture product with a quote CTA',async({page})=>{
 expect((await page.goto('/loja'))?.status()).toBe(200);
 await expect(page.getByRole('heading',{level:1})).toContainText(/catálogo/i);
 const card=page.locator('article').first();
 await expect(card).toContainText('Caixa de Pizza Fixture');
 await expect(card.getByRole('button',{name:/adicionar à cotação/i})).toBeVisible();
});
test('category filter changes the URL and selected heading',async({page})=>{
 await page.goto('/loja');
 await page.locator('a[href*="categoria=embalagens-teste"]').click();
 await expect(page).toHaveURL(/categoria=embalagens-teste/);
 await expect(page.getByRole('heading',{level:1})).toHaveText('Embalagens de Teste');
});
test('search submits a query and shows an explicit empty result for unknown terms',async({page})=>{
 await page.goto('/loja');
 await page.locator('#catalog-search').fill('pizza');
 await page.locator('#catalog-search').press('Enter');
 await expect(page).toHaveURL(/q=pizza/);
 await expect(page.locator('article').first()).toContainText('Caixa de Pizza Fixture');
 await page.locator('#catalog-search').fill('unmatched-fixture-query');
 await page.locator('#catalog-search').press('Enter');
 await expect(page.getByText(/nenhum produto/i).first()).toBeVisible();
});
