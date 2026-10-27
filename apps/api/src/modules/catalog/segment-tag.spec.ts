import { describe, expect, it, vi } from 'vitest';
import { CatalogService } from './catalog.service';

describe('CatalogService Segments and Tags', () => {
  it('creates a segment with normalized slug, imagePath and sortOrder', async () => {
    const prisma = {
      segment: {
        create: vi.fn().mockResolvedValue({
          id: 'seg-1',
          name: 'Pizzaria',
          slug: 'pizzaria',
          imagePath: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-02-pizzaria.jpg',
          sortOrder: 2,
        }),
      },
    };
    const service = new CatalogService(prisma as never);

    await service.createSegment({
      name: 'Pizzaria',
      slug: 'pizzaria',
      imagePath: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-02-pizzaria.jpg',
      sortOrder: 2,
    });

    expect(prisma.segment.create).toHaveBeenCalledWith({
      data: {
        name: 'Pizzaria',
        slug: 'pizzaria',
        description: undefined,
        imagePath: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-02-pizzaria.jpg',
        sortOrder: 2,
      },
    });
  });

  it('creates a tag with normalized slug', async () => {
    const prisma = {
      tag: {
        create: vi.fn().mockResolvedValue({
          id: 'tag-1',
          name: 'Biodegradável',
          slug: 'biodegradavel',
        }),
      },
    };
    const service = new CatalogService(prisma as never);

    await service.createTag({
      name: 'Biodegradável',
    });

    expect(prisma.tag.create).toHaveBeenCalledWith({
      data: {
        name: 'Biodegradável',
        slug: 'biodegradavel',
      },
    });
  });

  it('filters products by segment slug in listProducts', async () => {
    const prisma = {
      segment: {
        findUnique: vi.fn().mockResolvedValue({ id: 'seg-pizzaria' }),
      },
      product: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    };
    const service = new CatalogService(prisma as never);

    await service.listProducts({ segment: 'pizzaria' });

    expect(prisma.segment.findUnique).toHaveBeenCalledWith({
      where: { slug: 'pizzaria' },
      select: { id: true },
    });
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          segments: { some: { segmentId: 'seg-pizzaria' } },
        }),
      }),
    );
  });

  it('filters products by tag slug in listProducts', async () => {
    const prisma = {
      tag: {
        findUnique: vi.fn().mockResolvedValue({ id: 'tag-kraft' }),
      },
      product: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    };
    const service = new CatalogService(prisma as never);

    await service.listProducts({ tag: 'kraft' });

    expect(prisma.tag.findUnique).toHaveBeenCalledWith({
      where: { slug: 'kraft' },
      select: { id: true },
    });
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tags: { some: { tagId: 'tag-kraft' } },
        }),
      }),
    );
  });
});
