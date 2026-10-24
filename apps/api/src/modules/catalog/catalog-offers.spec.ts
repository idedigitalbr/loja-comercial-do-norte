import { describe, expect, it, vi } from 'vitest';
import { CatalogService } from './catalog.service';

describe('CatalogService — ofertas do dia (S3)', () => {
  function build() {
    const prisma = { product: { findMany: vi.fn().mockResolvedValue([]) } };
    return { prisma, service: new CatalogService(prisma as never) };
  }

  it('busca apenas produtos ACTIVE com variante em promoção real', async () => {
    const { prisma, service } = build();

    await service.listOffers(6);

    expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
      take: 6,
      where: {
        status: 'ACTIVE',
        variants: { some: { status: 'ACTIVE', compareAtPriceCents: { gt: 0 } } },
      },
    }));
  });

  it('limita o máximo de ofertas retornadas', async () => {
    const { prisma, service } = build();

    await service.listOffers(100);

    expect(prisma.product.findMany.mock.calls[0][0].take).toBe(24);
  });
});
