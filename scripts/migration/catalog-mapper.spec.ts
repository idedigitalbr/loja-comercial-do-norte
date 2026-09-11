import { describe, expect, it } from 'vitest';
import { mapBrand, mapCategory, mapProductRow } from './catalog-mapper';

describe('WooCommerce catalog mapper', () => {
  it('normalizes brand casing and rejects Uncategorized', () => {
    expect(mapBrand('HASKELL')).toBe('Haskell');
    expect(mapBrand('haskell')).toBe('Haskell');
    expect(() => mapCategory('Uncategorized')).toThrow('CATEGORY_MAPPING_REQUIRED');
  });

  it('maps a product row with a stable legacy identity', () => {
    expect(mapProductRow({ id: 42, name: ' Produto ', slug: 'produto', brand: 'HASKELL', category: 'Shampoo', sku: 'SKU-42', price: '19.90' })).toEqual({
      legacySource: 'woocommerce',
      legacyId: '42',
      name: 'Produto',
      slug: 'produto',
      brandName: 'Haskell',
      categoryName: 'Shampoo',
      sku: 'SKU-42',
      priceCents: 1990,
    });
  });
});
