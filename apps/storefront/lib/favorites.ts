/**
 * Regras puras para gestão de favoritos no storefront (sem dependência de React).
 * Os favoritos são persistidos no navegador do cliente (localStorage) permitindo
 * que visitantes não logados guardem produtos favoritos antes de entrar ou criar conta.
 */

export type FavoriteItem = {
  id: string;
  variantId?: string;
  productSlug: string;
  name: string;
  sku?: string;
  imagePath: string | null;
  unitPriceCents: number;
  compareAtPriceCents?: number | null;
  category?: string | null;
  addedAt: string;
};

export const FAVORITES_STORAGE_KEY = 'cn.favorites.v1';
export const MAX_FAVORITES_ITEMS = 100;

export function isFavorite(items: readonly FavoriteItem[], idOrSlug: string): boolean {
  if (!idOrSlug) return false;
  return items.some((item) => item.id === idOrSlug || item.productSlug === idOrSlug);
}

export function addFavorite(
  items: readonly FavoriteItem[],
  incoming: Omit<FavoriteItem, 'addedAt'> & { addedAt?: string },
): FavoriteItem[] {
  if (isFavorite(items, incoming.id) || isFavorite(items, incoming.productSlug)) {
    return [...items];
  }
  if (items.length >= MAX_FAVORITES_ITEMS) {
    return [...items];
  }
  const newItem: FavoriteItem = {
    ...incoming,
    addedAt: incoming.addedAt ?? new Date().toISOString(),
  };
  return [newItem, ...items];
}

export function removeFavorite(items: readonly FavoriteItem[], idOrSlug: string): FavoriteItem[] {
  return items.filter((item) => item.id !== idOrSlug && item.productSlug !== idOrSlug);
}

export function toggleFavorite(
  items: readonly FavoriteItem[],
  incoming: Omit<FavoriteItem, 'addedAt'> & { addedAt?: string },
): FavoriteItem[] {
  if (isFavorite(items, incoming.id) || isFavorite(items, incoming.productSlug)) {
    return removeFavorite(items, incoming.id || incoming.productSlug);
  }
  return addFavorite(items, incoming);
}

export function parseFavorites(raw: string | null): FavoriteItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is FavoriteItem =>
          Boolean(item) &&
          typeof (item as FavoriteItem).id === 'string' &&
          typeof (item as FavoriteItem).name === 'string' &&
          typeof (item as FavoriteItem).productSlug === 'string' &&
          typeof (item as FavoriteItem).unitPriceCents === 'number',
      )
      .slice(0, MAX_FAVORITES_ITEMS);
  } catch {
    return [];
  }
}
