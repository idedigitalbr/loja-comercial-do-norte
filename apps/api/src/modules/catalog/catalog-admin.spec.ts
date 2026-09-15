import { describe, expect, it, vi } from 'vitest';
import { CatalogService, normalizeProductSlug } from './catalog.service';

describe('CatalogService admin resources', () => {
  it('generates a stable product slug from the name', () => {
    expect(normalizeProductSlug('Máscara Reconstrução — Haskell 500ml')).toBe('mascara-reconstrucao-haskell-500ml');
  });

  it('creates a brand with a normalized slug and draft status', async () => {
    const prisma = {
      brand: { create: vi.fn().mockResolvedValue({ id: 'brand-1', name: 'Haskell', slug: 'haskell' }) },
    };
    const service = new CatalogService(prisma as never);

    await service.createBrand({ name: 'Haskell', slug: 'haskell' });

    expect(prisma.brand.create).toHaveBeenCalledWith({
      data: { name: 'Haskell', slug: 'haskell' },
    });
  });

  it('creates a subbrand linked to its main brand', async () => {
    const prisma = {
      brand: { create: vi.fn().mockResolvedValue({ id: 'brand-child', parentId: 'brand-parent' }) },
    };
    const service = new CatalogService(prisma as never);

    await service.createBrand({ name: 'Alkymia', slug: 'alkymia', parentId: 'brand-parent' });

    expect(prisma.brand.create).toHaveBeenCalledWith({
      data: { name: 'Alkymia', slug: 'alkymia', parentId: 'brand-parent' },
    });
  });

  it('lists all product statuses for the admin catalog', async () => {
    const prisma = {
      brand: { findUnique: vi.fn() },
      category: { findUnique: vi.fn() },
      product: { findMany: vi.fn().mockResolvedValue([]) },
    };
    const service = new CatalogService(prisma as never);

    await service.listProducts({ status: null });

    expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.not.objectContaining({ status: expect.anything() }),
    }));
  });

  it('loads one product for the dedicated editor page', async () => {
    const product = { id: 'product-1', name: 'Shampoo' };
    const prisma = { product: { findUnique: vi.fn().mockResolvedValue(product) } };
    const service = new CatalogService(prisma as never);

    await expect(service.getProductById('product-1')).resolves.toEqual(product);
    expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 'product-1' }, include: expect.anything() });
  });
});
