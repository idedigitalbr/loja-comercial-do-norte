import { describe, expect, it } from 'vitest';
import { mapWooProduct, parseWooPriceCents } from './woocommerce-importer';

describe('WooCommerce catalog importer', () => {
  it('maps a WooCommerce product to the local catalog contract', () => {
    const mapped = mapWooProduct({
      id: 1941,
      name: 'Shampoo Amino Color 250ml',
      slug: 'shampoo-amino-color-250ml',
      sku: '',
      description: '<p>Descrição completa</p>',
      short_description: '<p>Resumo</p>',
      prices: { price: '6950', regular_price: '6950', sale_price: '6950' },
      stock_quantity: 12,
      is_in_stock: true,
      images: [{ src: 'https://example.com/shampoo.jpg', alt: 'Shampoo' }],
      categories: [{ id: 32, name: 'Shampoo', slug: 'shampoo' }],
      brands: [
        { id: 75, name: 'AMINO COLOR', slug: 'amino-color' },
        { id: 64, name: 'KNUT', slug: 'knut' },
      ],
    });

    expect(mapped).toMatchObject({
      legacyId: '1941',
      name: 'Shampoo Amino Color 250ml',
      slug: 'shampoo-amino-color-250ml',
      description: '<p>Descrição completa</p>',
      priceCents: 6950,
      stockQuantity: 12,
      sku: 'woo-1941',
      status: 'ACTIVE',
      brand: { legacyId: '64', name: 'KNUT', slug: 'knut' },
      categories: [{ legacyId: '32', name: 'Shampoo', slug: 'shampoo' }],
      images: [{ path: 'https://example.com/shampoo.jpg', isPrimary: true }],
    });
  });

  it('converts WooCommerce decimal strings to integer cents', () => {
    expect(parseWooPriceCents('69.50')).toBe(6950);
    expect(parseWooPriceCents('6950')).toBe(6950);
    expect(parseWooPriceCents('')).toBe(0);
  });

  it('keeps the assigned subbrand when WooCommerce also returns its main brand', () => {
    const mapped = mapWooProduct({
      id: 2001,
      name: 'Creme Finalizador Alkymia',
      slug: 'creme-finalizador-alkymia',
      brands: [
        { id: 48, name: 'Alkymia', slug: 'alkymia' },
        { id: 26, name: 'Grandha', slug: 'grandha' },
      ],
    }, new Map([['48', '26']]));

    expect(mapped.brand).toMatchObject({ legacyId: '48', name: 'Alkymia', slug: 'alkymia' });
  });
});
