import { PaymentEnvironment } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { MercadoPagoProvider } from './mercado-pago.provider';

describe('MercadoPagoProvider', () => {
  const settings = {
    getRuntimeConfig: vi.fn().mockResolvedValue({
      environment: PaymentEnvironment.TEST,
      accessToken: 'TEST-token',
      publicKey: 'TEST-public-key',
      webhookSecret: null,
      enabled: true,
      enablePix: true,
      enableCard: true,
    }),
  };

  it('creates a Pix payment with the configured access token and maps QR data', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: 42,
      status: 'pending',
      point_of_interaction: { transaction_data: { qr_code: 'pix-code', qr_code_base64: 'base64' } },
    }), { status: 201 }));
    const provider = new MercadoPagoProvider(settings as never, fetcher);

    const result = await provider.createPixPayment({ amountCents: 8300, payerEmail: 'cliente@example.com', idempotencyKey: 'pix-1' });

    expect(fetcher).toHaveBeenCalledWith('https://api.mercadopago.com/v1/payments', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer TEST-token', 'X-Idempotency-Key': 'pix-1' }),
    }));
    expect(result).toEqual(expect.objectContaining({ externalId: '42', status: 'pending', qrCode: 'pix-code', qrCodeBase64: 'base64' }));
  });

  it('maps provider errors to MERCADO_PAGO_REQUEST_FAILED', async () => {
    const provider = new MercadoPagoProvider(settings as never, vi.fn().mockResolvedValue(new Response('{}', { status: 500 })));

    await expect(provider.createPixPayment({ amountCents: 8300, payerEmail: 'cliente@example.com' })).rejects.toThrow('MERCADO_PAGO_REQUEST_FAILED');
  });

  it('creates a tokenized card payment with payer data', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'card-1', status: 'approved' }), { status: 201 }));
    const provider = new MercadoPagoProvider(settings as never, fetcher);

    const result = await provider.createCardPayment({ amountCents: 12990, cardToken: 'card-token', installments: 2, paymentMethodId: 'visa', payerEmail: 'cliente@example.com', idempotencyKey: 'card-1' });
    const request = fetcher.mock.calls[0][1] as RequestInit;

    expect(JSON.parse(String(request.body))).toEqual(expect.objectContaining({ token: 'card-token', payment_method_id: 'visa', installments: 2, payer: { email: 'cliente@example.com' } }));
    expect(result).toEqual(expect.objectContaining({ externalId: 'card-1', status: 'approved' }));
  });
});
