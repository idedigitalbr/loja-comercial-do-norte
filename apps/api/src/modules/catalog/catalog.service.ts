import { CatalogAuditHealth, PricingMode, Prisma, ProductStockStatus, RecordStatus } from '@prisma/client';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { evaluateProductHealth, evaluateVariantHealth, isVariantFreightReady } from './catalog-health';

export type CreateProductInput = {
  name: string;
  rawCatalogName?: string | null;
  slug?: string;
  description?: string | null;
  rawDescription?: string | null;
  brandId?: string | null;
  brandMatchNote?: string | null;
  sourcePdfPage?: number | null;
  sourcePrintedPage?: number | null;
  sourceSection?: string | null;
  sourceRawText?: string | null;
  auditConfidence?: number | null;
  extraIssueCodes?: string[];
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
  variantName?: string | null;
  pricingMode?: PricingMode;
  priceCents?: number | null;
  compareAtPriceCents?: number | null;
  gtinRaw?: string | null;
  gtinStatus?: string | null;
  gtinValid?: boolean | null;
  manufacturerRef?: string | null;
  ncm?: string | null;
  color?: string | null;
  sizeOrModel?: string | null;
  capacityOrVolume?: string | null;
  material?: string | null;
  packagingRaw?: string | null;
  packagingType?: string | null;
  packagingUnit?: string | null;
  packagingFactor1?: number | null;
  packagingFactor2?: number | null;
  packagingTotalUnits?: number | null;
  reportedNetWeight?: string | null;
  dimensionsRaw?: string | null;
  internalDimensions?: string | null;
  externalDimensions?: string | null;
  diameterText?: string | null;
  heightText?: string | null;
  individualVolumeText?: string | null;
  weightGrams?: number | null;
  widthMm?: number | null;
  heightMm?: number | null;
  lengthMm?: number | null;
  inventoryQuantity?: number;
  manageStock?: boolean;
  stockStatus?: ProductStockStatus;
  lowStockThreshold?: number | null;
  extraIssueCodes?: string[];
};

export type ProductImageInput = {
  path: string;
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
  variantId?: string | null;
  imageStatus?: string | null;
  imageSourceMethod?: string | null;
  imageConfidence?: number | null;
  sha256?: string | null;
  widthPx?: number | null;
  heightPx?: number | null;
  sourceOriginalPath?: string | null;
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

function parseFilterList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => parseFilterList(item));
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

@Injectable()
export class CatalogService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private buildVariantPersistenceData(variant: ProductVariantInput) {
    const normalizedPrice = variant.priceCents !== undefined && variant.priceCents !== null && variant.priceCents > 0
      ? variant.priceCents
      : variant.priceCents === 0 && variant.pricingMode === PricingMode.FIXED_PRICE
        ? 0
        : null;
    const pricingMode = normalizedPrice !== null
      ? PricingMode.FIXED_PRICE
      : (variant.pricingMode ?? PricingMode.QUOTE_ONLY);
    const freightReady = isVariantFreightReady(variant);
    const variantHealth = evaluateVariantHealth({
      sku: variant.sku,
      priceCents: normalizedPrice,
      weightGrams: variant.weightGrams,
      widthMm: variant.widthMm,
      heightMm: variant.heightMm,
      lengthMm: variant.lengthMm,
      gtinRaw: variant.gtinRaw,
      gtinStatus: variant.gtinStatus,
      gtinValid: variant.gtinValid,
      extraIssueCodes: variant.extraIssueCodes,
    });

