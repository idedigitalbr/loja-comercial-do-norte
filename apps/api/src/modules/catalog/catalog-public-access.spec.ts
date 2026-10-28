import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { CatalogService } from './catalog.service';

describe('CatalogService — acesso publico ao catalogo', () => {
  it('nao expoe produto DRAFT/arquivado por URL direta (roadmap R04)', async () => {
    const prisma = { product: { findFirst: vi.fn().mockResolvedValue(null) } };
    const service = new CatalogService(prisma as never);

    await expect(service.getProductBySlug('produto-em-rascunho')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.product.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: 'produto-em-rascunho', status: 'ACTIVE' } }),
    );
  });

  it('busca publica ignora caixa no PostgreSQL (contains + insensitive)', async () => {
    const prisma = {
      brand: { findUnique: vi.fn() },
      category: { findUnique: vi.fn() },
      product: { findMany: vi.fn().mockResolvedValue([]) },
    };
    const service = new CatalogService(prisma as never);

    await service.listProducts({ search: 'Copo 300ml' });

    const where = prisma.product.findMany.mock.calls[0][0].where;
    expect(where.status).toBe('ACTIVE');
    expect(where.OR).toEqual([
      { name: { contains: 'Copo 300ml', mode: 'insensitive' } },
      { slug: { contains: 'copo-300ml' } },
      { description: { contains: 'Copo 300ml', mode: 'insensitive' } },
      { brand: { name: { contains: 'Copo 300ml', mode: 'insensitive' } } },
      { categories: { some: { category: { name: { contains: 'Copo 300ml', mode: 'insensitive' } } } } },
      { segments: { some: { segment: { name: { contains: 'Copo 300ml', mode: 'insensitive' } } } } },
      { tags: { some: { tag: { name: { contains: 'Copo 300ml', mode: 'insensitive' } } } } },
      { variants: { some: { sku: { contains: 'Copo 300ml', mode: 'insensitive' } } } },
    ]);
  });
});
