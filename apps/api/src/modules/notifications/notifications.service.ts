import { EmailDeliveryStatus, EmailEventKey, JobType, Prisma } from '@prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { EmailMessage, EmailSender } from './email-sender';
import { EmailRenderer, EmailTemplateVariables } from './email-renderer';

export type NotificationPayload = EmailTemplateVariables & {
  recipient?: string;
  locale?: string;
  entityId?: string;
  orderId?: string;
  paymentId?: string;
  userId?: string;
};

type DeliveryJobPayload = { deliveryId?: unknown };

function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function safeError(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  return /^[A-Z0-9_]+$/.test(message) ? message : 'EMAIL_DELIVERY_FAILED';
}

function deliveryDedupeKey(eventKey: EmailEventKey, payload: NotificationPayload, recipient: string): string {
  const reference = payload.entityId ?? payload.orderId ?? payload.paymentId ?? payload.userId ?? 'general';
  const status = payload.status ? String(payload.status) : '';
  return createHash('sha256').update([eventKey, reference, status, recipient.toLowerCase()].join('|')).digest('hex');
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly renderer: EmailRenderer,
    private readonly sender: EmailSender,
  ) {}

  async enqueue(eventKey: EmailEventKey, payload: NotificationPayload, transaction?: Prisma.TransactionClient) {
    if (transaction) return this.enqueueWithDatabase(transaction, eventKey, payload);
    return this.prisma.$transaction((database) => this.enqueueWithDatabase(database, eventKey, payload));
  }

  private async enqueueWithDatabase(database: Prisma.TransactionClient, eventKey: EmailEventKey, payload: NotificationPayload) {
    const preference = await database.notificationPreference.findUnique({ where: { eventKey } });
    if (preference?.enabled === false) return null;
    const recipient = preference?.recipientOverride?.trim() || payload.recipient?.trim();
    if (!recipient) return null;
    const locale = payload.locale?.trim() || 'pt-BR';
    const dedupeKey = deliveryDedupeKey(eventKey, payload, recipient);
    const existing = await database.emailDelivery.findUnique({ where: { dedupeKey }, select: { id: true } });
    if (existing) return existing;

    try {
      const delivery = await database.emailDelivery.create({
        data: {
          dedupeKey,
          eventKey,
          locale,
          recipient,
          payloadJson: asJson(payload),
        },
        select: { id: true },
      });
      await database.scheduledJob.create({
        data: { type: JobType.SEND_TRANSACTIONAL_EMAIL, payloadJson: asJson({ deliveryId: delivery.id }) },
      });
      return delivery;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return database.emailDelivery.findUnique({ where: { dedupeKey }, select: { id: true } });
      }
      throw error;
    }
  }

  async processJob(payload: unknown): Promise<void> {
    const deliveryId = (payload as DeliveryJobPayload | null)?.deliveryId;
    if (typeof deliveryId !== 'string' || !deliveryId) throw new BadRequestException('EMAIL_DELIVERY_ID_REQUIRED');
    const delivery = await this.prisma.emailDelivery.findUnique({ where: { id: deliveryId } });
    if (!delivery) throw new BadRequestException('EMAIL_DELIVERY_NOT_FOUND');
    if (delivery.status === EmailDeliveryStatus.SENT || delivery.status === EmailDeliveryStatus.PROCESSING || delivery.status === EmailDeliveryStatus.FAILED) return;

    const attempt = delivery.attempts + 1;
    const claim = await this.prisma.emailDelivery.updateMany({
      where: { id: delivery.id, status: { in: [EmailDeliveryStatus.PENDING, EmailDeliveryStatus.RETRY] } },
      data: { status: EmailDeliveryStatus.PROCESSING, attempts: { increment: 1 } },
    });
    if (claim.count !== 1) return;
    try {
      const template = await this.prisma.emailTemplate.findUnique({ where: { key_locale: { key: delivery.eventKey, locale: delivery.locale } } });
      if (!template) throw new Error('EMAIL_TEMPLATE_NOT_FOUND');
      if (!template.enabled) throw new Error('EMAIL_TEMPLATE_DISABLED');
      const rendered = this.renderer.render({ subject: template.subject, html: template.htmlBody, text: template.textBody }, delivery.payloadJson as EmailTemplateVariables);
      await this.sender.send({ to: delivery.recipient, ...rendered });
      await this.prisma.emailDelivery.update({ where: { id: delivery.id }, data: { status: EmailDeliveryStatus.SENT, sentAt: new Date(), nextAttemptAt: null, lastError: null } });
    } catch (error) {
      const retryable = attempt < delivery.maxAttempts;
      await this.prisma.emailDelivery.update({
        where: { id: delivery.id },
        data: {
          status: retryable ? EmailDeliveryStatus.RETRY : EmailDeliveryStatus.FAILED,
          nextAttemptAt: retryable ? new Date(Date.now() + attempt * 60_000) : null,
          lastError: safeError(error),
        },
      });
      throw error;
    }
  }

  async sendTestEmail(recipient: string): Promise<void> {
    const normalizedRecipient = recipient.trim();
    if (!normalizedRecipient) throw new BadRequestException('TEST_RECIPIENT_REQUIRED');
    const message: EmailMessage = {
      to: normalizedRecipient,
      subject: 'Teste de SMTP — Comercial do Norte',
      html: '<p>O SMTP da Comercial do Norte foi configurado com sucesso.</p>',
      text: 'O SMTP da Comercial do Norte foi configurado com sucesso.',
    };
    await this.sender.send(message);
  }

  async sendTemplateTest(eventKey: EmailEventKey, locale: string, recipient: string, variables: NotificationPayload = {}): Promise<void> {
    const template = await this.prisma.emailTemplate.findUnique({ where: { key_locale: { key: eventKey, locale } } });
    if (!template) throw new BadRequestException('EMAIL_TEMPLATE_NOT_FOUND');
    const rendered = this.renderer.render({ subject: template.subject, html: template.htmlBody, text: template.textBody }, variables);
    await this.sender.send({ to: recipient.trim(), ...rendered });
  }
}
