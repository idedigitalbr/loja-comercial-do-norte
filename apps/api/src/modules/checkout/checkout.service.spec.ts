import { describe, expect, it, vi } from 'vitest';
import { CheckoutService } from './checkout.service';

describe('CheckoutService', () => {
  it('prepares one order and reuses it for the same idempotency key', async () => {
    const prisma = {
      idempotencyKey: {
        findUnique: vi.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ scope: 'checkout:cart-1', responseJson: { orderPublicId: 'order-public-1', amountCents: 12_500, expiresAt: '2026-09-11T15:30:00.000Z' } })
          .mockResolvedValueOnce({ scope: 'checkout:cart-1', responseJson: { orderPublicId: 'order-public-1', amountCents: 12_500, expiresAt: '2026-09-11T15:30:00.000Z' } }),
      },
      cart: { findFirst: vi.fn().mockResolvedValue({ id: 'cart-1', publicId: 'cart-public-1' }) },
      order: { findUnique: vi.fn().mockResolvedValue({ id: 'order-1', publicId: 'order-public-1', totalCents: 12_500 }) },
    };
    const orders = {
      createFromCart: vi.fn().mockResolvedValue({ id: 'order-1', publicId: 'order-public-1', totalCents: 12_500, inventoryReservations: [] }),
    };
    const service = new CheckoutService(prisma as never, orders as never);
    const input = { cartId: 'cart-1', contactEmail: 'cliente@teste.local', shippingCents: 2_500 };

    const first = await service.prepare(input, 'checkout-1');
    const second = await service.prepare(input, 'checkout-1');

    expect(first).toMatchObject({ orderPublicId: 'order-public-1', amountCents: 12_500 });
    expect(second).toEqual(first);
    expect(orders.createFromCart).toHaveBeenCalledTimes(1);
  });
});
