import { describe, expect, it, vi } from 'vitest';
import { CatalogService } from './catalog.service';

describe('CatalogService brand administration', () => {
  it('loads a brand with hierarchy, product counts and linked products', async () => {
    const brand = {
      id: 'brand-1',
      name: 'Grandha',
      imagePath: '/storage/uploads/brand-1/960.webp',
      children: [{ id: 'brand-2', name: 'Alkymia' }],
      _count: { products: 71, children: 6 },
      products: [{ id: 'product-1', name: 'Shampoo', slug: 'shampoo', status: 'ACTIVE' }],
    };
    const prisma = { brand: { findUnique: vi.fn().mockResolvedValue(brand) } };
    const service = new CatalogService(prisma as never);

    await expect(service.getBrandById('brand-1')).resolves.toEqual(brand);
    expect(prisma.brand.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'brand-1' },
      include: expect.objectContaining({ children: expect.anything(), products: expect.anything(), _count: expect.anything() }),
    }));
  });

  it('persists editorial brand data and the square image path', async () => {
    const prisma = { brand: { create: vi.fn().mockResolvedValue({ id: 'brand-1' }) } };
    const service = new CatalogService(prisma as never);

    await service.createBrand({
      name: 'Grandha',
      slug: 'grandha',
      description: 'Linha profissional',
      imagePath: '/storage/uploads/brand-1/960.webp',
    });

    expect(prisma.brand.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        description: 'Linha profissional',
        imagePath: '/storage/uploads/brand-1/960.webp',
      }),
    });
  });
});
