import { EmailEventKey, EmailDeliveryStatus, JobType } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { EmailRenderer } from './email-renderer';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  it('enqueues one delivery for the same event and recipient', async () => {
    const prisma = {
      notificationPreference: { findUnique: vi.fn().mockResolvedValue(null) },
      emailDelivery: {
        findUnique: vi.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ id: 'delivery-1' }),
        create: vi.fn().mockResolvedValue({ id: 'delivery-1' }),
      },
      scheduledJob: { create: vi.fn() },
      $transaction: vi.fn(),
    };
    prisma.$transaction.mockImplementation(async (callback: (database: typeof prisma) => unknown) => callback(prisma));
    const service = new NotificationsService(prisma as never, new EmailRenderer(), { send: vi.fn() } as never);

    await service.enqueue(EmailEventKey.ORDER_CREATED, { orderId: 'order-1', recipient: 'ana@example.com' });
    await service.enqueue(EmailEventKey.ORDER_CREATED, { orderId: 'order-1', recipient: 'ana@example.com' });

    expect(prisma.emailDelivery.create).toHaveBeenCalledTimes(1);
    expect(prisma.scheduledJob.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ type: JobType.SEND_TRANSACTIONAL_EMAIL, payloadJson: { deliveryId: 'delivery-1' } }) }));
  });

  it('marks a delivery retryable when SMTP fails before max attempts', async () => {
    const prisma = {
      emailDelivery: {
        findUnique: vi.fn().mockResolvedValue({ id: 'delivery-1', eventKey: EmailEventKey.ORDER_CREATED, locale: 'pt-BR', recipient: 'ana@example.com', payloadJson: { orderId: 'JE-1', customerName: 'Ana' }, status: EmailDeliveryStatus.PENDING, attempts: 0, maxAttempts: 5 }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        update: vi.fn().mockResolvedValue({}),
      },
      emailTemplate: { findUnique: vi.fn().mockResolvedValue({ subject: 'Pedido {{orderId}}', htmlBody: '<p>{{customerName}}</p>', textBody: 'Pedido {{orderId}}', enabled: true }) },
    };
    const sender = { send: vi.fn().mockRejectedValue(new Error('SMTP_SEND_FAILED')) };
    const service = new NotificationsService(prisma as never, new EmailRenderer(), sender as never);

    await expect(service.processJob({ deliveryId: 'delivery-1' })).rejects.toThrow('SMTP_SEND_FAILED');
    expect(prisma.emailDelivery.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: EmailDeliveryStatus.RETRY }) }));
  });

  it('claims a pending delivery atomically so a concurrent worker does not send it twice', async () => {
    const prisma = {
      emailDelivery: {
        findUnique: vi.fn().mockResolvedValue({ id: 'delivery-1', status: EmailDeliveryStatus.PENDING, attempts: 0, maxAttempts: 5 }),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const sender = { send: vi.fn() };
    const service = new NotificationsService(prisma as never, new EmailRenderer(), sender as never);

    await service.processJob({ deliveryId: 'delivery-1' });

    expect(sender.send).not.toHaveBeenCalled();
  });
});
