import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../database/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { CheckoutService } from './checkout.service';

describe('CheckoutService wiring', () => {
  it('resolves PrismaService and OrdersService before preparing an order', async () => {
    const prisma = {
      idempotencyKey: { findUnique: vi.fn().mockResolvedValue(null) },
      cart: { findFirst: vi.fn().mockResolvedValue({ id: 'cart-1' }) },
    };
    const ordersService = {
      createFromCart: vi.fn().mockResolvedValue({
        publicId: 'order-1',
        totalCents: 9900,
        inventoryReservations: [],
      }),
    };
    const module = await Test.createTestingModule({
      providers: [
        CheckoutService,
        { provide: PrismaService, useValue: prisma },
        { provide: OrdersService, useValue: ordersService },
      ],
    }).compile();

    const service = module.get(CheckoutService);
    await service.prepare({ cartId: 'cart-1', contactEmail: 'cliente@teste.local' }, 'checkout-1');

    expect(ordersService.createFromCart).toHaveBeenCalledWith(expect.objectContaining({ cartId: 'cart-1' }));
  });
});
