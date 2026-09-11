import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PaymentProvider } from './payment-provider';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../database/prisma.service';

describe('PaymentsService idempotency', () => {
  const prisma = new PrismaService();
  let service: PaymentsService;
  let orderId: string;
  let calls = 0;
  const provider: PaymentProvider = {
    async createCardPayment() {
      calls += 1;
      return { externalId: 'mp-123', status: 'approved' };
    },
    async createPixPayment() {
      return { externalId: 'mp-pix-123', status: 'pending', qrCode: 'qr', qrCodeBase64: 'base64', copyPaste: 'copy' };
    },
  };

  beforeAll(async () => {
    await prisma.$connect();
    const order = await prisma.order.create({ data: { subtotalCents: 10_000, totalCents: 10_000, contactEmail: 'pagamento@teste.local' } });
    orderId = order.id;
    service = new PaymentsService(prisma, provider);
  });

  afterAll(async () => {
    await prisma.paymentAttempt.deleteMany({ where: { payment: { orderId } } });
    await prisma.payment.deleteMany({ where: { orderId } });
    await prisma.idempotencyKey.deleteMany({ where: { scope: `payment:${orderId}` } });
    await prisma.order.delete({ where: { id: orderId } });
    await prisma.$disconnect();
  });

  it('creates only one provider payment for repeated requests', async () => {
    const input = { orderId, amountCents: 10_000, cardToken: 'tok_test', installments: 1 };
    const first = await service.payCard(input, 'idem-order-123');
    const second = await service.payCard(input, 'idem-order-123');
    expect(calls).toBe(1);
    expect(second.id).toBe(first.id);
  });
});
