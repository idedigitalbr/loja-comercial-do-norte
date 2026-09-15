import { describe, expect, it, vi } from 'vitest';
import { InventoryService } from './inventory.service';

describe('InventoryService admin resources', () => {
  it('returns available quantity with product and variant context', async () => {
    const prisma = {
      inventoryBalance: {
        findMany: vi.fn().mockResolvedValue([
          { physicalQuantity: 12, reservedQuantity: 3, variant: { sku: 'SKU-1', product: { name: 'Shampoo' } } },
        ]),
      },
    };
    const service = new InventoryService(prisma as never);

    const rows = await service.list({ search: 'shampoo' });

    expect(rows).toEqual([
      expect.objectContaining({ availableQuantity: 9 }),
    ]);
    expect(prisma.inventoryBalance.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ variant: expect.any(Object) }),
    }));
  });
});
