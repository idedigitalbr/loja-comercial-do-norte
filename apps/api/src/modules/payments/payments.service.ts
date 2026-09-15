import { EmailEventKey, PaymentMethod, PaymentStatus, Prisma, RefundStatus } from '@prisma/client';
import { BadRequestException, Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { assertIdempotencyScope } from '../../common/idempotency/idempotency';
import { CardPaymentInput, PaymentProvider, PixPaymentInput, ProviderPayment } from './payment-provider';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly provider: PaymentProvider,
    @Optional() @Inject(NotificationsService) private readonly notifications?: NotificationsService,
  ) {}

  async payCard(input: CardPaymentInput & { orderId: string }, idempotencyKey: string) {
    return this.pay(input.orderId, input.amountCents, PaymentMethod.CARD, idempotencyKey, (order) => this.provider.createCardPayment({
      ...input,
      payerEmail: order.contactEmail,
      externalReference: order.publicId,
      idempotencyKey,
    }));
  }

  async payPix(input: PixPaymentInput & { orderId: string }, idempotencyKey: string) {
    return this.pay(input.orderId, input.amountCents, PaymentMethod.PIX, idempotencyKey, (order) => this.provider.createPixPayment({
      ...input,
      payerEmail: order.contactEmail,
      externalReference: order.publicId,
      idempotencyKey,
    }));
  }

  async processWebhook(input: { eventId: string; paymentId: string; status: ProviderPayment['status']; payload: Prisma.InputJsonValue }) {
    return this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.paymentEvent.findUnique({ where: { eventId: input.eventId } });
      if (existing) return { duplicate: true };
      const payment = await transaction.payment.findUnique({ where: { id: input.paymentId }, include: { order: true } });
      if (!payment) throw new NotFoundException('PAYMENT_NOT_FOUND');
      await transaction.paymentEvent.create({ data: { eventId: input.eventId, paymentId: input.paymentId, provider: 'MERCADO_PAGO', payloadJson: input.payload, processedAt: new Date() } });
      await transaction.payment.update({ where: { id: input.paymentId }, data: { status: this.mapStatus(input.status), providerStatus: input.status } });
      await this.enqueuePaymentNotification(transaction, payment.order, payment.id, payment.publicId, payment.amountCents, input.status);
      return { duplicate: false };
    });
  }

  async processExternalWebhook(input: { eventId: string; externalId: string; payload: Prisma.InputJsonValue }) {
    if (!this.provider.getPayment) throw new BadRequestException('PAYMENT_PROVIDER_STATUS_UNAVAILABLE');
    const payment = await this.prisma.payment.findUnique({ where: { externalId: input.externalId }, select: { id: true } });
    if (!payment) return { ignored: true };
    const providerPayment = await this.provider.getPayment(input.externalId);
    return this.processWebhook({ eventId: input.eventId, paymentId: payment.id, status: providerPayment.status, payload: input.payload });
  }

  async refund(input: { paymentId: string; amountCents: number; reason: string }, idempotencyKey: string) {
    if (!idempotencyKey || !input.reason.trim()) throw new BadRequestException('REFUND_DATA_REQUIRED');
    const payment = await this.prisma.payment.findUnique({ where: { id: input.paymentId } });
    if (!payment || !payment.externalId || payment.status !== PaymentStatus.APPROVED || input.amountCents < 1 || input.amountCents > payment.amountCents) {
      throw new BadRequestException('REFUND_NOT_ALLOWED');
    }
    const scope = `refund:${payment.id}:${input.amountCents}`;
    const existingKey = await this.prisma.idempotencyKey.findUnique({ where: { key: idempotencyKey } });
    assertIdempotencyScope(existingKey, scope);
    if (existingKey?.responseJson && typeof existingKey.responseJson === 'object' && 'refundId' in existingKey.responseJson) {
      return this.prisma.refund.findUniqueOrThrow({ where: { id: String(existingKey.responseJson.refundId) } });
    }
    if (!this.provider.refundPayment) throw new BadRequestException('REFUND_PROVIDER_NOT_CONFIGURED');
    const providerRefund = await this.provider.refundPayment({ externalId: payment.externalId, amountCents: input.amountCents, idempotencyKey });
    return this.prisma.$transaction(async (transaction) => {
      const refund = await transaction.refund.create({ data: { paymentId: payment.id, amountCents: input.amountCents, reason: input.reason, status: RefundStatus.APPROVED, externalId: providerRefund.externalId } });
      await transaction.idempotencyKey.create({ data: { key: idempotencyKey, scope, responseJson: { refundId: refund.id }, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
      return refund;
    });
  }

  private async pay(orderId: string, amountCents: number, method: PaymentMethod, idempotencyKey: string, createProviderPayment: (order: { publicId: string; contactEmail: string }) => Promise<ProviderPayment>) {
    if (!idempotencyKey) throw new BadRequestException('IDEMPOTENCY_KEY_REQUIRED');
    const existingKey = await this.prisma.idempotencyKey.findUnique({ where: { key: idempotencyKey } });
    const order = await this.prisma.order.findFirst({ where: { OR: [{ id: orderId }, { publicId: orderId }] } });
    if (!order) throw new NotFoundException('ORDER_NOT_FOUND');
    if (amountCents !== order.totalCents) throw new BadRequestException('PAYMENT_AMOUNT_MISMATCH');
    const scope = `payment:${order.id}:${method}:${amountCents}`;
    assertIdempotencyScope(existingKey, scope);
    if (existingKey?.responseJson && typeof existingKey.responseJson === 'object' && 'paymentId' in existingKey.responseJson) {
      return this.prisma.payment.findUniqueOrThrow({ where: { id: String(existingKey.responseJson.paymentId) } });
    }
    const providerPayment = await createProviderPayment(order);
    return this.prisma.$transaction(async (transaction) => {
      const payment = await transaction.payment.create({
        data: {
          orderId: order.id,
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
      await this.enqueuePaymentNotification(transaction, order, payment.id, payment.publicId, amountCents, providerPayment.status);
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

  private async enqueuePaymentNotification(
    transaction: Prisma.TransactionClient,
    order: { id: string; publicId: string; contactEmail: string },
    paymentId: string,
    paymentPublicId: string,
    amountCents: number,
    status: ProviderPayment['status'],
  ): Promise<void> {
    const eventKey = status === 'approved' ? EmailEventKey.PAYMENT_APPROVED : status === 'rejected' ? EmailEventKey.PAYMENT_REJECTED : EmailEventKey.PAYMENT_PENDING;
    try {
      await this.notifications?.enqueue(eventKey, {
        entityId: paymentId,
        paymentId: paymentPublicId,
        orderId: order.publicId,
        recipient: order.contactEmail,
        customerName: order.contactEmail.split('@')[0],
        paymentStatus: status,
        status,
        totalCents: amountCents,
        total: `R$ ${(amountCents / 100).toFixed(2).replace('.', ',')}`,
        orderUrl: `/pedido/${order.publicId}`,
      }, transaction);
    } catch {
      // Payment persistence and status processing must not depend on notification storage.
    }
  }
}
