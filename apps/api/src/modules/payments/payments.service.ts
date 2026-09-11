import { PaymentMethod, PaymentStatus, Prisma, RefundStatus } from '@prisma/client';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentProvider, ProviderPayment } from './payment-provider';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService, private readonly provider: PaymentProvider) {}

  async payCard(input: { orderId: string; amountCents: number; cardToken: string; installments: number }, idempotencyKey: string) {
    return this.pay(input.orderId, input.amountCents, PaymentMethod.CARD, idempotencyKey, () => this.provider.createCardPayment(input));
  }

  async payPix(input: { orderId: string; amountCents: number }, idempotencyKey: string) {
    return this.pay(input.orderId, input.amountCents, PaymentMethod.PIX, idempotencyKey, () => this.provider.createPixPayment(input));
  }

  async processWebhook(input: { eventId: string; paymentId: string; status: ProviderPayment['status']; payload: Prisma.InputJsonValue }) {
    return this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.paymentEvent.findUnique({ where: { eventId: input.eventId } });
      if (existing) return { duplicate: true };
      await transaction.paymentEvent.create({ data: { eventId: input.eventId, paymentId: input.paymentId, provider: 'MERCADO_PAGO', payloadJson: input.payload, processedAt: new Date() } });
      await transaction.payment.update({ where: { id: input.paymentId }, data: { status: this.mapStatus(input.status), providerStatus: input.status } });
      return { duplicate: false };
    });
  }

  async refund(input: { paymentId: string; amountCents: number; reason: string }, idempotencyKey: string) {
    if (!idempotencyKey || !input.reason.trim()) throw new BadRequestException('REFUND_DATA_REQUIRED');
    const existingKey = await this.prisma.idempotencyKey.findUnique({ where: { key: idempotencyKey } });
    if (existingKey?.responseJson && typeof existingKey.responseJson === 'object' && 'refundId' in existingKey.responseJson) {
      return this.prisma.refund.findUniqueOrThrow({ where: { id: String(existingKey.responseJson.refundId) } });
    }
    const payment = await this.prisma.payment.findUnique({ where: { id: input.paymentId } });
    if (!payment || !payment.externalId || payment.status !== PaymentStatus.APPROVED || input.amountCents < 1 || input.amountCents > payment.amountCents) {
      throw new BadRequestException('REFUND_NOT_ALLOWED');
    }
    if (!this.provider.refundPayment) throw new BadRequestException('REFUND_PROVIDER_NOT_CONFIGURED');
    const providerRefund = await this.provider.refundPayment({ externalId: payment.externalId, amountCents: input.amountCents });
    return this.prisma.$transaction(async (transaction) => {
      const refund = await transaction.refund.create({ data: { paymentId: payment.id, amountCents: input.amountCents, reason: input.reason, status: RefundStatus.APPROVED, externalId: providerRefund.externalId } });
      await transaction.idempotencyKey.create({ data: { key: idempotencyKey, scope: `refund:${payment.id}`, responseJson: { refundId: refund.id }, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
      return refund;
    });
  }

  private async pay(orderId: string, amountCents: number, method: PaymentMethod, idempotencyKey: string, createProviderPayment: () => Promise<ProviderPayment>) {
    if (!idempotencyKey) throw new BadRequestException('IDEMPOTENCY_KEY_REQUIRED');
    const scope = `payment:${orderId}`;
    const existingKey = await this.prisma.idempotencyKey.findUnique({ where: { key: idempotencyKey } });
    if (existingKey?.responseJson && typeof existingKey.responseJson === 'object' && 'paymentId' in existingKey.responseJson) {
      return this.prisma.payment.findUniqueOrThrow({ where: { id: String(existingKey.responseJson.paymentId) } });
    }
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('ORDER_NOT_FOUND');
    const providerPayment = await createProviderPayment();
    return this.prisma.$transaction(async (transaction) => {
      const payment = await transaction.payment.create({
        data: {
          orderId,
          method,
          status: this.mapStatus(providerPayment.status),
          provider: 'MERCADO_PAGO',
          providerStatus: providerPayment.status,
          externalId: providerPayment.externalId,
          amountCents,
          pixQrCode: providerPayment.qrCode,
          pixQrCodeBase64: providerPayment.qrCodeBase64,
          pixCopyPaste: providerPayment.copyPaste,
          expiresAt: providerPayment.expiresAt,
        },
      });
      await transaction.paymentAttempt.create({
        data: { paymentId: payment.id, idempotencyKey, externalId: providerPayment.externalId, status: providerPayment.status, responseJson: providerPayment },
      });
      if (existingKey) {
        await transaction.idempotencyKey.update({ where: { key: idempotencyKey }, data: { scope, responseJson: { paymentId: payment.id }, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
      } else {
        await transaction.idempotencyKey.create({ data: { key: idempotencyKey, scope, responseJson: { paymentId: payment.id }, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
      }
      return payment;
    });
  }

  private mapStatus(status: ProviderPayment['status']): PaymentStatus {
    return status === 'approved' ? PaymentStatus.APPROVED : status === 'rejected' ? PaymentStatus.REJECTED : PaymentStatus.PENDING;
  }
}
