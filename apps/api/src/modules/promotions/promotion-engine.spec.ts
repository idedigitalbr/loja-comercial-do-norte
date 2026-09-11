import { describe, expect, it } from 'vitest';
import { PromotionEngine, PricingContext, PromotionCandidate } from './promotion-engine';

const engine = new PromotionEngine();
const context = (promotions: PromotionCandidate[]): PricingContext => ({
  cartId: 'cart-test',
  subtotalCents: 10_000,
  shippingCents: 1_500,
  now: new Date('2026-09-11T12:00:00.000Z'),
  promotions,
});

describe('PromotionEngine', () => {
  it.each([
    [
      'product exclusive beats brand',
      [
        { code: 'PRODUCT15', label: 'Produto', scope: 'PRODUCT', kind: 'PERCENTAGE', value: 15, exclusive: true },
        { code: 'BRAND10', label: 'Marca', scope: 'BRAND', kind: 'PERCENTAGE', value: 10 },
      ],
      8_500,
    ],
    [
      'vip stacks when explicitly allowed',
      [
        { code: 'PRODUCT10', label: 'Produto', scope: 'PRODUCT', kind: 'PERCENTAGE', value: 10 },
        { code: 'VIP5', label: 'VIP', scope: 'VIP', kind: 'PERCENTAGE', value: 5, stackable: true },
      ],
      8_550,
    ],
    [
      'expired coupon is ignored',
      [
        { code: 'EXPIRED', label: 'Cupom vencido', scope: 'COUPON', kind: 'PERCENTAGE', value: 20, endsAt: new Date('2026-09-10T00:00:00.000Z') },
      ],
      10_000,
    ],
  ])('%s', async (_name, promotions, expected) => {
    const quote = await engine.quote(context(promotions as PromotionCandidate[]));
    expect(quote.total.amount).toBe(expected + 1_500);
    expect(quote.discount.amount).toBe(10_000 - expected);
  });
});
