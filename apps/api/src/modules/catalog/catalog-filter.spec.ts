import { describe, expect, it, vi } from 'vitest';
import { CatalogService } from './catalog.service';

describe('CatalogService filters', () => {
  it('resolves imported brand and category slugs before querying products', async () => {
    const prisma = {
      brand: { findUnique: vi.fn().mockResolvedValue({ id: 'brand-knut' }) },
      category: {
        findUnique: vi.fn().mockResolvedValue({ id: 'category-shampoo' }),
        findMany: vi.fn().mockResolvedValue([]),
      },
      product: { findMany: vi.fn().mockResolvedValue([]) },
    };
    const service = new CatalogService(prisma as never);

    await service.listProducts({ brand: 'knut', category: 'shampoo' });

    expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        brandId: 'brand-knut',
        categories: { some: { categoryId: { in: ['category-shampoo'] } } },
      }),
    }));
  });
});
