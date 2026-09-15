import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { SessionGuard } from '../auth/guards/session.guard';

describe('CartsController', () => {
  it('resolves CartsService through its explicit Nest token', async () => {
    const cartsService = {
      createAnonymousCart: vi.fn().mockResolvedValue({ publicId: 'cart-1', anonymousToken: 'token-1' }),
    };
    const module = await Test.createTestingModule({
      controllers: [CartsController],
      providers: [{ provide: CartsService, useValue: cartsService }],
    }).overrideGuard(SessionGuard).useValue({}).compile();

    const controller = module.get(CartsController);
    const response = { cookie: vi.fn() };
    await controller.create(response as never);

    expect(cartsService.createAnonymousCart).toHaveBeenCalledOnce();
    expect(response.cookie).toHaveBeenCalledWith('je_cart', 'token-1', expect.objectContaining({ signed: true }));
  });
});
