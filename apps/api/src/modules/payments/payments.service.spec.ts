import { OrderStatus, PaymentStatus } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  it('cancels a pending order and releases its coupon when the provider rejects payment', async () => {
    const transaction = {
      paymentEvent: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
      },
      payment: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'payment-1', publicId: 'pay-1', amountCents: 10_000,
          order: { id: 'order-1', publicId: 'order-1', status: OrderStatus.AWAITING_PAYMENT, contactEmail: 'cliente@teste.com' },
        }),
        update: vi.fn(),
      },
      order: { update: vi.fn() },
      orderStatusHistory: { create: vi.fn() },
    };
    const prisma = { $transaction: vi.fn((callback: (value: typeof transaction) => unknown) => callback(transaction)) };
    const couponService = { releaseInTransaction: vi.fn().mockResolvedValue(true) };
    const service = new PaymentsService(prisma as never, {} as never, undefined, couponService as never);

    await service.processWebhook({ eventId: 'event-1', paymentId: 'payment-1', status: 'rejected', payload: { status: 'rejected' } as never });

    expect(transaction.payment.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: PaymentStatus.REJECTED, providerStatus: 'rejected' } }));
    expect(transaction.order.update).toHaveBeenCalledWith({ where: { id: 'order-1' }, data: { status: OrderStatus.CANCELLED } });
    expect(couponService.releaseInTransaction).toHaveBeenCalledWith(transaction, 'order-1');
    expect(transaction.orderStatusHistory.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ toStatus: OrderStatus.CANCELLED, actorType: 'PROVIDER' }) }));
  });
});
