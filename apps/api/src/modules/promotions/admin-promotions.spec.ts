import { describe, expect, it, vi } from 'vitest';
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
});
