import { CouponStatus } from '@prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export type RedeemCouponInput = {
  code: string;
  userId?: string;
  orderId?: string;
  subtotalCents: number;
  idempotencyKey?: string;
};

export class CouponError extends BadRequestException {
  readonly code = 'COUPON_NOT_ELIGIBLE';

  constructor(reason: string) {
    super({ code: 'COUPON_NOT_ELIGIBLE', message: reason });
  }
}

@Injectable()
export class CouponService {
  constructor(private readonly prisma: PrismaService) {}

  async redeem(input: RedeemCouponInput) {
    const now = new Date();
    return this.prisma.$transaction(async (transaction) => {
      if (input.idempotencyKey) {
        const previous = await transaction.idempotencyKey.findUnique({ where: { key: input.idempotencyKey } });
        if (previous && previous.expiresAt > now && previous.responseJson) return previous.responseJson;
      }

      const coupon = await transaction.coupon.findUnique({ where: { code: input.code.trim().toUpperCase() } });
      if (!coupon || coupon.status !== CouponStatus.ACTIVE || coupon.startsAt > now || (coupon.endsAt && coupon.endsAt <= now)) {
        throw new CouponError('Cupom fora da vigência.');
      }
      if (coupon.minimumSubtotalCents && input.subtotalCents < coupon.minimumSubtotalCents) {
        throw new CouponError('Subtotal mínimo não atingido.');
      }
      if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
        throw new CouponError('Limite de uso atingido.');
      }
      if (coupon.perCustomerLimit !== null && input.userId) {
        const customerUses = await transaction.couponRedemption.count({ where: { couponId: coupon.id, userId: input.userId } });
        if (customerUses >= coupon.perCustomerLimit) throw new CouponError('Limite por cliente atingido.');
      }
      if (input.orderId) {
        const existing = await transaction.couponRedemption.findUnique({ where: { orderId: input.orderId } });
        if (existing) return { couponId: existing.couponId, redemptionId: existing.id };
      }

      const update = await transaction.coupon.updateMany({
        where: { id: coupon.id, ...(coupon.usageLimit !== null ? { usageCount: { lt: coupon.usageLimit } } : {}) },
        data: { usageCount: { increment: 1 } },
      });
      if (update.count !== 1) throw new CouponError('Limite de uso atingido.');

      const redemption = await transaction.couponRedemption.create({
        data: { couponId: coupon.id, userId: input.userId, orderId: input.orderId },
      });
      const result = { couponId: coupon.id, redemptionId: redemption.id };
      if (input.idempotencyKey) {
        await transaction.idempotencyKey.create({
          data: {
            key: input.idempotencyKey,
            scope: `coupon:${coupon.id}`,
            responseJson: result,
            expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          },
        });
      }
      return result;
    });
  }
}
