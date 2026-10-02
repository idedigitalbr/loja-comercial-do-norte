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

  it('quotes a coupon against the current cart before preparing the order', async () => {
    const prisma = {
      cart: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'cart-1',
          publicId: 'cart-public-1',
          items: [{ quantity: 2, unitPriceCents: 10_000, variant: { productId: 'product-1', priceCents: 10_000, compareAtPriceCents: null, product: { brandId: null, categories: [] } } }],
        }),
      },
    };
    const orders = { createFromCart: vi.fn() };
    const coupons = { quote: vi.fn().mockResolvedValue({ couponId: 'coupon-1', code: 'VIP20', discountCents: 4_000, shippingCents: 0, totalCents: 16_000, eligibleSubtotalCents: 20_000, eligibleQuantity: 2 }) };
    const service = new CheckoutService(prisma as never, orders as never, coupons as never);

    const quote = await service.quote({ cartId: 'cart-public-1', userId: 'user-1', couponCode: 'vip20', contactEmail: 'cliente@teste.com', shippingCents: 1_500 });

    expect(quote).toMatchObject({ subtotalCents: 20_000, discountCents: 4_000, shippingCents: 0, totalCents: 16_000, couponCode: 'VIP20' });
    expect(coupons.quote).toHaveBeenCalledWith(expect.objectContaining({ code: 'vip20', userId: 'user-1', email: 'cliente@teste.com', shippingCents: 1_500 }));
  });
});
