import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { OrdersService } from './orders.service';
import { AdminOrdersController } from './admin-orders.controller';
import { SessionGuard } from '../auth/guards/session.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { AuthService } from '../auth/auth.service';
import { Reflector } from '@nestjs/core';

describe('AdminOrdersController wiring', () => {
  it('resolves OrdersService through its explicit Nest token', async () => {
    const ordersService = {};
    const module = await Test.createTestingModule({
      controllers: [AdminOrdersController],
      providers: [
        { provide: OrdersService, useValue: ordersService },
        { provide: SessionGuard, useValue: {} },
        { provide: PermissionGuard, useValue: {} },
        { provide: AuthService, useValue: {} },
        { provide: Reflector, useValue: {} },
      ],
    }).compile();

    const controller = module.get(AdminOrdersController);

    expect((controller as unknown as { ordersService?: unknown }).ordersService).toBe(ordersService);
  });
});
