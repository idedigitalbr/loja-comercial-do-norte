import { BadRequestException, Body, Controller, Headers, Inject, Param, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PaymentSettingsService } from '../settings/payment-settings.service';
import { PaymentsService } from './payments.service';
import { FeatureGuard, RequireFeature } from '../../common/features/feature-flags';

type LegacyWebhookPayload = {
  eventId?: string;
  status?: 'approved' | 'pending' | 'rejected';
};

type MercadoPagoWebhookPayload = {
  id?: string | number;
  action?: string;
  type?: string;
  data?: { id?: string | number };
  [key: string]: unknown;
};

function safeEqual(left: string, right: string): boolean {
  if (!left || !right || left.length !== right.length) return false;
  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

function signatureParts(signature: string): { timestamp?: string; hash?: string } {
  return signature.split(',').reduce<{ timestamp?: string; hash?: string }>((result, part) => {
    const [key, value] = part.split('=', 2).map((item) => item.trim());
    if (key === 'ts') result.timestamp = value;
    if (key === 'v1') result.hash = value;
    return result;
  }, {});
}

@UseGuards(FeatureGuard)
@RequireFeature('PAYMENTS')
@Controller('webhooks/mercado-pago')
export class MercadoPagoWebhookController {
  constructor(
    @Inject(PaymentsService) private readonly paymentsService: PaymentsService,
    @Inject(PaymentSettingsService) private readonly paymentSettingsService: PaymentSettingsService,
  ) {}

  @Post()
  async receive(
    @Query('data.id') queryDataId: string | undefined,
    @Headers('x-signature') signature: string,
    @Headers('x-request-id') requestId: string,
    @Body() payload: MercadoPagoWebhookPayload,
  ) {
    const externalId = String(payload.data?.id ?? queryDataId ?? '');
    const eventId = String(payload.id ?? '');
    if (!externalId || !eventId) throw new BadRequestException('INVALID_WEBHOOK_PAYLOAD');
    await this.assertSignature(signature, requestId, externalId, payload);
    return {
      received: true,
      ...(await this.paymentsService.processExternalWebhook({ eventId, externalId, payload: payload as Prisma.InputJsonValue })),
    };
  }

  @Post(':paymentId')
  async receiveLegacy(
    @Param('paymentId') paymentId: string,
    @Headers('x-signature') signature: string,
    @Headers('x-request-id') requestId: string,
    @Body() payload: LegacyWebhookPayload,
  ) {
    if (!payload.eventId || !payload.status) throw new BadRequestException('INVALID_WEBHOOK_PAYLOAD');
    await this.assertSignature(signature, requestId, paymentId, payload);
    return {
      received: true,
      ...(await this.paymentsService.processWebhook({ eventId: payload.eventId, paymentId, status: payload.status, payload: payload as Prisma.InputJsonValue })),
    };
  }

  private async assertSignature(signature: string, requestId: string | undefined, dataId: string, payload: object): Promise<void> {
    if (!signature) throw new UnauthorizedException('INVALID_WEBHOOK');
    const configuredSecret = await this.paymentSettingsService.getWebhookSecret();
    const secret = configuredSecret ?? process.env.MP_WEBHOOK_SECRET ?? (process.env.NODE_ENV === 'production' ? null : 'development-webhook-secret');
    if (!secret) throw new UnauthorizedException('INVALID_WEBHOOK');

    const parts = signatureParts(signature);
    if (parts.timestamp && parts.hash && requestId) {
      const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.timestamp};`;
      const expected = createHmac('sha256', secret).update(manifest).digest('hex');
      if (safeEqual(expected, parts.hash)) return;
    }

    const legacyExpected = createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    if (!safeEqual(legacyExpected, signature)) throw new UnauthorizedException('INVALID_WEBHOOK');
  }
}
