import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';

describe('ShippingController', () => {
  it('resolves ShippingService through its explicit Nest token', async () => {
    const shippingService = { quote: vi.fn().mockResolvedValue([]) };
    const module = await Test.createTestingModule({
      controllers: [ShippingController],
      providers: [{ provide: ShippingService, useValue: shippingService }],
    }).compile();

    const controller = module.get(ShippingController);
    await controller.quote({ postalCode: '68900050', totalCents: 9900 });

    expect(shippingService.quote).toHaveBeenCalledWith({ postalCode: '68900050', totalCents: 9900 });
  });
});
