import { PaymentEnvironment } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { PaymentSettingsService } from './payment-settings.service';

describe('PaymentSettingsService', () => {
  it('tests a submitted token without returning it', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ nickname: 'Loja JE' }), { status: 200 }));
    const service = new PaymentSettingsService({ getRuntimePaymentConfig: vi.fn().mockResolvedValue(null) } as never, fetcher);

    const result = await service.testConnection({ accessToken: 'TEST-token', environment: PaymentEnvironment.TEST });

    expect(result).toEqual({ ok: true, environment: PaymentEnvironment.TEST, accountLabel: 'Loja JE' });
    expect(JSON.stringify(result)).not.toContain('TEST-token');
    expect(fetcher).toHaveBeenCalledWith('https://api.mercadopago.com/users/me', expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer TEST-token' }) }));
  });

  it('returns a safe failure when there is no configured token', async () => {
    const fetcher = vi.fn();
    const service = new PaymentSettingsService({ getRuntimePaymentConfig: vi.fn().mockResolvedValue(null) } as never, fetcher);

    await expect(service.testConnection()).resolves.toEqual({ ok: false, environment: PaymentEnvironment.TEST });
    expect(fetcher).not.toHaveBeenCalled();
  });
});
