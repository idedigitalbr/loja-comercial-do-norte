import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';
import { SessionGuard } from '../auth/guards/session.guard';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

describe('OrdersController wiring', () => {
  it('resolves OrdersService for the customer order view', async () => {
    const ordersService = { listForUser: vi.fn().mockResolvedValue([]) };
    const module = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: ordersService }],
    }).overrideGuard(SessionGuard).useValue({}).compile();

    const controller = module.get(OrdersController);
    await controller.list({ user: { id: 'customer-1' } } as never);

    expect(ordersService.listForUser).toHaveBeenCalledWith('customer-1');
  });
});
