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

  it('calcula contagem distinta de produtos nas categorias incluindo subcategorias sem duplicar vínculos', async () => {
    const childCopos = { id: 'copos', name: 'Copos', slug: 'copos', parentId: 'descartaveis', _count: { products: 2 } };
    const childPratos = { id: 'pratos', name: 'Pratos', slug: 'pratos', parentId: 'descartaveis', _count: { products: 1 } };
    const prisma = {
      category: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'descartaveis',
            name: 'Descartáveis',
            slug: 'descartaveis',
            parentId: null,
            _count: { products: 2, children: 2 },
            children: [childCopos, childPratos],
          },
          childCopos,
          childPratos,
        ]),
      },
      productCategory: {
        findMany: vi.fn().mockResolvedValue([
          { categoryId: 'descartaveis', productId: 'prod-1' },
          { categoryId: 'copos', productId: 'prod-1' },
          { categoryId: 'copos', productId: 'prod-2' },
          { categoryId: 'pratos', productId: 'prod-3' },
          { categoryId: 'descartaveis', productId: 'prod-4' },
        ]),
      },
    };
    const service = new CatalogService(prisma as never);

    const result = await service.listCategories();

    expect(prisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'ACTIVE' },
        include: expect.objectContaining({
          _count: {
            select: {
              products: { where: { product: { status: 'ACTIVE' } } },
              children: { where: { status: 'ACTIVE' } },
            },
          },
        }),
      }),
    );
    expect(prisma.productCategory.findMany).toHaveBeenCalledWith({
      where: {
        categoryId: { in: ['descartaveis', 'copos', 'pratos'] },
        product: { status: 'ACTIVE' },
      },
      select: { categoryId: true, productId: true },
    });

    expect(result[0]._count).toEqual({ products: 4, children: 2 });
    expect(result[0].children?.[0]._count).toEqual({ products: 2 });
    expect(result[0].children?.[1]._count).toEqual({ products: 1 });
    expect(result[1]._count).toEqual({ products: 2 });
    expect(result[2]._count).toEqual({ products: 1 });
  });

  it('mantém listCategories sem filtro de status no modo admin (status = null)', async () => {
    const prisma = {
      category: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'descartaveis', name: 'Descartáveis', parentId: null, _count: { products: 1, children: 0 }, children: [] },
        ]),
      },
      productCategory: {
        findMany: vi.fn().mockResolvedValue([{ categoryId: 'descartaveis', productId: 'prod-draft' }]),
      },
    };
    const service = new CatalogService(prisma as never);

    const result = await service.listCategories(null);

    expect(prisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        include: expect.objectContaining({
          _count: { select: { products: true, children: true } },
        }),
      }),
    );
    expect(prisma.productCategory.findMany).toHaveBeenCalledWith({
      where: { categoryId: { in: ['descartaveis'] } },
      select: { categoryId: true, productId: true },
    });
    expect(result[0]._count?.products).toBe(1);
  });
});
