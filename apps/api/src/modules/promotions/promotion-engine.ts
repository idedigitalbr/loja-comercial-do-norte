import { PriceQuote } from '@commerce/contracts';

export type PromotionScope = 'PRODUCT' | 'BRAND' | 'CATEGORY' | 'COUPON' | 'VIP';
export type PromotionKind = 'PERCENTAGE' | 'FIXED' | 'FIXED_PRICE' | 'FREE_SHIPPING';

export type PromotionCandidate = {
  code: string;
  label: string;
  scope: PromotionScope;
  kind: PromotionKind;
  value: number;
  productId?: string;
  brandId?: string;
  startsAt?: Date;
  endsAt?: Date;
  minSubtotalCents?: number;
  exclusive?: boolean;
  stackable?: boolean;
};

export type PricingContext = {
  cartId: string;
  subtotalCents: number;
  shippingCents: number;
  productId?: string;
  brandId?: string;
  now?: Date;
  promotions: PromotionCandidate[];
};

export interface PromotionPolicy {
  isEligible(context: PricingContext): boolean;
  calculate(context: PricingContext, baseCents: number): number;
}

const scopePriority: Record<PromotionScope, number> = {
  PRODUCT: 5,
  BRAND: 4,
  CATEGORY: 3,
  COUPON: 2,
  VIP: 1,
};

export class PromotionEngine {
  async quote(context: PricingContext): Promise<PriceQuote> {
    const now = context.now ?? new Date();
    const eligible = context.promotions
      .filter((promotion) => this.isEligible(promotion, context, now))
      .sort((left, right) => scopePriority[right.scope] - scopePriority[left.scope]);
    const selected = this.selectPromotions(eligible);
    let baseCents = Math.max(0, context.subtotalCents);
    let discountCents = 0;
    let shippingCents = Math.max(0, context.shippingCents);
    const adjustments: PriceQuote['adjustments'] = [];

    for (const promotion of selected) {
      if (promotion.kind === 'FREE_SHIPPING') {
        const amount = shippingCents;
        shippingCents = 0;
        if (amount > 0) adjustments.push(this.adjustment(promotion, amount));
        continue;
      }

      const amount = this.calculateDiscount(promotion, baseCents);
      if (amount <= 0) continue;
      baseCents -= amount;
      discountCents += amount;
      adjustments.push(this.adjustment(promotion, amount));
    }

    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    return {
      cartId: context.cartId,
      subtotal: { amount: context.subtotalCents, currency: 'BRL' },
      discount: { amount: discountCents, currency: 'BRL' },
      shipping: { amount: shippingCents, currency: 'BRL' },
      total: { amount: baseCents + shippingCents, currency: 'BRL' },
      adjustments,
      expiresAt: expiresAt.toISOString(),
    };
  }

  private isEligible(promotion: PromotionCandidate, context: PricingContext, now: Date): boolean {
    if (promotion.startsAt && promotion.startsAt > now) return false;
    if (promotion.endsAt && promotion.endsAt <= now) return false;
    if (promotion.minSubtotalCents && context.subtotalCents < promotion.minSubtotalCents) return false;
    if (promotion.productId && promotion.productId !== context.productId) return false;
    if (promotion.brandId && promotion.brandId !== context.brandId) return false;
    return true;
  }

  private selectPromotions(promotions: PromotionCandidate[]): PromotionCandidate[] {
    const exclusive = promotions.filter((promotion) => promotion.exclusive);
    if (exclusive.length) return [exclusive[0]];
    return promotions.filter((promotion) => promotion.scope !== 'VIP' || promotion.stackable);
  }

  private calculateDiscount(promotion: PromotionCandidate, baseCents: number): number {
    if (promotion.kind === 'PERCENTAGE') return Math.min(baseCents, Math.round(baseCents * promotion.value / 100));
    if (promotion.kind === 'FIXED') return Math.min(baseCents, Math.max(0, promotion.value));
    if (promotion.kind === 'FIXED_PRICE') return Math.min(baseCents, Math.max(0, baseCents - promotion.value));
    return 0;
  }

  private adjustment(promotion: PromotionCandidate, amount: number) {
    return {
      code: promotion.code,
      label: promotion.label,
      amount: { amount, currency: 'BRL' as const },
    };
  }
}
