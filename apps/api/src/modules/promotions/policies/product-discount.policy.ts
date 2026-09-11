import { PriceAdjustment } from '@commerce/contracts';
import { PricingContext, PromotionCandidate, PromotionPolicy } from '../promotion-engine';

export class ProductDiscountPolicy implements PromotionPolicy {
  constructor(private readonly promotion: PromotionCandidate) {}

  isEligible(context: PricingContext): boolean {
    return this.promotion.scope === 'PRODUCT' && this.promotion.productId === context.productId;
  }

  calculate(context: PricingContext, baseCents: number): number {
    if (!this.isEligible(context)) return 0;
    return Math.min(baseCents, Math.round(baseCents * this.promotion.value / 100));
  }

  adjustment(amount: number): PriceAdjustment {
    return {
      code: this.promotion.code,
      label: this.promotion.label,
      amount: { amount, currency: 'BRL' },
    };
  }
}
