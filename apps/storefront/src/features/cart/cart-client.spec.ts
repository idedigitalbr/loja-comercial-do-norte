import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { addCartItem, getOrCreateCart } from './cart-client';

describe('cart client lifecycle', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it('creates a fresh cart when the persisted cart was already converted into an order', async () => {
    window.localStorage.setItem('je_cart_public_id', 'converted-cart');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ publicId: 'converted-cart', status: 'CONVERTED', items: [], subtotalCents: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ publicId: 'new-cart' }),
      });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getOrCreateCart()).resolves.toBe('new-cart');
    expect(window.localStorage.getItem('je_cart_public_id')).toBe('new-cart');
    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/v1/carts/converted-cart', expect.objectContaining({ credentials: 'include' }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/v1/carts', expect.objectContaining({ method: 'POST' }));
  });

  it('returns the server cart snapshot after adding an item', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ publicId: 'cart-1', status: 'ACTIVE', items: [], subtotalCents: 0 }),
    }));

    await expect(addCartItem('cart-1', 'variant-1')).resolves.toMatchObject({ publicId: 'cart-1', status: 'ACTIVE' });
  });
});
