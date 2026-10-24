import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { OrdersService } from './orders.service';

describe('OrdersService — ownership de pedidos (roadmap R05)', () => {
  const build = (order: unknown) => {
    const prisma = { order: { findFirst: vi.fn().mockResolvedValue(order) } };
    const service = new OrdersService(prisma as never, {} as never);
    return { prisma, service };
  };

  it('filtra o pedido pelo userId da sessao', async () => {
    const order = { id: 'order-1', publicId: 'ped-123', userId: 'user-1' };
    const { prisma, service } = build(order);

    await expect(service.getForUser('ped-123', 'user-1')).resolves.toBe(order);
    expect(prisma.order.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { publicId: 'ped-123', userId: 'user-1' } }),
    );
  });

  it('nao devolve pedido de outro cliente', async () => {
    const { service } = build(null);

    await expect(service.getForUser('ped-de-outro-cliente', 'user-2')).rejects.toBeInstanceOf(NotFoundException);
  });
});
