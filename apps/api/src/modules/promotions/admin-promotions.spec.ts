import { describe, expect, it, vi } from 'vitest';
import { AdminPromotionsController } from './admin-promotions.controller';
import { PromotionsService } from './promotions.service';

describe('PromotionsService admin resources', () => {
  it('creates a coupon in uppercase for the store', async () => {
    const prisma = { coupon: { create: vi.fn().mockResolvedValue({ code: 'BEMVINDO10' }) } };
    const service = new PromotionsService(prisma as never);

    await service.createCoupon({ code: 'bemvindo10', startsAt: new Date('2026-09-11') });

    expect(prisma.coupon.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ code: 'BEMVINDO10' }),
    }));
  });

  it('creates the advanced coupon rules and normalizes nested identifiers', async () => {
    const prisma = { coupon: { create: vi.fn().mockResolvedValue({ id: 'coupon-1', code: 'VIP20' }) } };
    const service = new PromotionsService(prisma as never);

    await service.createCoupon({
      code: ' vip20 ',
      description: 'Desconto para clientes VIP',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      allowFreeShipping: true,
      individualUse: true,
      excludeSaleItems: true,
      minimumSubtotalCents: 10_000,
      maximumSubtotalCents: 50_000,
      maxEligibleItems: 3,
      productIds: [' product-1 ', 'product-1'],
      excludedProductIds: ['product-2'],
      brandIds: [' brand-1 ', 'brand-1'],
      excludedBrandIds: ['brand-2'],
      categoryIds: ['category-1'],
      excludedCategoryIds: ['category-2'],
      emailPatterns: [' *@gmail.com ', '*@example.com'],
    });

    expect(prisma.coupon.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        code: 'VIP20',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        status: 'ACTIVE',
        productRules: { create: [{ productId: 'product-1', excluded: false }, { productId: 'product-2', excluded: true }] },
        brandRules: { create: [{ brandId: 'brand-1', excluded: false }, { brandId: 'brand-2', excluded: true }] },
        categoryRules: { create: [{ categoryId: 'category-1', excluded: false }, { categoryId: 'category-2', excluded: true }] },
        emailRestrictions: { create: [{ pattern: '*@gmail.com' }, { pattern: '*@example.com' }] },
      }),
    }));
  });

  it('honors the requested initial status and rejects conflicting rules', async () => {
    const prisma = { coupon: { create: vi.fn().mockResolvedValue({ id: 'coupon-1' }) } };
    const service = new PromotionsService(prisma as never);

    await service.createCoupon({ code: 'INACTIVE', status: 'INACTIVE' });
    expect(prisma.coupon.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'INACTIVE' }) }));
    expect(() => service.createCoupon({ code: 'CONFLICT', productIds: ['product-1'], excludedProductIds: [' product-1 '] })).toThrow('O mesmo item não pode estar incluído e excluído na mesma regra.');
  });

  it('rejects invalid percentage and inverted subtotal ranges before touching the database', async () => {
    const prisma = { coupon: { create: vi.fn() } };
    const service = new PromotionsService(prisma as never);

    expect(() => service.createCoupon({ code: 'INVALID', discountType: 'PERCENTAGE', discountValue: 101 })).toThrow('O percentual do desconto deve estar entre 0 e 100.');
    expect(() => service.createCoupon({ code: 'INVALID', minimumSubtotalCents: 20_000, maximumSubtotalCents: 10_000 })).toThrow('O gasto máximo não pode ser menor que o gasto mínimo.');
    expect(prisma.coupon.create).not.toHaveBeenCalled();
  });

  it('replaces advanced rule collections only when they are provided on update', async () => {
    const prisma = {
      coupon: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'coupon-1', code: 'VIP20', status: 'ACTIVE', discountType: 'PERCENTAGE', discountValue: 20,
          allowFreeShipping: false, individualUse: false, excludeSaleItems: false,
          startsAt: new Date('2026-09-01'), endsAt: null, usageLimit: null, perCustomerLimit: null,
          minimumSubtotalCents: null, maximumSubtotalCents: null, maxEligibleItems: null, description: null,
          productRules: [], brandRules: [], categoryRules: [], emailRestrictions: [],
        }),
        update: vi.fn().mockResolvedValue({ id: 'coupon-1' }),
      },
    };
    const service = new PromotionsService(prisma as never);

    await service.updateCoupon('coupon-1', {
      description: 'Atualizado',
      emailPatterns: ['cliente@teste.com'],
      categoryIds: [],
      excludedCategoryIds: [],
    });

    expect(prisma.coupon.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'coupon-1' },
      data: expect.objectContaining({
        description: 'Atualizado',
        emailRestrictions: { deleteMany: {}, create: [{ pattern: 'cliente@teste.com' }] },
        categoryRules: { deleteMany: {} },
      }),
    }));
  });

  it('preserves an explicit null expiration when an admin clears the field', async () => {
    const updateCoupon = vi.fn().mockResolvedValue({ id: 'coupon-1' });
    const controller = new AdminPromotionsController({ updateCoupon } as never);

    await controller.updateCoupon('coupon-1', { code: 'VIP20', endsAt: null } as never);

    expect(updateCoupon).toHaveBeenCalledWith('coupon-1', expect.objectContaining({ endsAt: null }));
  });

  it('validates the merged update and reactivates a derived expired coupon when its end is extended', async () => {
    const prisma = {
      coupon: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'coupon-1', code: 'VIP20', status: 'ACTIVE', discountType: 'FIXED_CART', discountValue: 1_000,
          allowFreeShipping: false, individualUse: false, excludeSaleItems: false,
          startsAt: new Date('2026-09-01'), endsAt: new Date('2026-09-10'), usageLimit: null, perCustomerLimit: null,
          minimumSubtotalCents: null, maximumSubtotalCents: null, maxEligibleItems: null, description: null,
          productRules: [{ productId: 'product-1', excluded: false }], brandRules: [], categoryRules: [], emailRestrictions: [],
        }),
        update: vi.fn().mockResolvedValue({ id: 'coupon-1' }),
      },
    };
    const service = new PromotionsService(prisma as never);

    await service.updateCoupon('coupon-1', { status: 'EXPIRED', endsAt: new Date('2099-09-10') });

    expect(prisma.coupon.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'ACTIVE', endsAt: new Date('2099-09-10') }) }));
  });
});
