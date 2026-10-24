import { describe, expect, it, vi } from 'vitest';
import { CatalogService } from './catalog.service';

describe('CatalogService — hierarquia de categorias (E2)', () => {
  it('cria categoria com pai, imagem e ordem', async () => {
    const prisma = { category: { create: vi.fn().mockResolvedValue({ id: 'child' }) } };
    const service = new CatalogService(prisma as never);

    await service.createCategory({ name: 'Copos', parentId: 'parent-1', imagePath: 'uploads/cat/copos.webp', sortOrder: 2 });

    expect(prisma.category.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Copos',
        slug: 'copos',
        parentId: 'parent-1',
        imagePath: 'uploads/cat/copos.webp',
        sortOrder: 2,
      }),
    });
  });

  it('recusa categoria sendo pai de si mesma', async () => {
    const prisma = { category: { update: vi.fn() } };
    const service = new CatalogService(prisma as never);

    await expect(service.updateCategory('cat-1', { parentId: 'cat-1' })).rejects.toThrowError(/CATEGORY_PARENT_INVALID/);
    expect(prisma.category.update).not.toHaveBeenCalled();
  });

  it('detecta ciclo ao mover uma categoria para dentro da própria descendência', async () => {
    const prisma = {
      category: {
        update: vi.fn(),
        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => (
          where.id === 'child' ? { parentId: 'parent' } : { parentId: null }
        )),
      },
    };
    const service = new CatalogService(prisma as never);

    await expect(service.updateCategory('parent', { parentId: 'child' })).rejects.toThrowError(/CATEGORY_CYCLE_DETECTED/);
    expect(prisma.category.update).not.toHaveBeenCalled();
  });

  it('resolve descendentes em todos os níveis', async () => {
    const tree: Record<string, string[]> = {
      root: ['child-1', 'child-2'],
      'child-1': ['grandchild'],
      'child-2': [],
      grandchild: [],
    };
    const prisma = {
      category: {
        findMany: vi.fn(async ({ where }: { where: { parentId: { in: string[] } } }) => (
          where.parentId.in.flatMap((id) => (tree[id] ?? []).map((childId) => ({ id: childId })))
        )),
      },
    };
    const service = new CatalogService(prisma as never);

    await expect(service.categoryIdsWithDescendants('root')).resolves.toEqual(['root', 'child-1', 'child-2', 'grandchild']);
  });

  it('inclui subcategorias ao filtrar produtos pela categoria pai', async () => {
    const prisma = {
      brand: { findUnique: vi.fn().mockResolvedValue(null) },
      category: {
        findUnique: vi.fn().mockResolvedValue({ id: 'root' }),
        findMany: vi.fn(async ({ where }: { where: { parentId: { in: string[] } } }) => (
          where.parentId.in.includes('root') ? [{ id: 'child-1' }] : []
        )),
      },
      product: { findMany: vi.fn().mockResolvedValue([]), count: vi.fn().mockResolvedValue(0) },
    };
    const service = new CatalogService(prisma as never);

    await service.searchProducts({ category: 'embalagens' });

    const where = prisma.product.findMany.mock.calls[0][0].where;
    expect(where.categories).toEqual({ some: { categoryId: { in: ['root', 'child-1'] } } });
  });
});