    return {
      sku: variant.sku,
      variantName: variant.variantName,
      pricingMode,
      priceCents: normalizedPrice,
      compareAtPriceCents: variant.compareAtPriceCents,
      gtinRaw: variant.gtinRaw,
      gtinStatus: variant.gtinStatus,
      gtinValid: variant.gtinValid,
      manufacturerRef: variant.manufacturerRef,
      ncm: variant.ncm,
      color: variant.color,
      sizeOrModel: variant.sizeOrModel,
      capacityOrVolume: variant.capacityOrVolume,
      material: variant.material,
      packagingRaw: variant.packagingRaw,
      packagingType: variant.packagingType,
      packagingUnit: variant.packagingUnit,
      packagingFactor1: variant.packagingFactor1,
      packagingFactor2: variant.packagingFactor2,
      packagingTotalUnits: variant.packagingTotalUnits,
      reportedNetWeight: variant.reportedNetWeight,
      dimensionsRaw: variant.dimensionsRaw,
      internalDimensions: variant.internalDimensions,
      externalDimensions: variant.externalDimensions,
      diameterText: variant.diameterText,
      heightText: variant.heightText,
      individualVolumeText: variant.individualVolumeText,
      weightGrams: variant.weightGrams,
      widthMm: variant.widthMm,
      heightMm: variant.heightMm,
      lengthMm: variant.lengthMm,
      freightReady,
      auditHealth: variantHealth.auditHealth,
      auditIssueCodes: variantHealth.auditIssueCodes,
      auditIssues: variantHealth.auditIssues as unknown as Prisma.InputJsonValue,
      manageStock: variant.manageStock,
      stockStatus: variant.stockStatus,
      lowStockThreshold: variant.lowStockThreshold,
    };
  }

  private async recalculateAndPersistProductHealth(
    transaction: Prisma.TransactionClient,
    productId: string,
    extraIssueCodes?: string[],
  ) {
    const product = await transaction.product.findUnique({
      where: { id: productId },
      include: {
        variants: { where: { status: { not: RecordStatus.ARCHIVED } }, orderBy: { createdAt: 'asc' } },
        images: true,
        categories: { select: { categoryId: true } },
      },
    });
    if (!product) throw new NotFoundException('PRODUCT_NOT_FOUND');

    const retainedCatalogIssues = product.auditIssueCodes.filter((code) =>
      ['CODIGO_DUPLICADO', 'CONFLITO_SOBREPOSICAO_PDF', 'ESPECIFICACAO_SUSPEITA'].includes(code),
    );
    const mergedExtra = [...retainedCatalogIssues, ...(extraIssueCodes ?? [])];

    const health = evaluateProductHealth({
      name: product.name,
      description: product.description,
      brandId: product.brandId,
      hasCategory: product.categories.length > 0,
      images: product.images,
      variants: product.variants.map((variant) => ({
        sku: variant.sku,
        priceCents: variant.priceCents,
        weightGrams: variant.weightGrams,
        widthMm: variant.widthMm,
        heightMm: variant.heightMm,
        lengthMm: variant.lengthMm,
        gtinRaw: variant.gtinRaw,
        gtinStatus: variant.gtinStatus,
        gtinValid: variant.gtinValid,
        extraIssueCodes: variant.auditIssueCodes,
      })),
      extraIssueCodes: mergedExtra,
    });

    return transaction.product.update({
      where: { id: productId },
      data: {
        auditHealth: health.auditHealth,
        auditIssueCodes: health.auditIssueCodes,
        auditIssues: health.auditIssues as unknown as Prisma.InputJsonValue,
      },
      include: productRelations,
    });
  }

  async createProduct(input: CreateProductInput) {
    return this.prisma.$transaction(async (transaction) => {
      const created = await transaction.product.create({
        data: {
          name: input.name,
          rawCatalogName: input.rawCatalogName,
          slug: normalizeProductSlug(input.slug || input.name),
          description: input.description,
          rawDescription: input.rawDescription,
          brandId: input.brandId,
          brandMatchNote: input.brandMatchNote,
          sourcePdfPage: input.sourcePdfPage,
          sourcePrintedPage: input.sourcePrintedPage,
          sourceSection: input.sourceSection,
          sourceRawText: input.sourceRawText,
          auditConfidence: input.auditConfidence,
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
                  ...this.buildVariantPersistenceData(variant),
                  inventoryBalance: { create: { physicalQuantity: variant.inventoryQuantity ?? 0 } },
                })),
              }
            : undefined,
          images: input.images?.length ? { create: input.images } : undefined,
        },
        select: { id: true },
      });

      return this.recalculateAndPersistProductHealth(transaction, created.id, input.extraIssueCodes);
    });
  }

  async updateProduct(id: string, input: UpdateProductInput) {
    await this.assertProduct(id);
    return this.prisma.$transaction(async (transaction) => {
      await transaction.product.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.rawCatalogName !== undefined ? { rawCatalogName: input.rawCatalogName } : {}),
          ...(input.slug !== undefined ? { slug: input.slug } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.rawDescription !== undefined ? { rawDescription: input.rawDescription } : {}),
          ...(input.brandId !== undefined ? { brandId: input.brandId || null } : {}),
          ...(input.brandMatchNote !== undefined ? { brandMatchNote: input.brandMatchNote } : {}),
          ...(input.sourcePdfPage !== undefined ? { sourcePdfPage: input.sourcePdfPage } : {}),
          ...(input.sourcePrintedPage !== undefined ? { sourcePrintedPage: input.sourcePrintedPage } : {}),
          ...(input.sourceSection !== undefined ? { sourceSection: input.sourceSection } : {}),
          ...(input.sourceRawText !== undefined ? { sourceRawText: input.sourceRawText } : {}),
          ...(input.auditConfidence !== undefined ? { auditConfidence: input.auditConfidence } : {}),
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
      });

      if (input.images) {
        await transaction.productImage.deleteMany({ where: { productId: id } });
        if (input.images.length) await transaction.productImage.createMany({ data: input.images.map((image) => ({ ...image, productId: id })) });
      }

      for (const variant of input.variants ?? []) {
        const variantData = this.buildVariantPersistenceData(variant);
        if (variant.id) {
          await transaction.productVariant.update({
            where: { id: variant.id },
            data: variantData,
          });
          if (variant.inventoryQuantity !== undefined) {
            await transaction.inventoryBalance.upsert({
              where: { variantId: variant.id },
              create: { variantId: variant.id, physicalQuantity: variant.inventoryQuantity },
              update: { physicalQuantity: variant.inventoryQuantity },
            });
          }
        } else {
          await transaction.productVariant.create({
            data: {
              productId: id,
              ...variantData,
              inventoryBalance: { create: { physicalQuantity: variant.inventoryQuantity ?? 0 } },
            },
          });
        }
      }

      return this.recalculateAndPersistProductHealth(transaction, id, input.extraIssueCodes);
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
      include: {
        variants: { where: { status: { not: RecordStatus.ARCHIVED } }, orderBy: { createdAt: 'asc' } },
        images: true,
        categories: { select: { categoryId: true } },
      },
    });
    if (!product) throw new NotFoundException('PRODUCT_NOT_FOUND');

    const health = evaluateProductHealth({
      name: product.name,
      description: product.description,
      brandId: product.brandId,
      hasCategory: product.categories.length > 0,
      images: product.images,
      variants: product.variants.map((variant) => ({
        sku: variant.sku,
        priceCents: variant.priceCents,
        weightGrams: variant.weightGrams,
        widthMm: variant.widthMm,
        heightMm: variant.heightMm,
        lengthMm: variant.lengthMm,
        gtinRaw: variant.gtinRaw,
        gtinStatus: variant.gtinStatus,
        gtinValid: variant.gtinValid,
        extraIssueCodes: variant.auditIssueCodes,
      })),
      extraIssueCodes: product.auditIssueCodes,
    });

    if (health.missingPublishFields.length) {
      throw new ProductIncompleteError(health.missingPublishFields);
    }

    return this.prisma.$transaction(async (transaction) => {
      await transaction.productVariant.updateMany({
        where: { productId: id, status: RecordStatus.DRAFT },
        data: { status: RecordStatus.ACTIVE },
      });
      return transaction.product.update({
        where: { id },
        data: {
          status: RecordStatus.ACTIVE,
          auditHealth: health.auditHealth,
          auditIssueCodes: health.auditIssueCodes,
          auditIssues: health.auditIssues as unknown as Prisma.InputJsonValue,
        },
        include: productRelations,
      });
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
    brandId?: string | string[];
    categoryId?: string | string[];
    segmentId?: string | string[];
    tagId?: string | string[];
    segment?: string | string[];
    tag?: string | string[];
    brand?: string | string[];
    category?: string | string[];
    status?: RecordStatus | null;
    health?: CatalogAuditHealth;
    issueCode?: string;
    limit?: number;
  } = {}) {
    const baseWhere = await this.buildPublicWhere(input);
    const where: Prisma.ProductWhereInput = {
      ...baseWhere,
      ...(input.health ? { auditHealth: input.health } : {}),
      ...(input.issueCode ? { auditIssueCodes: { has: input.issueCode } } : {}),
    };
    const take =
      input.limit !== undefined && Number.isFinite(input.limit) && input.limit > 0
        ? Math.min(200, Math.trunc(input.limit))
        : undefined;
    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...(take ? { take } : {}),
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
        variants: { some: { status: RecordStatus.ACTIVE, priceCents: { not: null, gt: 0 }, compareAtPriceCents: { gt: 0 } } },
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
    brand?: string | string[];
    category?: string | string[];
    segment?: string | string[];
    tag?: string | string[];
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
              priceCents: { not: null, gt: 0 },
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
    brandId?: string | string[];
    categoryId?: string | string[];
    segmentId?: string | string[];
    tagId?: string | string[];
    brand?: string | string[];
    category?: string | string[];
    segment?: string | string[];
    tag?: string | string[];
    status?: RecordStatus | null;
  }): Promise<Prisma.ProductWhereInput> {
    const brandSlugs = parseFilterList(input.brand);
    const brandIds = parseFilterList(input.brandId);
    const categorySlugs = parseFilterList(input.category);
    const categoryIds = parseFilterList(input.categoryId);
    const segmentSlugs = parseFilterList(input.segment);
    const segmentIds = parseFilterList(input.segmentId);
    const tagSlugs = parseFilterList(input.tag);
    const tagIds = parseFilterList(input.tagId);

    const resolveBrand = async (slugOrId: { slug?: string; id?: string }) => {
      if (slugOrId.id) {
        return this.prisma.brand.findUnique({
          where: { id: slugOrId.id },
          select: { id: true, children: { select: { id: true } } },
        });
      }
      if (slugOrId.slug) {
        return this.prisma.brand.findUnique({
          where: { slug: slugOrId.slug },
          select: { id: true, children: { select: { id: true } } },
        });
      }
      return null;
    };

    const resolveCategory = async (slugOrId: { slug?: string; id?: string }) => {
      if (slugOrId.id) {
        return this.prisma.category.findUnique({
          where: { id: slugOrId.id },
          select: { id: true },
        });
      }
      if (slugOrId.slug) {
        return this.prisma.category.findUnique({
          where: { slug: slugOrId.slug },
          select: { id: true },
        });
      }
      return null;
    };

    const resolveSegment = async (slugOrId: { slug?: string; id?: string }) => {
      if (slugOrId.id) {
        return this.prisma.segment.findUnique({
          where: { id: slugOrId.id },
          select: { id: true },
        });
      }
      if (slugOrId.slug) {
        return this.prisma.segment.findUnique({
          where: { slug: slugOrId.slug },
          select: { id: true },
        });
      }
      return null;
    };

    const resolveTag = async (slugOrId: { slug?: string; id?: string }) => {
      if (slugOrId.id) {
        return this.prisma.tag.findUnique({
          where: { id: slugOrId.id },
          select: { id: true },
        });
      }
      if (slugOrId.slug) {
        return this.prisma.tag.findUnique({
          where: { slug: slugOrId.slug },
          select: { id: true },
        });
      }
      return null;
    };

    const [brands, categories, segments, tags] = await Promise.all([
      Promise.all([
        ...brandIds.map((id) => resolveBrand({ id })),
        ...brandSlugs.map((slug) => resolveBrand({ slug })),
      ]),
      Promise.all([
        ...categoryIds.map((id) => resolveCategory({ id })),
        ...categorySlugs.map((slug) => resolveCategory({ slug })),
      ]),
      Promise.all([
        ...segmentIds.map((id) => resolveSegment({ id })),
        ...segmentSlugs.map((slug) => resolveSegment({ slug })),
      ]),
      Promise.all([
        ...tagIds.map((id) => resolveTag({ id })),
        ...tagSlugs.map((slug) => resolveTag({ slug })),
      ]),
    ]);

    const validBrands = brands.filter((b): b is NonNullable<typeof b> => Boolean(b));
    const resolvedBrandIds = Array.from(
      new Set(validBrands.flatMap((b) => [b.id, ...(b.children?.map((child) => child.id) ?? [])]))
    );
    if ((brandSlugs.length > 0 || brandIds.length > 0) && resolvedBrandIds.length === 0) {
      resolvedBrandIds.push('__unknown_brand__');
    }

    const validCategories = categories.filter((c): c is NonNullable<typeof c> => Boolean(c));
    const allDescendantLists = await Promise.all(
      validCategories.map((c) => this.categoryIdsWithDescendants(c.id))
    );
    const resolvedCategoryIds = Array.from(new Set(allDescendantLists.flat()));
    if ((categorySlugs.length > 0 || categoryIds.length > 0) && resolvedCategoryIds.length === 0) {
      resolvedCategoryIds.push('__unknown_category__');
    }

    const validSegments = segments.filter((s): s is NonNullable<typeof s> => Boolean(s));
    const resolvedSegmentIds = Array.from(new Set(validSegments.map((s) => s.id)));
    if ((segmentSlugs.length > 0 || segmentIds.length > 0) && resolvedSegmentIds.length === 0) {
      resolvedSegmentIds.push('__unknown_segment__');
    }

    const validTags = tags.filter((t): t is NonNullable<typeof t> => Boolean(t));
    const resolvedTagIds = Array.from(new Set(validTags.map((t) => t.id)));
    if ((tagSlugs.length > 0 || tagIds.length > 0) && resolvedTagIds.length === 0) {
      resolvedTagIds.push('__unknown_tag__');
    }

    return {
      ...(input.status === undefined ? { status: RecordStatus.ACTIVE } : input.status ? { status: input.status } : {}),
      ...(resolvedBrandIds.length === 1 ? { brandId: resolvedBrandIds[0] } : resolvedBrandIds.length > 1 ? { brandId: { in: resolvedBrandIds } } : {}),
      ...(resolvedCategoryIds.length ? { categories: { some: { categoryId: { in: resolvedCategoryIds } } } } : (categorySlugs.length || categoryIds.length) ? { categories: { some: { categoryId: '__unknown_category__' } } } : {}),
      ...(resolvedSegmentIds.length === 1 ? { segments: { some: { segmentId: resolvedSegmentIds[0] } } } : resolvedSegmentIds.length > 1 ? { segments: { some: { segmentId: { in: resolvedSegmentIds } } } } : (segmentSlugs.length || segmentIds.length) ? { segments: { some: { segmentId: '__unknown_segment__' } } } : {}),
      ...(resolvedTagIds.length === 1 ? { tags: { some: { tagId: resolvedTagIds[0] } } } : resolvedTagIds.length > 1 ? { tags: { some: { tagId: { in: resolvedTagIds } } } } : (tagSlugs.length || tagIds.length) ? { tags: { some: { tagId: '__unknown_tag__' } } } : {}),
      ...(input.search?.trim()
        ? {
            OR: [
              { name: { contains: input.search.trim(), mode: Prisma.QueryMode.insensitive } },
              { slug: { contains: normalizeProductSlug(input.search) } },
              { description: { contains: input.search.trim(), mode: Prisma.QueryMode.insensitive } },
              { brand: { name: { contains: input.search.trim(), mode: Prisma.QueryMode.insensitive } } },
              { categories: { some: { category: { name: { contains: input.search.trim(), mode: Prisma.QueryMode.insensitive } } } } },
              { segments: { some: { segment: { name: { contains: input.search.trim(), mode: Prisma.QueryMode.insensitive } } } } },
              { tags: { some: { tag: { name: { contains: input.search.trim(), mode: Prisma.QueryMode.insensitive } } } } },
              { variants: { some: { sku: { contains: input.search.trim(), mode: Prisma.QueryMode.insensitive } } } },
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
    const productCountSelect = status ? { where: { status } } : true;
    const childCountSelect = status ? { where: { status } } : true;

    return this.prisma.brand.findMany({
      where: status ? { status } : {},
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
      include: {
        parent: true,
        _count: {
          select: { products: productCountSelect, children: childCountSelect },
        },
        children: {
          where: status ? { status } : {},
          orderBy: { name: 'asc' },
          include: { _count: { select: { products: productCountSelect } } },
        },
      },
    });
  }

  async listCategories(status: RecordStatus | null = RecordStatus.ACTIVE) {
    const joinCountSelect = status ? { where: { product: { status } } } : true;
    const childCountSelect = status ? { where: { status } } : true;

    const categories = await this.prisma.category.findMany({
      where: status ? { status } : {},
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        _count: {
          select: { products: joinCountSelect, children: childCountSelect },
        },
        children: {
          where: status ? { status } : {},
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          include: { _count: { select: { products: joinCountSelect } } },
        },
      },
    });

    return this.attachCategorySubtreeProductCounts(categories, status);
  }

  private async attachCategorySubtreeProductCounts<
    T extends {
      id: string;
      parentId?: string | null;
      _count?: Record<string, number>;
      children?: Array<{ id: string; _count?: Record<string, number> }>;
    },
  >(categories: T[], status: RecordStatus | null): Promise<T[]> {
    if (
      categories.length === 0 ||
      typeof this.prisma.productCategory?.findMany !== 'function'
    ) {
      return categories;
    }

    const allCategoryIds = new Set<string>();
    const childrenByParentId = new Map<string, Set<string>>();

    const addChildEdge = (parentId: string, childId: string) => {
      let children = childrenByParentId.get(parentId);
      if (!children) {
        children = new Set<string>();
        childrenByParentId.set(parentId, children);
      }
      children.add(childId);
    };

    for (const cat of categories) {
      allCategoryIds.add(cat.id);
      if (cat.parentId) {
        addChildEdge(cat.parentId, cat.id);
      }
      for (const child of cat.children ?? []) {
        allCategoryIds.add(child.id);
        addChildEdge(cat.id, child.id);
      }
    }

    const links = await this.prisma.productCategory.findMany({
      where: {
        categoryId: { in: [...allCategoryIds] },
        ...(status ? { product: { status } } : {}),
      },
      select: {
        categoryId: true,
        productId: true,
      },
    });

    const directProductsByCategoryId = new Map<string, Set<string>>();
    for (const link of links) {
      let products = directProductsByCategoryId.get(link.categoryId);
      if (!products) {
        products = new Set<string>();
        directProductsByCategoryId.set(link.categoryId, products);
      }
      products.add(link.productId);
    }

    const subtreeCountCache = new Map<string, number>();
    const getSubtreeProductCount = (rootCategoryId: string): number => {
      const cached = subtreeCountCache.get(rootCategoryId);
      if (cached !== undefined) {
        return cached;
      }

      const visited = new Set<string>();
      const distinctProducts = new Set<string>();
      const queue = [rootCategoryId];

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        const direct = directProductsByCategoryId.get(currentId);
        if (direct) {
          for (const productId of direct) {
            distinctProducts.add(productId);
          }
        }

        const childIds = childrenByParentId.get(currentId);
        if (childIds) {
          for (const childId of childIds) {
            if (!visited.has(childId)) {
              queue.push(childId);
            }
          }
        }
      }

      const count = distinctProducts.size;
      subtreeCountCache.set(rootCategoryId, count);
      return count;
    };

    return categories.map((cat) => ({
      ...cat,
      _count: {
        ...(cat._count ?? {}),
        products: getSubtreeProductCount(cat.id),
      },
      ...(cat.children
        ? {
            children: cat.children.map((child) => ({
              ...child,
              _count: {
                ...(child._count ?? {}),
                products: getSubtreeProductCount(child.id),
              },
            })),
          }
        : {}),
    }));
  }

  // --- SEGMENTS ---
  listSegments(status: RecordStatus | null = RecordStatus.ACTIVE) {
    const joinCountSelect = status ? { where: { product: { status } } } : true;

    return this.prisma.segment.findMany({
      where: status ? { status } : {},
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { products: joinCountSelect } },
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
