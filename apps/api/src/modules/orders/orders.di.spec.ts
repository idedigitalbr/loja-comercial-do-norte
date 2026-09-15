import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../database/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { OrdersService } from './orders.service';

describe('OrdersService wiring', () => {
  it('resolves PrismaService and InventoryService', async () => {
    const prisma = { order: { findMany: vi.fn().mockResolvedValue([]) } };
    const inventoryService = {};
    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: InventoryService, useValue: inventoryService },
      ],
    }).compile();

    const service = module.get(OrdersService);
    await service.listForOperations();

    expect((service as unknown as { inventoryService?: unknown }).inventoryService).toBe(inventoryService);
    expect(prisma.order.findMany).toHaveBeenCalled();
  });
});
