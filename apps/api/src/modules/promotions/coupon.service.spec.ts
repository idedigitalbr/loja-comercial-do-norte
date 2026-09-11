import { CouponStatus } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
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
});
