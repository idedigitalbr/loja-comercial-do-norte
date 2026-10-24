import { Prisma, ProductStockStatus, RecordStatus } from '@prisma/client';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export type CreateProductInput = {
  name: string;
  slug?: string;
  description?: string;
  brandId?: string;
  categoryIds?: string[];
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

  createCategory(input: TaxonomyInput) {
    return this.prisma.category.create({ data: { name: input.name, slug: input.slug || toSlug(input.name) } });
  }

  updateCategory(id: string, input: TaxonomyUpdateInput) {
    return this.prisma.category.update({ where: { id }, data: { ...(input.name !== undefined ? { name: input.name } : {}), ...(input.slug !== undefined ? { slug: input.slug } : {}), ...(input.status !== undefined ? { status: input.status } : {}) } });
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
    brand?: string;
    category?: string;
    status?: RecordStatus | null;
  } = {}) {
    const [brand, category] = await Promise.all([
      input.brand || input.brandId
        ? this.prisma.brand.findUnique({ where: input.brandId ? { id: input.brandId } : { slug: input.brand }, select: { id: true, children: { select: { id: true } } } })
        : null,
      input.category && !input.categoryId
        ? this.prisma.category.findUnique({ where: { slug: input.category }, select: { id: true } })
        : null,
    ]);
    const resolvedBrandIds = brand ? [brand.id, ...(brand.children?.map((child) => child.id) ?? [])] : input.brand || input.brandId ? ['__unknown_brand__'] : [];
    const resolvedCategoryId = input.categoryId ?? (input.category ? category?.id ?? '__unknown_category__' : undefined);
    const where: Prisma.ProductWhereInput = {
      ...(input.status === undefined ? { status: RecordStatus.ACTIVE } : input.status ? { status: input.status } : {}),
      ...(resolvedBrandIds.length === 1 ? { brandId: resolvedBrandIds[0] } : resolvedBrandIds.length > 1 ? { brandId: { in: resolvedBrandIds } } : {}),
      ...(resolvedCategoryId ? { categories: { some: { categoryId: resolvedCategoryId } } } : {}),
      ...(input.search?.trim()
        ? {
            OR: [
              { name: { contains: input.search.trim(), mode: Prisma.QueryMode.insensitive } },
              { slug: { contains: normalizeProductSlug(input.search) } },
            ],
          }
        : {}),
    };
    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: productRelations,
    });
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
    return this.prisma.category.findMany({ where: status ? { status } : {}, orderBy: { name: 'asc' } });
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
