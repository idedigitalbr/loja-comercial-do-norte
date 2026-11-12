import { describe, expect, it } from 'vitest';
import {
  filterAndSortProductsByPrice,
  hasRealDiscountOffer,
  interleaveDistinctProducts,
  rotateProductsForSection,
} from './catalog-filters';
import type { ApiProduct } from './types';

function makeProduct(index: number, priceCents: number | null = null, compareAtPriceCents: number | null = null): ApiProduct {
  return {
    id: `prod-${index}`,
    publicId: `prod-${index}`,
    name: `Produto ${index}`,
    slug: `produto-${index}`,
    description: null,
    status: 'ACTIVE',
    brand: { id: 'b1', name: 'Marca', slug: 'marca' },
    categories: [{ category: { id: 'c1', name: 'Categoria', slug: 'categoria' } }],
    images: [],
    variants: [
      {
        id: `var-${index}`,
        publicId: `var-${index}`,
        sku: `SKU-${index}`,
        pricingMode: priceCents ? 'FIXED_PRICE' : 'QUOTE_ONLY',
        priceCents,
        compareAtPriceCents,
        weightGrams: null,
        widthMm: null,
        heightMm: null,
        lengthMm: null,
        stockStatus: 'IN_STOCK',
        status: 'ACTIVE',
      },
    ],
  };
}

describe('catalog-filters', () => {
  it('identifies real discount offers only when compareAtPriceCents exceeds positive priceCents', () => {
    expect(hasRealDiscountOffer(makeProduct(1, null, 2000))).toBe(false);
    expect(hasRealDiscountOffer(makeProduct(2, 1500, null))).toBe(false);
    expect(hasRealDiscountOffer(makeProduct(3, 1500, 1500))).toBe(false);
    expect(hasRealDiscountOffer(makeProduct(4, 1500, 1990))).toBe(true);
  });

  it('interleaves products across category buckets without duplicates', () => {
    const a1 = makeProduct(1);
    const a2 = makeProduct(2);
    const b1 = makeProduct(3);
    const dup = makeProduct(1);
    const c1 = makeProduct(4);

    const mixed = interleaveDistinctProducts([[a1, a2], [b1, dup], [c1]], 10);
    expect(mixed.map((p) => p.slug)).toEqual(['produto-1', 'produto-3', 'produto-4', 'produto-2']);
  });

  it('rotates catalog slices distinctly across home carousel widgets when pool is rich', () => {
    const pool = Array.from({ length: 60 }, (_, idx) => makeProduct(idx + 1));
    expect(rotateProductsForSection(pool, undefined)[0].slug).toBe('produto-1');
    expect(rotateProductsForSection(pool, 's06-mais-vendidos')[0].slug).toBe('produto-9');
    expect(rotateProductsForSection(pool, 's10-para-voce-1')[0].slug).toBe('produto-29');
    expect(rotateProductsForSection(pool, 's14-para-voce-2')[0].slug).toBe('produto-49');

    const smallPool = Array.from({ length: 10 }, (_, idx) => makeProduct(idx + 1));
    expect(rotateProductsForSection(smallPool, 's06-mais-vendidos')[0].slug).toBe('produto-1');
  });

  it('keeps quote-only products behind priced items when sorting by price', () => {
    const quoteOnly = makeProduct(1, null, null);
    const priced = makeProduct(2, 1200, null);
    expect(filterAndSortProductsByPrice([quoteOnly, priced], { ordem: 'preco_asc' }).map((p) => p.id)).toEqual([
      'prod-2',
      'prod-1',
    ]);
  });
});
