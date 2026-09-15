import { Inject, Injectable } from '@nestjs/common';
import { CouponStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

export type CreateCouponInput = {
  code: string;
  startsAt?: Date;
  endsAt?: Date;
  usageLimit?: number;
  perCustomerLimit?: number;
  minimumSubtotalCents?: number;
};

@Injectable()
export class PromotionsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  listCoupons() {
    return this.prisma.coupon.findMany({ orderBy: { startsAt: 'desc' }, include: { promotion: true }, take: 100 });
  }

  createCoupon(input: CreateCouponInput) {
    return this.prisma.coupon.create({
      data: {
        code: input.code.trim().toUpperCase(),
        status: CouponStatus.ACTIVE,
        startsAt: input.startsAt ?? new Date(),
        endsAt: input.endsAt,
        usageLimit: input.usageLimit,
        perCustomerLimit: input.perCustomerLimit,
        minimumSubtotalCents: input.minimumSubtotalCents,
      },
    });
  }

  updateCoupon(id: string, input: Partial<CreateCouponInput> & { status?: CouponStatus }) {
    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...(input.code !== undefined ? { code: input.code.trim().toUpperCase() } : {}),
        ...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
        ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
        ...(input.usageLimit !== undefined ? { usageLimit: input.usageLimit } : {}),
        ...(input.perCustomerLimit !== undefined ? { perCustomerLimit: input.perCustomerLimit } : {}),
        ...(input.minimumSubtotalCents !== undefined ? { minimumSubtotalCents: input.minimumSubtotalCents } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });
  }
}
