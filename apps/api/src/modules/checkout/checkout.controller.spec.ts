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

  it('propagates the optional authenticated user to coupon quotes', async () => {
    const checkoutService = { quote: vi.fn().mockResolvedValue({ subtotalCents: 100 }) };
    const controller = new CheckoutController(checkoutService as never);

    await controller.quote({ cartId: 'cart-1', couponCode: 'VIP20' }, { user: { id: 'user-1' } } as never);

    expect(checkoutService.quote).toHaveBeenCalledWith({ cartId: 'cart-1', couponCode: 'VIP20', userId: 'user-1' });
  });
});
