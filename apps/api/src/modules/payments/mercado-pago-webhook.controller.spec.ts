import { createHmac } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { MercadoPagoWebhookController } from './mercado-pago-webhook.controller';

describe('MercadoPagoWebhookController', () => {
  it('validates the Mercado Pago signature and forwards the external payment event', async () => {
    const secret = 'webhook-secret';
    const payload = { id: 9001, action: 'payment.updated', type: 'payment', data: { id: 'PAY-42' } };
    const requestId = 'request-1';
    const timestamp = '1704908010';
    const manifest = `id:pay-42;request-id:${requestId};ts:${timestamp};`;
    const signature = `ts=${timestamp},v1=${createHmac('sha256', secret).update(manifest).digest('hex')}`;
    const paymentsService = { processExternalWebhook: vi.fn().mockResolvedValue({ duplicate: false }) };
    const settings = { getWebhookSecret: vi.fn().mockResolvedValue(secret) };
    const controller = new MercadoPagoWebhookController(paymentsService as never, settings as never);

    await expect(controller.receive(undefined, signature, requestId, payload)).resolves.toEqual({ received: true, duplicate: false });
    expect(paymentsService.processExternalWebhook).toHaveBeenCalledWith(expect.objectContaining({ eventId: '9001', externalId: 'PAY-42' }));
  });

  it('rejects an invalid signature before processing the event', async () => {
    const paymentsService = { processExternalWebhook: vi.fn() };
    const settings = { getWebhookSecret: vi.fn().mockResolvedValue('webhook-secret') };
    const controller = new MercadoPagoWebhookController(paymentsService as never, settings as never);

    await expect(controller.receive('PAY-42', 'invalid', 'request-1', { id: 9001, data: { id: 'PAY-42' } })).rejects.toThrow('INVALID_WEBHOOK');
    expect(paymentsService.processExternalWebhook).not.toHaveBeenCalled();
  });
});
