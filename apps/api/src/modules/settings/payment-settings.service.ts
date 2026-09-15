import { PaymentEnvironment } from '@prisma/client';
import { Inject, Injectable } from '@nestjs/common';
import { RuntimePaymentConfig } from './settings.types';
import { SettingsService } from './settings.service';

export const MERCADO_PAGO_FETCH = 'MERCADO_PAGO_FETCH';
export const MERCADO_PAGO_API_URL = 'https://api.mercadopago.com';

export type MercadoPagoResponse = {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
};

export type MercadoPagoFetcher = (
  url: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
  },
) => Promise<MercadoPagoResponse>;

export type PaymentConnectionTestInput = {
  accessToken?: string;
  environment?: PaymentEnvironment;
};

export type PaymentConnectionTestResult = {
  ok: boolean;
  environment: PaymentEnvironment;
  accountLabel?: string;
};

@Injectable()
export class PaymentSettingsService {
  constructor(
    @Inject(SettingsService) private readonly settingsService: SettingsService,
    @Inject(MERCADO_PAGO_FETCH) private readonly fetcher: MercadoPagoFetcher,
  ) {}

  getRuntimeConfig(): Promise<RuntimePaymentConfig | null> {
    return this.settingsService.getRuntimePaymentConfig();
  }

  getWebhookSecret(): Promise<string | null> {
    return this.settingsService.getRuntimeWebhookSecret();
  }

  async testConnection(input: PaymentConnectionTestInput = {}): Promise<PaymentConnectionTestResult> {
    const configured = await this.getRuntimeConfig();
    const accessToken = input.accessToken?.trim() || configured?.accessToken;
    const environment = input.environment ?? configured?.environment ?? PaymentEnvironment.TEST;
    if (!accessToken) return { ok: false, environment };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8_000);
    try {
      const response = await this.fetcher(`${MERCADO_PAGO_API_URL}/users/me`, {
        method: 'GET',
        headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
        signal: controller.signal,
      });
      if (!response.ok) return { ok: false, environment };
      const payload = await response.json() as { nickname?: unknown; email?: unknown };
      const accountLabel = typeof payload.nickname === 'string'
        ? payload.nickname
        : typeof payload.email === 'string' ? payload.email : undefined;
      return { ok: true, environment, ...(accountLabel ? { accountLabel } : {}) };
    } catch {
      return { ok: false, environment };
    } finally {
      clearTimeout(timer);
    }
  }
}
