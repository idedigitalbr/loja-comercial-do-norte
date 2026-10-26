import { describe, expect, it } from 'vitest';
import {
  addFavorite,
  isFavorite,
  parseFavorites,
  removeFavorite,
  toggleFavorite,
  type FavoriteItem,
} from './favorites';

const sampleItem: FavoriteItem = {
  id: 'prod-1',
  variantId: 'var-1',
  productSlug: 'copo-descartavel-200ml',
  name: 'Copo Descartável 200ml',
  imagePath: '/img/copo.jpg',
  unitPriceCents: 1590,
  addedAt: '2026-10-26T00:00:00.000Z',
};

describe('favorites rules', () => {
  it('adds item to favorites and prevents duplicates', () => {
    const list1 = addFavorite([], sampleItem);
    expect(list1).toHaveLength(1);
    expect(list1[0]?.id).toBe('prod-1');

    // Adding duplicate by ID or slug does not duplicate
    const list2 = addFavorite(list1, sampleItem);
    expect(list2).toHaveLength(1);
  });

  it('removes item from favorites by id or slug', () => {
    const list = [sampleItem];
    const afterId = removeFavorite(list, 'prod-1');
    expect(afterId).toHaveLength(0);

    const afterSlug = removeFavorite(list, 'copo-descartavel-200ml');
    expect(afterSlug).toHaveLength(0);
  });

  it('toggles item in favorites', () => {
    const list1 = toggleFavorite([], sampleItem);
    expect(list1).toHaveLength(1);
    expect(isFavorite(list1, 'prod-1')).toBe(true);

    const list2 = toggleFavorite(list1, sampleItem);
    expect(list2).toHaveLength(0);
    expect(isFavorite(list2, 'prod-1')).toBe(false);
  });

  it('parses valid and invalid JSON safely', () => {
    expect(parseFavorites(null)).toEqual([]);
    expect(parseFavorites('invalid json')).toEqual([]);
    expect(parseFavorites('{"not": "an array"}')).toEqual([]);

    const validJson = JSON.stringify([sampleItem]);
    const parsed = parseFavorites(validJson);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.name).toBe('Copo Descartável 200ml');
  });
});
