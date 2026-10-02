export const FAVORITES_STORAGE_KEY = 'je_favorite_products';
export const FAVORITES_UPDATED_EVENT = 'je-favorites-updated';

export function readFavoriteProductSlugs(): string[] {
  try {
    const stored = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) ?? '[]');
    return Array.isArray(stored) ? stored.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

export function setFavoriteProduct(slug: string, favorite: boolean): boolean {
  const favorites = readFavoriteProductSlugs();
  const nextFavorites = favorite
    ? [...new Set([...favorites, slug])]
    : favorites.filter((favoriteSlug) => favoriteSlug !== slug);
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
  window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT));
  return favorite;
}
