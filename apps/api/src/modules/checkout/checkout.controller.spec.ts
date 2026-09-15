import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';

describe('CheckoutController', () => {
  it('resolves CheckoutService through its explicit Nest token', async () => {
    const checkoutService = { get: vi.fn().mockResolvedValue({ publicId: 'order-1' }) };
    const module = await Test.createTestingModule({
      controllers: [CheckoutController],
      providers: [{ provide: CheckoutService, useValue: checkoutService }],
    }).compile();

    const controller = module.get(CheckoutController);
    await controller.get('order-1');

    expect(checkoutService.get).toHaveBeenCalledWith('order-1');
  });
});
