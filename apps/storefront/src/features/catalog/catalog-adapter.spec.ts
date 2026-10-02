import { describe, expect, it } from 'vitest';
import { normalizeStoreProduct } from './catalog-adapter';

describe('normalizeStoreProduct', () => {
  it('keeps the real description, SKU, category and brand while decoding HTML entities', () => {
    expect(normalizeStoreProduct({
      name: 'CURL &AMP; WAVE',
      slug: 'curl-wave',
      description: '<p><b>Texto original</b></p>',
      brand: { name: 'BIOMA CARE', slug: 'bioma-care' },
      categories: [{ category: { name: 'Hidratação e Reparação', slug: 'hidratacao-e-reparacao' } }],
      variants: [{ id: 'variant-1', sku: '179191651651', status: 'ACTIVE', priceCents: 19000 }],
    })).toMatchObject({
      name: 'CURL & WAVE',
      descriptionHtml: '<p><b>Texto original</b></p>',
      sku: '179191651651',
      brandName: 'BIOMA CARE',
      brandSlug: 'bioma-care',
      categories: [{ name: 'Hidratação e Reparação', slug: 'hidratacao-e-reparacao' }],
    });
  });
});
