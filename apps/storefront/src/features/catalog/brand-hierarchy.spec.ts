import { describe, expect, it } from 'vitest';
import { flattenBrandTree } from './brand-hierarchy';

describe('brand hierarchy', () => {
  it('keeps main brands first and indents their subbrands', () => {
    expect(flattenBrandTree([
      { id: 'brand-alkymia', value: 'alkymia', label: 'Alkymia', parentId: 'brand-grandha' },
      { id: 'brand-haskell', value: 'haskell', label: 'Haskell' },
      { id: 'brand-grandha', value: 'grandha', label: 'Grandha' },
      { id: 'brand-black-touch', value: 'black-touch', label: 'Black Touch', parentId: 'brand-grandha' },
    ])).toEqual([
      { value: 'grandha', label: 'Grandha', parentId: null, depth: 0 },
      { value: 'alkymia', label: 'Alkymia', parentId: 'brand-grandha', depth: 1 },
      { value: 'black-touch', label: 'Black Touch', parentId: 'brand-grandha', depth: 1 },
      { value: 'haskell', label: 'Haskell', parentId: null, depth: 0 },
    ]);
  });
});
