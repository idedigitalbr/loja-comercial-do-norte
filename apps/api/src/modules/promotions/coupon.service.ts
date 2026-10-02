import { CouponStatus, Prisma } from '@prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { assertIdempotencyScope } from '../../common/idempotency/idempotency';
import { PrismaService } from '../database/prisma.service';
import { evaluateCoupon, type CouponEvaluation, type CouponEvaluationItem, type CouponRule } from './coupon-rules';

const couponRuleInclude = {
  productRules: true,
  brandRules: true,
  categoryRules: true,
  emailRestrictions: true,
} as const;

type CouponWithRules = Prisma.CouponGetPayload<{ include: typeof couponRuleInclude }>;

export type RedeemCouponInput = {
  code: string;
  userId?: string;
  customerEmail?: string;
  orderId?: string;
  subtotalCents: number;
  shippingCents?: number;
  items?: CouponEvaluationItem[];
  idempotencyKey?: string;
};

export type CouponQuoteInput = {
  code: string;
  userId?: string;
  email?: string;
  subtotalCents: number;
  shippingCents: number;
  items: CouponEvaluationItem[];
  now?: Date;
};

export type ConsumeCouponInput = {
  couponId: string;
  userId?: string;
  customerEmail?: string;
  orderId?: string;
};

export class CouponError extends BadRequestException {
  readonly code = 'COUPON_NOT_ELIGIBLE';

  constructor(reason: string) {
    super({ code: 'COUPON_NOT_ELIGIBLE', message: reason });
  }
}

