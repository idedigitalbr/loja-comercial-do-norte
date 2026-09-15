type CartCreateResponse = { publicId?: string };

export async function getOrCreateCart(): Promise<string> {
  const storedPublicId = window.localStorage.getItem('je_cart_public_id');
  if (storedPublicId) return storedPublicId;

  const response = await fetch('/api/v1/carts', { method: 'POST', credentials: 'include' });
  if (!response.ok) throw new Error('CART_CREATE_FAILED');
  const payload = await response.json() as CartCreateResponse;
  if (!payload.publicId) throw new Error('CART_ID_MISSING');

  window.localStorage.setItem('je_cart_public_id', payload.publicId);
  return payload.publicId;
}

export async function addCartItem(publicId: string, variantId: string, quantity = 1): Promise<void> {
  const response = await fetch(`/api/v1/carts/${publicId}/items`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ variantId, quantity }),
  });
  if (!response.ok) throw new Error('CART_ITEM_ADD_FAILED');
}
