/**
 * Regras puras do carrinho de cotação (sem React) — testáveis isoladamente.
 * O carrinho vive no navegador e não reserva estoque; a cotação só existe
 * depois que o formulário é enviado para a API.
 */
export type QuoteCartItem = {
  variantId: string;
  productSlug: string;
  name: string;
  sku: string;
  imagePath: string | null;
  unitPriceCents: number;
  quantity: number;
};

export const QUOTE_CART_STORAGE_KEY = 'cn.quote.v1';
export const MAX_ITEM_QUANTITY = 999;
export const MAX_CART_ITEMS = 50;

export function normalizeQuantity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.trunc(value)));
}

export function addItem(items: readonly QuoteCartItem[], incoming: QuoteCartItem): QuoteCartItem[] {
  const existing = items.find((item) => item.variantId === incoming.variantId);
  if (existing) {
    return items.map((item) => item.variantId === incoming.variantId
      ? { ...item, quantity: normalizeQuantity(item.quantity + incoming.quantity) }
      : item);
  }
  if (items.length >= MAX_CART_ITEMS) return [...items];
  return [...items, { ...incoming, quantity: normalizeQuantity(incoming.quantity) }];
}

export function setQuantity(items: readonly QuoteCartItem[], variantId: string, quantity: number): QuoteCartItem[] {
  return items.map((item) => item.variantId === variantId ? { ...item, quantity: normalizeQuantity(quantity) } : item);
}

export function removeItem(items: readonly QuoteCartItem[], variantId: string): QuoteCartItem[] {
  return items.filter((item) => item.variantId !== variantId);
}

export function cartCount(items: readonly QuoteCartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function cartSubtotalCents(items: readonly QuoteCartItem[]): number {
  return items.reduce((total, item) => total + item.unitPriceCents * item.quantity, 0);
}

/** Lê o carrinho salvo no navegador com tolerância a dados inválidos/antigos. */
export function parseCart(raw: string | null): QuoteCartItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is QuoteCartItem => Boolean(item)
        && typeof (item as QuoteCartItem).variantId === 'string'
        && typeof (item as QuoteCartItem).name === 'string'
        && typeof (item as QuoteCartItem).unitPriceCents === 'number')
      .map((item) => ({ ...item, quantity: normalizeQuantity(item.quantity) }))
      .slice(0, MAX_CART_ITEMS);
  } catch {
    return [];
  }
}
