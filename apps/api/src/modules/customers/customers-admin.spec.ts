import { describe, expect, it, vi } from 'vitest';
import { CustomersService } from './customers.service';

describe('CustomersService admin resources', () => {
  it('lists customer accounts with order counters', async () => {
    const prisma = { user: { findMany: vi.fn().mockResolvedValue([{ publicId: 'customer-1', email: 'cliente@example.com', profile: null, _count: { orders: 2 } }]) } };
    const service = new CustomersService(prisma as never);

    const customers = await service.list({ search: 'cliente' });

    expect(customers).toHaveLength(1);
    expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ profile: expect.any(Object) }),
      include: expect.objectContaining({ _count: expect.any(Object) }),
    }));
  });
});
