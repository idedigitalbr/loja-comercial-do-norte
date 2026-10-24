import { describe, expect, it, vi } from 'vitest';
import { CatalogService } from './catalog.service';

function buildService(total = 25) {
  const prisma = {
    brand: { findUnique: vi.fn().mockResolvedValue(null) },
    category: {
      findUnique: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
    },
    product: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(total),
    },
  };
  return { prisma, service: new CatalogService(prisma as never) };
}

describe('CatalogService — busca paginada do storefront (E7)', () => {
  it('pagina no servidor com skip/take e devolve total de páginas', async () => {
    const { prisma, service } = buildService(25);

    const result = await service.searchProducts({ page: 2, pageSize: 12 });

    expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 12, take: 12 }));
    expect(result).toMatchObject({ total: 25, page: 2, pageSize: 12, totalPages: 3 });
  });

  it('ordena por nome quando solicitado e filtra apenas produtos ACTIVE', async () => {
    const { prisma, service } = buildService();

    await service.searchProducts({ sort: 'name_asc' });

    const args = prisma.product.findMany.mock.calls[0][0];
    expect(args.orderBy).toEqual({ name: 'asc' });
    expect(args.where.status).toBe('ACTIVE');
  });

  it('aplica busca case-insensitive e filtro por categoria', async () => {
    const { prisma, service } = buildService();
    prisma.category.findUnique.mockResolvedValue({ id: 'category-1' });

    await service.searchProducts({ search: 'Copo 300ml', category: 'descartaveis' });

    const args = prisma.product.findMany.mock.calls[0][0];
    expect(args.where.categories).toEqual({ some: { categoryId: { in: ['category-1'] } } });
    expect(args.where.OR).toEqual([
      { name: { contains: 'Copo 300ml', mode: 'insensitive' } },
      { slug: { contains: 'copo-300ml' } },
    ]);
  });

  it('limita pageSize e normaliza página inválida', async () => {
    const { prisma, service } = buildService();

    await service.searchProducts({ page: -3, pageSize: 999 });

    const args = prisma.product.findMany.mock.calls[0][0];
    expect(args.skip).toBe(0);
    expect(args.take).toBe(48);
  });
});
