'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { addItem, cartCount, cartSubtotalCents, parseCart, QUOTE_CART_STORAGE_KEY, removeItem, setQuantity, type QuoteCartItem } from '@/lib/quote-cart';

type QuoteCartContextValue = {
  items: QuoteCartItem[];
  count: number;
  subtotalCents: number;
  ready: boolean;
  drawerOpen: boolean;
  add: (item: QuoteCartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const QuoteCartContext = createContext<QuoteCartContextValue | null>(null);

/** Carrinho de cotação no navegador (sem login, sem reserva de estoque). */
export function QuoteCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteCartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setItems(parseCart(window.localStorage.getItem(QUOTE_CART_STORAGE_KEY)));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(QUOTE_CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback((item: QuoteCartItem) => {
    setItems((current) => addItem(current, item));
    setDrawerOpen(true);
  }, []);
  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    setItems((current) => setQuantity(current, variantId, quantity));
  }, []);
  const remove = useCallback((variantId: string) => {
    setItems((current) => removeItem(current, variantId));
  }, []);
  const clear = useCallback(() => setItems([]), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<QuoteCartContextValue>(() => ({
    items,
    count: cartCount(items),
    subtotalCents: cartSubtotalCents(items),
    ready,
    drawerOpen,
    add,
    updateQuantity,
    remove,
    clear,
    openDrawer,
    closeDrawer,
  }), [items, ready, drawerOpen, add, updateQuantity, remove, clear, openDrawer, closeDrawer]);

  return <QuoteCartContext.Provider value={value}>{children}</QuoteCartContext.Provider>;
}

export function useQuoteCart(): QuoteCartContextValue {
  const context = useContext(QuoteCartContext);
  if (!context) throw new Error('useQuoteCart precisa estar dentro de QuoteCartProvider');
  return context;
}
