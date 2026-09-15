import { describe, expect, it } from 'vitest';
import { flattenTaxonomy, slugifyProductName } from './product-editor-utils';

describe('product editor utilities', () => {
  it('generates a URL-safe product slug automatically', () => {
    expect(slugifyProductName('Máscara Reconstrução — Haskell 500ml')).toBe('mascara-reconstrucao-haskell-500ml');
  });

  it('flattens brands with indented subbrands in parent order', () => {
    expect(flattenTaxonomy([
      { id: 'child', name: 'Alkymia', parentId: 'parent' },
      { id: 'parent', name: 'Grandha', parentId: null },
    ])).toEqual([
      { id: 'parent', name: 'Grandha', parentId: null, depth: 0 },
      { id: 'child', name: 'Alkymia', parentId: 'parent', depth: 1 },
    ]);
  });
});
