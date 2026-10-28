import { Prisma, ProductStockStatus, RecordStatus } from '@prisma/client';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export type CreateProductInput = {
  name: string;
  slug?: string;
  description?: string;
  brandId?: string;
  categoryIds?: string[];
  segmentIds?: string[];
  tagIds?: string[];
  variants?: ProductVariantInput[];
  images?: ProductImageInput[];
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type ProductVariantInput = {
  id?: string;
  sku: string;
  priceCents: number;
  compareAtPriceCents?: number;
  weightGrams?: number;
  widthMm?: number;
  heightMm?: number;
  lengthMm?: number;
  inventoryQuantity?: number;
  manageStock?: boolean;
  stockStatus?: ProductStockStatus;
  lowStockThreshold?: number;
};

export type ProductImageInput = {
  path: string;
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  variantId?: string;
};

export type TaxonomyInput = {
  name: string;
  slug?: string;
  parentId?: string;
  description?: string;
  imagePath?: string;
  sortOrder?: number;
};

export type TaxonomyUpdateInput = Partial<TaxonomyInput> & { status?: RecordStatus };

export class ProductIncompleteError extends BadRequestException {
  readonly code = 'PRODUCT_INCOMPLETE';

  constructor(readonly fields: string[]) {
    super({
      code: 'PRODUCT_INCOMPLETE',
      message: 'Produto incompleto para publicação.',
      fields,
    });
    this.name = 'ProductIncompleteError';
  }
}

const productRelations = {
  brand: { include: { parent: true } },
  categories: { include: { category: true } },
  segments: { include: { segment: true } },
  tags: { include: { tag: true } },
  variants: { include: { images: true, inventoryBalance: true } },
  images: { orderBy: { sortOrder: 'asc' as const } },
} as const;

@Injectable()
export class CatalogService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createProduct(input: CreateProductInput) {
    return this.prisma.$transaction(async (transaction) => transaction.product.create({
      data: {
        name: input.name,
        slug: normalizeProductSlug(input.slug || input.name),
        description: input.description,
        brandId: input.brandId,
        segments: input.segmentIds?.length
          ? { create: input.segmentIds.map((segmentId) => ({ segmentId })) }
          : undefined,
        tags: input.tagIds?.length
          ? { create: input.tagIds.map((tagId) => ({ tagId })) }
          : undefined,
        categories: input.categoryIds?.length
          ? { create: input.categoryIds.map((categoryId) => ({ categoryId })) }
          : undefined,
        variants: input.variants?.length
          ? {
              create: input.variants.map((variant) => ({
                sku: variant.sku,
                priceCents: variant.priceCents,
                compareAtPriceCents: variant.compareAtPriceCents,
                weightGrams: variant.weightGrams,
                widthMm: variant.widthMm,
                heightMm: variant.heightMm,
                lengthMm: variant.lengthMm,
                manageStock: variant.manageStock,
                stockStatus: variant.stockStatus,
                lowStockThreshold: variant.lowStockThreshold,
                inventoryBalance: { create: { physicalQuantity: variant.inventoryQuantity ?? 0 } },
              })),
            }
          : undefined,
        images: input.images?.length ? { create: input.images } : undefined,
      },
      include: productRelations,
    }));
  }

  async updateProduct(id: string, input: UpdateProductInput) {
    await this.assertProduct(id);
    return this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.product.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.slug !== undefined ? { slug: input.slug } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.brandId !== undefined ? { brandId: input.brandId || null } : {}),
          ...(input.segmentIds !== undefined
            ? { segments: { deleteMany: {}, create: input.segmentIds.map((segmentId) => ({ segmentId })) } }
            : {}),
          ...(input.tagIds !== undefined
            ? { tags: { deleteMany: {}, create: input.tagIds.map((tagId) => ({ tagId })) } }
            : {}),
          ...(input.categoryIds !== undefined
            ? { categories: { deleteMany: {}, create: input.categoryIds.map((categoryId) => ({ categoryId })) } }
            : {}),
        },
        include: productRelations,
      });

      if (input.images) {
        await transaction.productImage.deleteMany({ where: { productId: id } });
        if (input.images.length) await transaction.productImage.createMany({ data: input.images.map((image) => ({ ...image, productId: id })) });
      }

      for (const variant of input.variants ?? []) {
        if (variant.id) {
          await transaction.productVariant.update({
            where: { id: variant.id },
            data: {
              sku: variant.sku,
              priceCents: variant.priceCents,
              compareAtPriceCents: variant.compareAtPriceCents,
              weightGrams: variant.weightGrams,
              widthMm: variant.widthMm,
              heightMm: variant.heightMm,
              lengthMm: variant.lengthMm,
              manageStock: variant.manageStock,
              stockStatus: variant.stockStatus,
              lowStockThreshold: variant.lowStockThreshold,
            },
          });
          if (variant.inventoryQuantity !== undefined) {
            await transaction.inventoryBalance.update({ where: { variantId: variant.id }, data: { physicalQuantity: variant.inventoryQuantity } });
          }
        } else {
          await transaction.productVariant.create({
            data: {
              productId: id,
              sku: variant.sku,
              priceCents: variant.priceCents,
              compareAtPriceCents: variant.compareAtPriceCents,
              weightGrams: variant.weightGrams,
              widthMm: variant.widthMm,
              heightMm: variant.heightMm,
              lengthMm: variant.lengthMm,
              inventoryBalance: { create: { physicalQuantity: variant.inventoryQuantity ?? 0 } },
            },
          });
        }
      }

      return transaction.product.findUnique({ where: { id: updated.id }, include: productRelations });
    });
  }

  createBrand(input: TaxonomyInput) {
    return this.prisma.brand.create({
      data: {
        name: input.name,
        slug: input.slug || toSlug(input.name),
        ...(input.parentId ? { parentId: input.parentId } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(!input.parentId && input.imagePath ? { imagePath: input.imagePath } : {}),
      },
    });
  }

  updateBrand(id: string, input: TaxonomyUpdateInput) {
    if (input.parentId === id) throw new BadRequestException('BRAND_PARENT_INVALID');
    return this.prisma.brand.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.parentId !== undefined ? { parentId: input.parentId || null, ...(input.parentId ? { imagePath: null } : {}) } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(!input.parentId && input.imagePath !== undefined ? { imagePath: input.imagePath || null } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });
  }

  archiveBrand(id: string) {
    return this.prisma.brand.update({ where: { id }, data: { status: RecordStatus.ARCHIVED } });
  }

  async createCategory(input: TaxonomyInput) {
    return this.prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug || toSlug(input.name),
        ...(input.parentId ? { parentId: input.parentId } : {}),
        ...(input.imagePath ? { imagePath: input.imagePath } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      },
    });
  }

  async updateCategory(id: string, input: TaxonomyUpdateInput) {
    if (input.parentId === id) throw new BadRequestException('CATEGORY_PARENT_INVALID');
    if (input.parentId) await this.assertNoCategoryCycle(id, input.parentId);
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.parentId !== undefined ? { parentId: input.parentId || null } : {}),
        ...(input.imagePath !== undefined ? { imagePath: input.imagePath || null } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      },
    });
  }

  /** Impede que a hierarquia de categorias vire um ciclo (A > B > A). */
  private async assertNoCategoryCycle(categoryId: string, parentId: string): Promise<void> {
    let cursor: string | null = parentId;
    const visited = new Set<string>();
    while (cursor) {
      if (cursor === categoryId) throw new BadRequestException('CATEGORY_CYCLE_DETECTED');
      if (visited.has(cursor)) break;
      visited.add(cursor);
      const parent: { parentId: string | null } | null = await this.prisma.category.findUnique({
        where: { id: cursor },
        select: { parentId: true },
      });
      cursor = parent?.parentId ?? null;
    }
  }

  /** Resolve uma categoria e todas as suas descendentes (para filtros). */
  async categoryIdsWithDescendants(id: string): Promise<string[]> {
    const ids = [id];
    let frontier = [id];
    const visited = new Set(ids);
    while (frontier.length) {
      const children = await this.prisma.category.findMany({
        where: { parentId: { in: frontier } },
        select: { id: true },
      });
      frontier = children.map((child) => child.id).filter((childId) => !visited.has(childId));
      for (const childId of frontier) {
        visited.add(childId);
        ids.push(childId);
      }
    }
    return ids;
  }

  archiveCategory(id: string) {
    return this.prisma.category.update({ where: { id }, data: { status: RecordStatus.ARCHIVED } });
  }

  async publish(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true, images: true },
    });
    if (!product) throw new NotFoundException('PRODUCT_NOT_FOUND');

    const variant = product.variants[0];
    const fields: string[] = [];
    if (!variant?.sku) fields.push('sku');
    if (!product.images.some((image) => image.isPrimary)) fields.push('mainImage');
    if (!variant?.weightGrams) fields.push('weightGrams');
    if (!variant?.widthMm) fields.push('widthMm');
    if (!variant?.heightMm) fields.push('heightMm');
    if (!variant?.lengthMm) fields.push('lengthMm');
    if (fields.length) throw new ProductIncompleteError(fields);

    return this.prisma.product.update({
      where: { id },
      data: { status: RecordStatus.ACTIVE },
      include: productRelations,
    });
  }

  async archiveProduct(id: string) {
    await this.assertProduct(id);
    return this.prisma.product.update({
      where: { id },
      data: { status: RecordStatus.ARCHIVED },
      include: productRelations,
    });
  }

  async listProducts(input: {
    search?: string;
    brandId?: string;
    categoryId?: string;
    segmentId?: string;
    tagId?: string;
    segment?: string;
    tag?: string;
    brand?: string;
    category?: string;
    status?: RecordStatus | null;
  } = {}) {
    const where = await this.buildPublicWhere(input);
    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: productRelations,
    });
  }

  /**
   * Ofertas do dia (S3): produtos ACTIVE cuja variante tem preço "de/por"
   * real (compareAtPriceCents > priceCents). Nada é inventado no front.
   */
  async listOffers(limit = 8) {
    const take = Math.min(24, Math.max(1, Math.trunc(limit)));
    return this.prisma.product.findMany({
      where: {
        status: RecordStatus.ACTIVE,
        variants: { some: { status: RecordStatus.ACTIVE, compareAtPriceCents: { gt: 0 } } },
      },
      orderBy: { updatedAt: 'desc' },
      take,
      include: productRelations,
    });
  }

  /**
   * Busca paginada para o storefront (E7): filtros e ordenação no servidor,
   * com contagem total para a paginação.
   */
  async searchProducts(input: {
    search?: string;
    brand?: string;
    category?: string;
    segment?: string;
    tag?: string;
    page?: number;
    pageSize?: number;
    sort?: 'newest' | 'name_asc' | 'mais_vendidos';
    onlyOffers?: boolean;
  } = {}) {
    const page = Math.max(1, Math.trunc(input.page ?? 1));
    const pageSize = Math.min(48, Math.max(1, Math.trunc(input.pageSize ?? 12)));
    const baseWhere = await this.buildPublicWhere(input);

    const where: Prisma.ProductWhereInput = input.onlyOffers
      ? {
          ...baseWhere,
          variants: {
            some: {
              status: RecordStatus.ACTIVE,
              compareAtPriceCents: { gt: 0 },
            },
          },
        }
      : baseWhere;

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      input.sort === 'name_asc'
        ? { name: 'asc' }
        : input.sort === 'mais_vendidos'
          ? { updatedAt: 'desc' }
          : { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: productRelations,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)), sort: input.sort ?? 'newest' };
  }

  /** Filtro público compartilhado: nunca expõe produto fora de ACTIVE. */
  private async buildPublicWhere(input: {
    search?: string;
    brandId?: string;
    categoryId?: string;
    segmentId?: string;
    tagId?: string;
    brand?: string;
    category?: string;
    segment?: string;
    tag?: string;
    status?: RecordStatus | null;
  }): Promise<Prisma.ProductWhereInput> {
    const [brand, category, segment, tag] = await Promise.all([
      input.brand || input.brandId
        ? this.prisma.brand.findUnique({ where: input.brandId ? { id: input.brandId } : { slug: input.brand }, select: { id: true, children: { select: { id: true } } } })
        : null,
      input.category && !input.categoryId
        ? this.prisma.category.findUnique({ where: { slug: input.category }, select: { id: true } })
        : null,
      input.segment && !input.segmentId
        ? this.prisma.segment.findUnique({ where: { slug: input.segment }, select: { id: true } })
        : null,
      input.tag && !input.tagId
        ? this.prisma.tag.findUnique({ where: { slug: input.tag }, select: { id: true } })
        : null,
    ]);
    const resolvedBrandIds = brand ? [brand.id, ...(brand.children?.map((child) => child.id) ?? [])] : input.brand || input.brandId ? ['__unknown_brand__'] : [];
    const categoryId = input.categoryId ?? (input.category ? category?.id : undefined);
    const resolvedCategoryIds = categoryId
      ? await this.categoryIdsWithDescendants(categoryId)
      : input.category || input.categoryId
        ? ['__unknown_category__']
        : [];
    const resolvedSegmentId = input.segmentId ?? (input.segment ? segment?.id : undefined);
    const resolvedTagId = input.tagId ?? (input.tag ? tag?.id : undefined);

    return {
      ...(input.status === undefined ? { status: RecordStatus.ACTIVE } : input.status ? { status: input.status } : {}),
      ...(resolvedBrandIds.length === 1 ? { brandId: resolvedBrandIds[0] } : resolvedBrandIds.length > 1 ? { brandId: { in: resolvedBrandIds } } : {}),
      ...(resolvedCategoryIds.length ? { categories: { some: { categoryId: { in: resolvedCategoryIds } } } } : {}),
      ...(resolvedSegmentId ? { segments: { some: { segmentId: resolvedSegmentId } } } : (input.segment || input.segmentId) ? { segments: { some: { segmentId: '__unknown_segment__' } } } : {}),
      ...(resolvedTagId ? { tags: { some: { tagId: resolvedTagId } } } : (input.tag || input.tagId) ? { tags: { some: { tagId: '__unknown_tag__' } } } : {}),
      ...(input.search?.trim()
        ? {
            OR: [
              { name: { contains: input.search.trim(), mode: Prisma.QueryMode.insensitive } },
              { slug: { contains: normalizeProductSlug(input.search) } },
            ],
          }
        : {}),
    };
  }

  async getProductBySlug(slug: string) {
    // Apenas produtos ACTIVE sao publicos: rascunhos/arquivados nao podem ser
    // acessados nem por URL direta (roadmap R04).
    const product = await this.prisma.product.findFirst({
      where: { slug, status: RecordStatus.ACTIVE },
      include: productRelations,
    });
    if (!product) throw new NotFoundException('PRODUCT_NOT_FOUND');
    return product;
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id }, include: productRelations });
    if (!product) throw new NotFoundException('PRODUCT_NOT_FOUND');
    return product;
  }

  async getBrandById(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          orderBy: { name: 'asc' },
          include: { _count: { select: { products: true } } },
        },
        products: {
          where: { status: { not: RecordStatus.ARCHIVED } },
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            variants: {
              where: { status: RecordStatus.ACTIVE },
              orderBy: { priceCents: 'asc' },
              take: 1,
              select: { sku: true, priceCents: true },
            },
            images: { where: { isPrimary: true }, take: 1, select: { path: true, altText: true } },
          },
        },
        _count: { select: { products: true, children: true } },
      },
    });
    if (!brand) throw new NotFoundException('BRAND_NOT_FOUND');
    return brand;
  }

  listBrands(status: RecordStatus | null = RecordStatus.ACTIVE) {
    return this.prisma.brand.findMany({ where: status ? { status } : {}, orderBy: [{ parentId: 'asc' }, { name: 'asc' }], include: { parent: true, children: { where: status ? { status } : {}, orderBy: { name: 'asc' } } } });
  }

  listCategories(status: RecordStatus | null = RecordStatus.ACTIVE) {
    return this.prisma.category.findMany({
      where: status ? { status } : {},
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          where: status ? { status } : {},
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    });
  }

  // --- SEGMENTS ---
  listSegments(status: RecordStatus | null = RecordStatus.ACTIVE) {
    return this.prisma.segment.findMany({
      where: status ? { status } : {},
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  async getSegmentById(id: string) {
    const segment = await this.prisma.segment.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              include: productRelations,
            },
          },
        },
        _count: { select: { products: true } },
      },
    });
    if (!segment) throw new NotFoundException('SEGMENT_NOT_FOUND');
    return segment;
  }

  createSegment(input: TaxonomyInput) {
    return this.prisma.segment.create({
      data: {
        name: input.name,
        slug: input.slug || toSlug(input.name),
        description: input.description,
        imagePath: input.imagePath,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  }

  updateSegment(id: string, input: TaxonomyUpdateInput) {
    return this.prisma.segment.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.imagePath !== undefined ? { imagePath: input.imagePath || null } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });
  }

  archiveSegment(id: string) {
    return this.prisma.segment.update({ where: { id }, data: { status: RecordStatus.ARCHIVED } });
  }

  // --- TAGS ---
  listTags(status: RecordStatus | null = RecordStatus.ACTIVE) {
    return this.prisma.tag.findMany({
      where: status ? { status } : {},
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  async getTagById(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              include: productRelations,
            },
          },
        },
        _count: { select: { products: true } },
      },
    });
    if (!tag) throw new NotFoundException('TAG_NOT_FOUND');
    return tag;
  }

  createTag(input: TaxonomyInput) {
    return this.prisma.tag.create({
      data: {
        name: input.name,
        slug: input.slug || toSlug(input.name),
      },
    });
  }

  updateTag(id: string, input: TaxonomyUpdateInput) {
    return this.prisma.tag.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });
  }

  archiveTag(id: string) {
    return this.prisma.tag.update({ where: { id }, data: { status: RecordStatus.ARCHIVED } });
  }

  private async assertProduct(id: string): Promise<void> {
    const exists = await this.prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('PRODUCT_NOT_FOUND');
  }
}

export function normalizeProductSlug(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function toSlug(value: string): string {
  return normalizeProductSlug(value);
}
