import { OrderStatus, PaymentMethod, PaymentStatus, RefundStatus } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../database/prisma.service';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  const prisma = new PrismaService();
  const service = new ReportsService(prisma);
  let orderId: string;
  let paymentId: string;
  const from = new Date(Date.now() - 60_000);
  const to = new Date(Date.now() + 60_000);

  beforeAll(async () => {
    await prisma.$connect();
    const order = await prisma.order.create({ data: { status: OrderStatus.PAID, subtotalCents: 30_000, totalCents: 30_000, contactEmail: 'relatorio@teste.local' } });
    orderId = order.id;
    const payment = await prisma.payment.create({ data: { orderId, method: PaymentMethod.PIX, provider: 'TEST', status: PaymentStatus.APPROVED, amountCents: 30_000 } });
    paymentId = payment.id;
    await prisma.refund.create({ data: { paymentId, amountCents: 5_000, reason: 'Teste', status: RefundStatus.APPROVED } });
  });

  afterAll(async () => {
    await prisma.refund.deleteMany({ where: { paymentId } });
    await prisma.payment.delete({ where: { id: paymentId } });
    await prisma.order.delete({ where: { id: orderId } });
    await prisma.$disconnect();
  });

  it('matches paid orders minus refunds for the selected period', async () => {
    const report = await service.salesSummary({ from, to });
    expect(report.grossCents).toBeGreaterThanOrEqual(30_000);
    expect(report.refundedCents).toBeGreaterThanOrEqual(5_000);
    expect(report.netCents).toBeGreaterThanOrEqual(25_000);
  });
});