function normalizeEmail(email?: string): string | undefined {
  const value = email?.trim().toLowerCase();
  return value || undefined;
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function mapCouponRule(coupon: CouponWithRules): CouponRule {
  return {
    code: coupon.code,
    discountType: coupon.discountType as CouponRule['discountType'],
    discountValue: coupon.discountValue,
    allowFreeShipping: coupon.allowFreeShipping,
    excludeSaleItems: coupon.excludeSaleItems,
    minimumSubtotalCents: coupon.minimumSubtotalCents,
    maximumSubtotalCents: coupon.maximumSubtotalCents,
    maxEligibleItems: coupon.maxEligibleItems,
    usageCount: coupon.usageCount,
    usageLimit: coupon.usageLimit,
    perCustomerLimit: coupon.perCustomerLimit,
    productRules: coupon.productRules.map((rule) => ({ productId: rule.productId, excluded: rule.excluded })),
    brandRules: coupon.brandRules.map((rule) => ({ brandId: rule.brandId, excluded: rule.excluded })),
    categoryRules: coupon.categoryRules.map((rule) => ({ categoryId: rule.categoryId, excluded: rule.excluded })),
    emailPatterns: coupon.emailRestrictions.map((rule) => rule.pattern),
    startsAt: coupon.startsAt,
    endsAt: coupon.endsAt,
  };
}

function customerFilters(userId?: string, customerEmail?: string): Prisma.CouponRedemptionWhereInput[] {
  const email = normalizeEmail(customerEmail);
  return [
    ...(userId ? [{ userId }] : []),
    ...(email ? [{ customerEmail: email }] : []),
  ];
}

async function countCustomerUses(client: Pick<PrismaService, 'couponRedemption'>, couponId: string, userId?: string, customerEmail?: string): Promise<number | undefined> {
  const filters = customerFilters(userId, customerEmail);
  if (!filters.length) return undefined;
  return client.couponRedemption.count({ where: { couponId, OR: filters } });
}

async function countCustomerUsesForUpdate(transaction: Prisma.TransactionClient, couponId: string, userId?: string, customerEmail?: string): Promise<number | undefined> {
  const ids = new Set<string>();
  if (userId) {
    const rows = await transaction.$queryRaw<Array<{ id: string }>>`SELECT id FROM CouponRedemption WHERE couponId = ${couponId} AND userId = ${userId} FOR UPDATE`;
    rows.forEach((row) => ids.add(row.id));
  }
  if (customerEmail) {
    const rows = await transaction.$queryRaw<Array<{ id: string }>>`SELECT id FROM CouponRedemption WHERE couponId = ${couponId} AND customerEmail = ${customerEmail} FOR UPDATE`;
    rows.forEach((row) => ids.add(row.id));
  }
  return userId || customerEmail ? ids.size : undefined;
}

function requiresItemEvaluation(coupon: CouponWithRules): boolean {
  return coupon.discountType !== 'FIXED_CART'
    || coupon.allowFreeShipping
    || coupon.excludeSaleItems
    || coupon.maxEligibleItems !== null
    || coupon.productRules.length > 0
    || coupon.brandRules.length > 0
    || coupon.categoryRules.length > 0
    || coupon.emailRestrictions.length > 0;
}

function assertActive(coupon: Pick<CouponWithRules, 'status' | 'startsAt' | 'endsAt'>, now: Date) {
  if (coupon.status !== CouponStatus.ACTIVE || coupon.startsAt > now || (coupon.endsAt && coupon.endsAt <= now)) {
    throw new CouponError('Cupom fora da vigência.');
  }
}

@Injectable()
export class CouponService {
  constructor(private readonly prisma: PrismaService) {}

  async quote(input: CouponQuoteInput) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: normalizeCode(input.code) }, include: couponRuleInclude }) as CouponWithRules | null;
    if (!coupon) throw new CouponError('Cupom fora da vigência.');
    const now = input.now ?? new Date();
    const normalizedEmail = normalizeEmail(input.email);
    const customerUsageCount = await countCustomerUses(this.prisma, coupon.id, input.userId, normalizedEmail);
    assertActive(coupon, now);
    let evaluation: CouponEvaluation;
    try {
      evaluation = evaluateCoupon(mapCouponRule(coupon), { ...input, email: normalizedEmail, customerUsageCount, now });
    } catch (error) {
      if (error instanceof CouponError) throw error;
      throw new CouponError(error instanceof Error ? error.message : 'Cupom não elegível.');
    }
    return { couponId: coupon.id, code: coupon.code, ...evaluation };
  }

  async quoteInTransaction(transaction: Prisma.TransactionClient, input: CouponQuoteInput) {
    const coupon = await transaction.coupon.findUnique({ where: { code: normalizeCode(input.code) }, include: couponRuleInclude }) as CouponWithRules | null;
    if (!coupon) throw new CouponError('Cupom fora da vigência.');
    const now = input.now ?? new Date();
    const normalizedEmail = normalizeEmail(input.email);
    const customerUsageCount = await countCustomerUses(transaction, coupon.id, input.userId, normalizedEmail);
    assertActive(coupon, now);
    try {
      return { couponId: coupon.id, code: coupon.code, ...evaluateCoupon(mapCouponRule(coupon), { ...input, email: normalizedEmail, customerUsageCount, now }) };
    } catch (error) {
      if (error instanceof CouponError) throw error;
      throw new CouponError(error instanceof Error ? error.message : 'Cupom não elegível.');
    }
  }

  async redeem(input: RedeemCouponInput) {
    const now = new Date();
    return this.prisma.$transaction(async (transaction) => {
      const coupon = await transaction.coupon.findUnique({ where: { code: normalizeCode(input.code) }, include: couponRuleInclude }) as CouponWithRules | null;
      if (!coupon) throw new CouponError('Cupom fora da vigência.');
      assertActive(coupon, now);
      if (input.idempotencyKey) {
        const previous = await transaction.idempotencyKey.findUnique({ where: { key: input.idempotencyKey } });
        assertIdempotencyScope(previous, `coupon:${coupon.id}`);
        if (previous && previous.expiresAt > now && previous.responseJson) return previous.responseJson;
      }
      const normalizedEmail = normalizeEmail(input.customerEmail);
      const customerUsageCount = await countCustomerUses(transaction, coupon.id, input.userId, normalizedEmail);
      let evaluation: CouponEvaluation | undefined;
      if (input.items || requiresItemEvaluation(coupon)) {
        if (!input.items) throw new CouponError('Os itens do carrinho são necessários para validar este cupom.');
        try {
          evaluation = evaluateCoupon(mapCouponRule(coupon), {
            subtotalCents: input.subtotalCents,
            shippingCents: input.shippingCents ?? 0,
            email: normalizedEmail,
            items: input.items,
            customerUsageCount,
            now,
          });
        } catch (error) {
          if (error instanceof CouponError) throw error;
          throw new CouponError(error instanceof Error ? error.message : 'Cupom não elegível.');
        }
      } else {
        if (coupon.minimumSubtotalCents !== null && input.subtotalCents < coupon.minimumSubtotalCents) throw new CouponError('Subtotal mínimo não atingido.');
        if (coupon.maximumSubtotalCents !== null && input.subtotalCents > coupon.maximumSubtotalCents) throw new CouponError('Subtotal máximo excedido.');
      }
      const result = await this.consumeInTransaction(transaction, { couponId: coupon.id, userId: input.userId, customerEmail: input.customerEmail, orderId: input.orderId });
      const responsePayload = evaluation ? { ...result, ...evaluation } : result;
      if (input.idempotencyKey) {
        await transaction.idempotencyKey.create({
          data: {
            key: input.idempotencyKey,
            scope: `coupon:${coupon.id}`,
            responseJson: responsePayload,
            expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          },
        });
      }
      return responsePayload;
    });
  }

  async consumeInTransaction(transaction: Prisma.TransactionClient, input: ConsumeCouponInput) {
    const now = new Date();
    await transaction.$queryRaw<{ id: string }[]>`SELECT id FROM Coupon WHERE id = ${input.couponId} FOR UPDATE`;
    const coupon = await transaction.coupon.findUnique({ where: { id: input.couponId } });
    if (!coupon) throw new CouponError('Cupom fora da vigência.');
    assertActive(coupon, now);
    if (input.orderId) {
      const existing = await transaction.couponRedemption.findUnique({ where: { orderId: input.orderId } });
      if (existing) return { couponId: existing.couponId, redemptionId: existing.id };
    }

    const customerEmail = normalizeEmail(input.customerEmail);
    const customerUses = await countCustomerUsesForUpdate(transaction, coupon.id, input.userId, customerEmail);
    if (coupon.perCustomerLimit !== null && customerUses !== undefined) {
      if (customerUses >= coupon.perCustomerLimit) throw new CouponError('Limite por cliente atingido.');
    }

    const update = await transaction.coupon.updateMany({
      where: { id: coupon.id, ...(coupon.usageLimit !== null ? { usageCount: { lt: coupon.usageLimit } } : {}) },
      data: { usageCount: { increment: 1 } },
    });
    if (update.count !== 1) throw new CouponError('Limite de uso atingido.');
    const redemption = await transaction.couponRedemption.create({ data: { couponId: coupon.id, userId: input.userId, customerEmail, orderId: input.orderId } });
    return { couponId: coupon.id, redemptionId: redemption.id };
  }

  async releaseInTransaction(transaction: Prisma.TransactionClient, orderId: string) {
    const redemption = await transaction.couponRedemption.findUnique({ where: { orderId } });
    if (!redemption) return false;
    const deleted = await transaction.couponRedemption.deleteMany({ where: { id: redemption.id } });
    if (deleted.count !== 1) return false;
    await transaction.coupon.updateMany({ where: { id: redemption.couponId, usageCount: { gt: 0 } }, data: { usageCount: { decrement: 1 } } });
    return true;
  }
}
