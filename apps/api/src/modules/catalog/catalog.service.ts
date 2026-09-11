import { Prisma, RecordStatus } from '@prisma/client';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export type CreateProductInput = {
  name: string;
  slug: string;
  description?: string;
  brandId?: string;
  categoryIds?: string[];
};

export type UpdateProductInput = Partial<CreateProductInput>;

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
  brand: true,
  categories: { include: { category: true } },
  variants: { include: { images: true } },
  images: { orderBy: { sortOrder: 'asc' as const } },
} as const;

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(input: CreateProductInput) {
    return this.prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        brandId: input.brandId,
        categories: input.categoryIds?.length
          ? { create: input.categoryIds.map((categoryId) => ({ categoryId })) }
          : undefined,
      },
      include: productRelations,
    });
  }

  async updateProduct(id: string, input: UpdateProductInput) {
    await this.assertProduct(id);
    return this.prisma.product.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        brandId: input.brandId,
      },
      include: productRelations,
    });
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

  listProducts(input: { search?: string; brandId?: string; categoryId?: string; status?: RecordStatus } = {}) {
    const where: Prisma.ProductWhereInput = {
      status: input.status ?? RecordStatus.ACTIVE,
      ...(input.brandId ? { brandId: input.brandId } : {}),
      ...(input.categoryId ? { categories: { some: { categoryId: input.categoryId } } } : {}),
      ...(input.search
        ? { OR: [{ name: { startsWith: input.search } }, { slug: { startsWith: input.search } }] }
        : {}),
    };
    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: productRelations,
    });
  }

  async getProductBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: productRelations,
    });
    if (!product) throw new NotFoundException('PRODUCT_NOT_FOUND');
    return product;
  }

  listBrands(status: RecordStatus = RecordStatus.ACTIVE) {
    return this.prisma.brand.findMany({ where: { status }, orderBy: { name: 'asc' } });
  }

  listCategories(status: RecordStatus = RecordStatus.ACTIVE) {
    return this.prisma.category.findMany({ where: { status }, orderBy: { name: 'asc' } });
  }

  private async assertProduct(id: string): Promise<void> {
    const exists = await this.prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('PRODUCT_NOT_FOUND');
  }
}
