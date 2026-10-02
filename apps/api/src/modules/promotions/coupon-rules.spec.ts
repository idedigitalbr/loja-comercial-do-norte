import { describe, expect, it } from 'vitest';
import { CouponRuleError, evaluateCoupon, type CouponEvaluationContext, type CouponRule } from './coupon-rules';

const now = new Date('2026-09-15T12:00:00.000Z');
const line = (overrides: Partial<CouponEvaluationContext['items'][number]> = {}) => ({
  productId: 'product-1',
  quantity: 2,
  unitPriceCents: 10_000,
  compareAtPriceCents: null,
  brandId: null,
  categoryIds: ['category-1'],
  ...overrides,
});
const coupon = (overrides: Partial<CouponRule> = {}): CouponRule => ({
  code: 'BEMVINDO10',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  allowFreeShipping: false,
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
  emailPatterns: [],
  startsAt: new Date('2026-09-01T00:00:00.000Z'),
  endsAt: null,
  ...overrides,
});
const context = (overrides: Partial<CouponEvaluationContext> = {}): CouponEvaluationContext => ({
  subtotalCents: 20_000,
  shippingCents: 1_500,
  email: 'cliente@gmail.com',
  items: [line()],
  now,
  ...overrides,
});

describe('evaluateCoupon', () => {
  it('calculates percentage, fixed cart and fixed product discounts in cents', () => {
    expect(evaluateCoupon(coupon(), context()).discountCents).toBe(2_000);
    expect(evaluateCoupon(coupon({ discountType: 'FIXED_CART', discountValue: 3_000 }), context()).discountCents).toBe(3_000);
    expect(evaluateCoupon(coupon({ discountType: 'FIXED_PRODUCT', discountValue: 1_500 }), context()).discountCents).toBe(3_000);
  });

  it('applies product, category, sale-item, item-count and e-mail restrictions', () => {
    const restricted = coupon({
      discountType: 'FIXED_PRODUCT',
      discountValue: 2_000,
      excludeSaleItems: true,
      maxEligibleItems: 1,
      productRules: [{ productId: 'product-2', excluded: false }],
      categoryRules: [{ categoryId: 'category-2', excluded: true }],
      emailPatterns: ['*@gmail.com'],
    });
    const result = evaluateCoupon(restricted, context({
      items: [
        line({ productId: 'product-2', categoryIds: ['category-1'], quantity: 3, compareAtPriceCents: 12_000 }),
        line({ productId: 'product-2', categoryIds: ['category-1'], quantity: 3 }),
      ],
      subtotalCents: 60_000,
    }));

    expect(result.discountCents).toBe(2_000);
    expect(result.eligibleQuantity).toBe(1);
    expect(result.shippingCents).toBe(1_500);
  });

  it('supports minimum/maximum subtotal and free shipping', () => {
    const configured = coupon({ minimumSubtotalCents: 25_000, maximumSubtotalCents: 50_000, allowFreeShipping: true });
    expect(() => evaluateCoupon(configured, context())).toThrow('Subtotal mínimo não atingido.');
    expect(evaluateCoupon(configured, context({ subtotalCents: 30_000 })).shippingCents).toBe(0);
    expect(() => evaluateCoupon(configured, context({ subtotalCents: 60_000 }))).toThrow('Subtotal máximo excedido.');
  });

  it('enforces global and per-customer usage limits', () => {
    expect(() => evaluateCoupon(coupon({ usageCount: 2, usageLimit: 2 }), context())).toThrow('Limite de uso atingido.');
    expect(() => evaluateCoupon(coupon({ perCustomerLimit: 1 }), context({ customerUsageCount: 1 }))).toThrow('Limite por cliente atingido.');
    expect(evaluateCoupon(coupon({ perCustomerLimit: 2 }), context({ customerUsageCount: 1 })).discountCents).toBe(2_000);
  });

  it('supports brand inclusions and exclusions', () => {
    const configured = coupon({ brandRules: [{ brandId: 'brand-1', excluded: false }] });
    expect(evaluateCoupon(configured, context({ items: [line({ brandId: 'brand-1' })] })).discountCents).toBe(2_000);
    expect(() => evaluateCoupon(configured, context({ items: [line({ brandId: 'brand-2' })] }))).toThrow('Nenhum item elegível para este cupom.');
    expect(() => evaluateCoupon(coupon({ brandRules: [{ brandId: 'brand-1', excluded: true }] }), context({ items: [line({ brandId: 'brand-1' })] }))).toThrow('Nenhum item elegível para este cupom.');
  });

  it('rejects invalid windows, e-mails and carts without eligible items', () => {
    expect(() => evaluateCoupon(coupon({ startsAt: new Date('2026-09-16T00:00:00.000Z') }), context())).toThrow(CouponRuleError);
    expect(() => evaluateCoupon(coupon({ emailPatterns: ['*@outlook.com'] }), context())).toThrow('E-mail não autorizado.');
    expect(() => evaluateCoupon(coupon({ productRules: [{ productId: 'other-product', excluded: false }] }), context())).toThrow('Nenhum item elegível para este cupom.');
  });
});
