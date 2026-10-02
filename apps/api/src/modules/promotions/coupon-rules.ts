export type CouponDiscountType = 'PERCENTAGE' | 'FIXED_CART' | 'FIXED_PRODUCT';

export type CouponRule = {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  allowFreeShipping: boolean;
  excludeSaleItems: boolean;
  minimumSubtotalCents: number | null;
  maximumSubtotalCents: number | null;
  maxEligibleItems: number | null;
  usageCount: number;
  usageLimit: number | null;
  perCustomerLimit: number | null;
  productRules: Array<{ productId: string; excluded: boolean }>;
  brandRules: Array<{ brandId: string; excluded: boolean }>;
  categoryRules: Array<{ categoryId: string; excluded: boolean }>;
  emailPatterns: string[];
  startsAt: Date;
  endsAt: Date | null;
};

export type CouponEvaluationItem = {
  productId: string;
  brandId: string | null;
  quantity: number;
  unitPriceCents: number;
  compareAtPriceCents: number | null;
  categoryIds: string[];
};

export type CouponEvaluationContext = {
  subtotalCents: number;
  shippingCents: number;
  email?: string;
  items: CouponEvaluationItem[];
  customerUsageCount?: number;
  now?: Date;
};

export type CouponEvaluation = {
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  eligibleSubtotalCents: number;
  eligibleQuantity: number;
};

export class CouponRuleError extends Error {
  readonly code = 'COUPON_NOT_ELIGIBLE';

  constructor(message: string) {
    super(message);
    this.name = 'CouponRuleError';
  }
}

function matchesEmailPattern(email: string, pattern: string): boolean {
  const escaped = pattern.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*');
  return new RegExp(`^${escaped}$`, 'i').test(email);
}

function itemMatchesInclusions(item: CouponEvaluationItem, productRules: CouponRule['productRules'], brandRules: CouponRule['brandRules'], categoryRules: CouponRule['categoryRules']): boolean {
  const productInclusions = productRules.filter((rule) => !rule.excluded).map((rule) => rule.productId);
  const brandInclusions = brandRules.filter((rule) => !rule.excluded).map((rule) => rule.brandId);
  const categoryInclusions = categoryRules.filter((rule) => !rule.excluded).map((rule) => rule.categoryId);
  if (!productInclusions.length && !brandInclusions.length && !categoryInclusions.length) return true;
  return productInclusions.includes(item.productId)
    || (item.brandId !== null && brandInclusions.includes(item.brandId))
    || item.categoryIds.some((categoryId) => categoryInclusions.includes(categoryId));
}

function itemIsExcluded(item: CouponEvaluationItem, productRules: CouponRule['productRules'], brandRules: CouponRule['brandRules'], categoryRules: CouponRule['categoryRules']): boolean {
  const excludedProducts = productRules.filter((rule) => rule.excluded).map((rule) => rule.productId);
  const excludedBrands = brandRules.filter((rule) => rule.excluded).map((rule) => rule.brandId);
  const excludedCategories = categoryRules.filter((rule) => rule.excluded).map((rule) => rule.categoryId);
  return excludedProducts.includes(item.productId)
    || (item.brandId !== null && excludedBrands.includes(item.brandId))
    || item.categoryIds.some((categoryId) => excludedCategories.includes(categoryId));
}

export function evaluateCoupon(coupon: CouponRule, context: CouponEvaluationContext): CouponEvaluation {
  const now = context.now ?? new Date();
  if (coupon.startsAt > now || (coupon.endsAt && coupon.endsAt <= now)) throw new CouponRuleError('Cupom fora da vigência.');
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) throw new CouponRuleError('Limite de uso atingido.');
  if (coupon.perCustomerLimit !== null && context.customerUsageCount !== undefined && context.customerUsageCount >= coupon.perCustomerLimit) {
    throw new CouponRuleError('Limite por cliente atingido.');
  }
  if (coupon.minimumSubtotalCents !== null && context.subtotalCents < coupon.minimumSubtotalCents) throw new CouponRuleError('Subtotal mínimo não atingido.');
  if (coupon.maximumSubtotalCents !== null && context.subtotalCents > coupon.maximumSubtotalCents) throw new CouponRuleError('Subtotal máximo excedido.');
  if (coupon.emailPatterns.length && (!context.email || !coupon.emailPatterns.some((pattern) => matchesEmailPattern(context.email!, pattern)))) {
    throw new CouponRuleError('E-mail não autorizado.');
  }

  const eligibleItems = context.items.filter((item) => item.quantity > 0)
    .filter((item) => !itemIsExcluded(item, coupon.productRules, coupon.brandRules, coupon.categoryRules))
    .filter((item) => itemMatchesInclusions(item, coupon.productRules, coupon.brandRules, coupon.categoryRules))
    .filter((item) => !coupon.excludeSaleItems || item.compareAtPriceCents === null || item.compareAtPriceCents <= item.unitPriceCents);

  let remainingQuantity = coupon.maxEligibleItems ?? Number.MAX_SAFE_INTEGER;
  const discountedItems = eligibleItems.map((item) => {
    const quantity = Math.max(0, Math.min(item.quantity, remainingQuantity));
    remainingQuantity -= quantity;
    return { ...item, quantity };
  }).filter((item) => item.quantity > 0);
  const eligibleQuantity = discountedItems.reduce((sum, item) => sum + item.quantity, 0);
  const eligibleSubtotalCents = discountedItems.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  if (!eligibleQuantity || !eligibleSubtotalCents) throw new CouponRuleError('Nenhum item elegível para este cupom.');

  const discountCents = coupon.discountType === 'PERCENTAGE'
    ? Math.min(eligibleSubtotalCents, Math.round(eligibleSubtotalCents * Math.min(100, Math.max(0, coupon.discountValue)) / 100))
    : coupon.discountType === 'FIXED_PRODUCT'
      ? Math.min(eligibleSubtotalCents, Math.max(0, coupon.discountValue) * eligibleQuantity)
      : Math.min(eligibleSubtotalCents, Math.max(0, coupon.discountValue));
  const shippingCents = coupon.allowFreeShipping ? 0 : Math.max(0, context.shippingCents);

  return {
    discountCents,
    shippingCents,
    totalCents: Math.max(0, context.subtotalCents - discountCents) + shippingCents,
    eligibleSubtotalCents,
    eligibleQuantity,
  };
}
