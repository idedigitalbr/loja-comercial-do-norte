import { describe, expect, it } from 'vitest';
import { MelhorEnvioProvider } from './providers/melhor-envio.provider';
import { PickupProvider } from './providers/pickup.provider';
import { ShippingService } from './shipping.service';

describe('ShippingService', () => {
  it('normalizes pickup and carrier quotes into the same contract', async () => {
    const service = new ShippingService([
      new PickupProvider(),
      new MelhorEnvioProvider(async () => ({ price: 2590, delivery_time: 5 })),
    ]);
    const options = await service.quote({ postalCode: '01310-100', totalCents: 10_000 });
    expect(options).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'PICKUP_SALON', priceCents: 0 }),
      expect.objectContaining({ provider: 'MELHOR_ENVIO', deliveryDays: 5 }),
    ]));
  });
});
