import { BadGatewayException, BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { MERCADO_PAGO_API_URL, MERCADO_PAGO_FETCH, MercadoPagoFetcher, PaymentSettingsService } from '../settings/payment-settings.service';
import { CardPaymentInput, PaymentProvider, PixPaymentInput, ProviderPayment } from './payment-provider';

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject {
  return typeof value === 'object' && value !== null ? value as JsonObject : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined;
}

function mapStatus(value: unknown): ProviderPayment['status'] {
  if (value === 'approved') return 'approved';
  if (value === 'rejected' || value === 'cancelled' || value === 'refunded') return 'rejected';
  return 'pending';
}

function parseDate(value: unknown): Date | undefined {
  if (typeof value !== 'string') return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

@Injectable()
export class MercadoPagoProvider implements PaymentProvider {
  constructor(
    @Inject(PaymentSettingsService) private readonly settings: PaymentSettingsService,
    @Inject(MERCADO_PAGO_FETCH) private readonly fetcher: MercadoPagoFetcher,
  ) {}

  async createCardPayment(input: CardPaymentInput): Promise<ProviderPayment> {
    if (!input.cardToken || !input.paymentMethodId || !input.payerEmail) throw new BadRequestException('MERCADO_PAGO_CARD_DATA_REQUIRED');
    const config = await this.getConfig('card');
    const payload = await this.request('/v1/payments', {
      token: input.cardToken,
      transaction_amount: this.amount(input.amountCents),
      installments: input.installments,
      payment_method_id: input.paymentMethodId,
      payer: { email: input.payerEmail },
      ...(input.externalReference ? { external_reference: input.externalReference } : {}),
    }, config.accessToken, input.idempotencyKey);
    return this.mapPayment(payload);
  }

  async createPixPayment(input: PixPaymentInput): Promise<ProviderPayment> {
    if (!input.payerEmail) throw new BadRequestException('MERCADO_PAGO_PAYER_EMAIL_REQUIRED');
    const config = await this.getConfig('pix');
    const payload = await this.request('/v1/payments', {
      transaction_amount: this.amount(input.amountCents),
      description: input.externalReference ? `Pedido ${input.externalReference}` : 'Pedido da loja',
      payment_method_id: 'pix',
      payer: { email: input.payerEmail },
      ...(input.externalReference ? { external_reference: input.externalReference } : {}),
    }, config.accessToken, input.idempotencyKey);
    return this.mapPayment(payload);
  }

  async refundPayment(input: { externalId: string; amountCents: number; idempotencyKey?: string }): Promise<{ externalId: string; status: string }> {
    const config = await this.getConfig('refund');
    const payload = await this.request(`/v1/payments/${encodeURIComponent(input.externalId)}/refunds`, {
      amount: this.amount(input.amountCents),
    }, config.accessToken, input.idempotencyKey);
    const object = asObject(payload);
    return {
      externalId: String(object.id ?? input.externalId),
      status: asString(object.status) ?? 'approved',
    };
  }

  async getPayment(externalId: string): Promise<{ status: ProviderPayment['status']; payload: unknown }> {
    const config = await this.getConfig('status');
    const payload = await this.request(`/v1/payments/${encodeURIComponent(externalId)}`, undefined, config.accessToken, undefined, 'GET');
    return { status: mapStatus(payload.status), payload };
  }

  private async getConfig(method: 'card' | 'pix' | 'refund' | 'status') {
    const config = await this.settings.getRuntimeConfig();
    if (!config) throw new BadRequestException('MERCADO_PAGO_NOT_CONFIGURED');
    if (method === 'pix' && !config.enablePix) throw new BadRequestException('MERCADO_PAGO_PIX_DISABLED');
    if (method === 'card' && !config.enableCard) throw new BadRequestException('MERCADO_PAGO_CARD_DISABLED');
    return config;
  }

  private async request(path: string, body: JsonObject | undefined, accessToken: string, idempotencyKey?: string, method: 'GET' | 'POST' = 'POST'): Promise<JsonObject> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await this.fetcher(`${MERCADO_PAGO_API_URL}${path}`, {
        method,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          ...(method === 'POST' ? { 'X-Idempotency-Key': idempotencyKey?.trim() || randomUUID() } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: controller.signal,
      });
      if (!response.ok) throw new BadGatewayException('MERCADO_PAGO_REQUEST_FAILED');
      return asObject(await response.json());
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;
      throw new BadGatewayException('MERCADO_PAGO_REQUEST_FAILED');
    } finally {
      clearTimeout(timer);
    }
  }

  private amount(amountCents: number): number {
    if (!Number.isInteger(amountCents) || amountCents < 1) throw new BadRequestException('MERCADO_PAGO_AMOUNT_INVALID');
    return Number((amountCents / 100).toFixed(2));
  }

  private mapPayment(payload: JsonObject): ProviderPayment {
    const interaction = asObject(payload.point_of_interaction);
    const transactionData = asObject(interaction.transaction_data);
    const externalId = payload.id;
    if (externalId === undefined || externalId === null) throw new BadGatewayException('MERCADO_PAGO_RESPONSE_INVALID');
    return {
      externalId: String(externalId),
      status: mapStatus(payload.status),
      ...(asString(transactionData.qr_code) ? { qrCode: transactionData.qr_code as string } : {}),
      ...(asString(transactionData.qr_code_base64) ? { qrCodeBase64: transactionData.qr_code_base64 as string } : {}),
      ...(asString(transactionData.qr_code) ? { copyPaste: transactionData.qr_code as string } : {}),
      ...(parseDate(payload.date_of_expiration) ? { expiresAt: parseDate(payload.date_of_expiration) } : {}),
    };
  }
}
