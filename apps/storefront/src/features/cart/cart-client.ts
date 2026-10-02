export type CartImage = { path: string; altText?: string | null; isPrimary?: boolean };

export type CartItem = {
  id: string;
  quantity: number;
  unitPriceCents: number;
  variant: {
    id: string;
    images?: CartImage[];
    product: {
      name: string;
      slug?: string | null;
      images?: CartImage[];
    };
  };
};

export type CartSnapshot = {
  id?: string;
  publicId?: string;
  status?: 'ACTIVE' | 'CONVERTED' | 'ABANDONED' | 'EXPIRED';
  items: CartItem[];
  subtotalCents: number;
};

export const CART_UPDATED_EVENT = 'je-cart-updated';

type CartCreateResponse = { publicId?: string };

export function normalizeCart(payload: unknown): CartSnapshot {
  const record = typeof payload === 'object' && payload !== null ? payload as Partial<CartSnapshot> : {};
  const items = Array.isArray(record.items) ? record.items as CartItem[] : [];
  return {
    id: typeof record.id === 'string' ? record.id : undefined,
    publicId: typeof record.publicId === 'string' ? record.publicId : undefined,
    status: record.status === 'ACTIVE' || record.status === 'CONVERTED' || record.status === 'ABANDONED' || record.status === 'EXPIRED'
      ? record.status
      : undefined,
    items,
    subtotalCents: typeof record.subtotalCents === 'number'
      ? record.subtotalCents
      : items.reduce((total, item) => total + item.quantity * item.unitPriceCents, 0),
  };
}

export async function getCart(publicId: string): Promise<CartSnapshot> {
  const response = await fetch(`/api/v1/carts/${publicId}`, { credentials: 'include' });
  if (!response.ok) throw new Error('CART_LOAD_FAILED');
  return normalizeCart(await response.json());
}

export function emitCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export async function getOrCreateCart(): Promise<string> {
  const storedPublicId = window.localStorage.getItem('je_cart_public_id');
  if (storedPublicId) {
    try {
      const cart = await getCart(storedPublicId);
      if (!cart.status || cart.status === 'ACTIVE') return storedPublicId;
    } catch {
      // A stale or missing cart is replaced below.
    }
    window.localStorage.removeItem('je_cart_public_id');
  }

  const response = await fetch('/api/v1/carts', { method: 'POST', credentials: 'include' });
  if (!response.ok) throw new Error('CART_CREATE_FAILED');
  const payload = await response.json() as CartCreateResponse;
  if (!payload.publicId) throw new Error('CART_ID_MISSING');

  window.localStorage.setItem('je_cart_public_id', payload.publicId);
  return payload.publicId;
}

export async function addCartItem(publicId: string, variantId: string, quantity = 1): Promise<CartSnapshot> {
  const response = await fetch(`/api/v1/carts/${publicId}/items`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ variantId, quantity }),
  });
  if (!response.ok) throw new Error('CART_ITEM_ADD_FAILED');
  const cart = normalizeCart(await response.json());
  emitCartUpdated();
  return cart;
}
