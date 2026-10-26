'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  addFavorite,
  FAVORITES_STORAGE_KEY,
  isFavorite as checkIsFavorite,
  parseFavorites,
  removeFavorite,
  toggleFavorite,
  type FavoriteItem,
} from '@/lib/favorites';

type FavoritesContextValue = {
  favorites: FavoriteItem[];
  count: number;
  ready: boolean;
  isFavorite: (idOrSlug: string) => boolean;
  add: (item: Omit<FavoriteItem, 'addedAt'>) => void;
  remove: (idOrSlug: string) => void;
  toggle: (item: Omit<FavoriteItem, 'addedAt'>) => void;
  clear: () => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFavorites(parseFavorites(window.localStorage.getItem(FAVORITES_STORAGE_KEY)));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Falha silenciosa caso o armazenamento local esteja desabilitado
    }
  }, [favorites, ready]);

  // Sincronização entre abas
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === FAVORITES_STORAGE_KEY) {
        setFavorites(parseFavorites(e.newValue));
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const add = useCallback((item: Omit<FavoriteItem, 'addedAt'>) => {
    setFavorites((current) => addFavorite(current, item));
  }, []);

  const remove = useCallback((idOrSlug: string) => {
    setFavorites((current) => removeFavorite(current, idOrSlug));
  }, []);

  const toggle = useCallback((item: Omit<FavoriteItem, 'addedAt'>) => {
    setFavorites((current) => toggleFavorite(current, item));
  }, []);

  const clear = useCallback(() => {
    setFavorites([]);
  }, []);

  const isFavorite = useCallback(
    (idOrSlug: string) => checkIsFavorite(favorites, idOrSlug),
    [favorites],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      count: favorites.length,
      ready,
      isFavorite,
      add,
      remove,
      toggle,
      clear,
    }),
    [favorites, ready, isFavorite, add, remove, toggle, clear],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites precisa estar dentro de FavoritesProvider');
  }
  return context;
}
