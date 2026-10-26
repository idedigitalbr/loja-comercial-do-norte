import { test, expect } from './fixtures';
test.describe('Public read-only smoke',()=>{
 test('home exposes the official header, title and accessible main region',async({page})=>{
  expect((await page.goto('/'))?.status()).toBe(200);
  await expect(page).toHaveTitle(/Comercial do Norte/i);
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('main#conteudo')).toBeVisible();
  await expect(page.locator('a[href="#conteudo"]')).toBeAttached();
 });
 test('catalog and search render with published products or an explicit empty state',async({page})=>{
  expect((await page.goto('/loja'))?.status()).toBe(200);
  await expect(page.getByRole('heading',{level:1})).toBeVisible();
  await expect(page.locator('input#catalog-search, input[name="q"]').first()).toBeVisible();
 });
 test('quote page is accessible without submitting customer data',async({page})=>{
  expect((await page.goto('/cotacao'))?.status()).toBe(200);
  await expect(page.getByRole('heading',{name:/cotação/i}).first()).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
 });
});
