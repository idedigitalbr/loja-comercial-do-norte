import { afterAll, afterEach, describe, expect, it } from 'vitest';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  const prisma = new PrismaService();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    await prisma.productVariant.deleteMany({
      where: { sku: { startsWith: 'TEST-' } },
    });
    await prisma.product.deleteMany({
      where: { slug: { startsWith: 'produto-de-teste-' } },
    });
  });

  it('connects to MySQL and stores money as integer cents', async () => {
    const uniqueSuffix = Date.now().toString();
    const product = await prisma.product.create({
      data: {
        name: 'Produto de teste',
        slug: `produto-de-teste-${uniqueSuffix}`,
        status: 'DRAFT',
      },
    });
    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: `TEST-${uniqueSuffix}`,
        priceCents: 19000,
      },
    });

    expect(variant.priceCents).toBe(19000);
  });
});
