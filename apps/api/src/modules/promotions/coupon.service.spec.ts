import { CouponStatus } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../database/prisma.service';
import { CouponService } from './coupon.service';

describe('CouponService', () => {
  const prisma = new PrismaService();
  const service = new CouponService(prisma);
  const code = `TEST-${Date.now()}`;

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.coupon.create({
      data: {
        code,
        status: CouponStatus.ACTIVE,
        startsAt: new Date(Date.now() - 60_000),
        usageLimit: 1,
      },
    });
  });

  afterAll(async () => {
    const coupon = await prisma.coupon.findUnique({ where: { code }, select: { id: true } });
    if (coupon) await prisma.couponRedemption.deleteMany({ where: { couponId: coupon.id } });
    await prisma.coupon.deleteMany({ where: { code } });
    await prisma.$disconnect();
  });

  it('returns the same redemption for a repeated idempotency key', async () => {
    const input = { code, subtotalCents: 10_000, idempotencyKey: `idem-${Date.now()}` };
    const first = await service.redeem(input);
    const second = await service.redeem(input);
    expect(second).toEqual(first);
    await expect(service.redeem({ ...input, idempotencyKey: `other-${Date.now()}` })).rejects.toThrow('Limite de uso atingido.');
  });

  it('quotes an advanced coupon using its relational rules without consuming it', async () => {
    const prisma = {
      coupon: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'coupon-advanced',
          code: 'VIP20',
          status: CouponStatus.ACTIVE,
          startsAt: new Date('2026-09-01T00:00:00.000Z'),
          endsAt: null,
          discountType: 'PERCENTAGE',
          discountValue: 20,
          allowFreeShipping: true,
          excludeSaleItems: false,
          usageCount: 0,
          usageLimit: null,
          perCustomerLimit: 2,
          minimumSubtotalCents: 10_000,
          maximumSubtotalCents: null,
          maxEligibleItems: null,
          productRules: [{ productId: 'product-1', excluded: false }],
          brandRules: [],
          categoryRules: [],
          emailRestrictions: [{ pattern: '*@gmail.com' }],
        }),
      },
      couponRedemption: { count: vi.fn().mockResolvedValue(0) },
    };
    const quoteService = new CouponService(prisma as never);

    const quote = await quoteService.quote({
      code: 'vip20',
      email: 'cliente@gmail.com',
      subtotalCents: 20_000,
      shippingCents: 1_500,
      items: [{ productId: 'product-1', brandId: null, quantity: 2, unitPriceCents: 10_000, compareAtPriceCents: null, categoryIds: [] }],
    });

    expect(quote).toMatchObject({ couponId: 'coupon-advanced', code: 'VIP20', discountCents: 4_000, shippingCents: 0, totalCents: 16_000 });
    expect(prisma.coupon.findUnique).toHaveBeenCalledTimes(1);
  });

  it('rejects a quote when the customer already reached the per-customer limit', async () => {
    const prisma = {
      coupon: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'coupon-customer-limit',
          code: 'ONCE',
          status: CouponStatus.ACTIVE,
          startsAt: new Date('2026-09-01T00:00:00.000Z'),
          endsAt: null,
          discountType: 'FIXED_CART',
          discountValue: 1_000,
          allowFreeShipping: false,
          excludeSaleItems: false,
          usageCount: 0,
          usageLimit: null,
          perCustomerLimit: 1,
          minimumSubtotalCents: null,
          maximumSubtotalCents: null,
          maxEligibleItems: null,
          productRules: [],
          brandRules: [],
          categoryRules: [],
          emailRestrictions: [],
        }),
      },
      couponRedemption: { count: vi.fn().mockResolvedValue(1) },
    };
    const quoteService = new CouponService(prisma as never);

    await expect(quoteService.quote({
      code: 'ONCE',
      userId: 'user-1',
      email: 'cliente@gmail.com',
      subtotalCents: 10_000,
      shippingCents: 0,
      items: [{ productId: 'product-1', brandId: null, quantity: 1, unitPriceCents: 10_000, compareAtPriceCents: null, categoryIds: [] }],
    })).rejects.toThrow('Limite por cliente atingido.');
    expect(prisma.couponRedemption.count).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ couponId: 'coupon-customer-limit' }) }));
  });

  it('stores and replays the complete evaluated response for advanced redemption idempotency', async () => {
    const coupon = {
      id: 'coupon-idempotent',
      code: 'VIP20',
      status: CouponStatus.ACTIVE,
      startsAt: new Date('2026-09-01T00:00:00.000Z'),
      endsAt: null,
      discountType: 'PERCENTAGE',
      discountValue: 20,
      allowFreeShipping: true,
      excludeSaleItems: false,
      usageCount: 0,
      usageLimit: null,
      perCustomerLimit: null,
      minimumSubtotalCents: null,
      maximumSubtotalCents: null,
      maxEligibleItems: null,
      productRules: [],
      brandRules: [],
      categoryRules: [],
      emailRestrictions: [],
    };
    const responseJson = { couponId: 'coupon-idempotent', redemptionId: 'redemption-1', discountCents: 2_000, shippingCents: 0, totalCents: 8_000, eligibleSubtotalCents: 10_000, eligibleQuantity: 1 };
    const transaction = {
      coupon: { findUnique: vi.fn().mockResolvedValue(coupon), updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      couponRedemption: { create: vi.fn().mockResolvedValue({ id: 'redemption-1' }) },
      idempotencyKey: {
        findUnique: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ scope: 'coupon:coupon-idempotent', expiresAt: new Date(Date.now() + 60_000), responseJson }),
        create: vi.fn(),
      },
      $queryRaw: vi.fn().mockResolvedValue([]),
    };
    const prisma = { $transaction: vi.fn((callback: (value: typeof transaction) => unknown) => callback(transaction)) };
    const redeemService = new CouponService(prisma as never);
    const input = { code: 'vip20', subtotalCents: 10_000, shippingCents: 1_000, items: [{ productId: 'product-1', brandId: null, quantity: 1, unitPriceCents: 10_000, compareAtPriceCents: null, categoryIds: [] }], idempotencyKey: 'idem-advanced' };

    const first = await redeemService.redeem(input);
    const second = await redeemService.redeem(input);

    expect(first).toEqual(responseJson);
    expect(second).toEqual(responseJson);
    expect(transaction.idempotencyKey.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ responseJson }) }));
  });

  it('releases a pending redemption exactly once when an order is cancelled', async () => {
    const transaction = {
      couponRedemption: {
        findUnique: vi.fn().mockResolvedValue({ id: 'redemption-1', couponId: 'coupon-1' }),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      coupon: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
    };
    const result = await service.releaseInTransaction(transaction as never, 'order-1');

    expect(result).toBe(true);
    expect(transaction.couponRedemption.deleteMany).toHaveBeenCalledWith({ where: { id: 'redemption-1' } });
    expect(transaction.coupon.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'coupon-1', usageCount: { gt: 0 } } }));
  });
});
