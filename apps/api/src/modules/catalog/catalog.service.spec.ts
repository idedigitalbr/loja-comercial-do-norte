import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../database/prisma.service';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  const prisma = new PrismaService();
  const service = new CatalogService(prisma);
  let productId: string;

  beforeAll(async () => {
    await prisma.$connect();
    const product = await prisma.product.create({
      data: {
        name: 'Produto incompleto',
        slug: `produto-incompleto-${Date.now()}`,
      },
    });
    productId = product.id;
  });

  afterEach(async () => {
    await prisma.product.deleteMany({ where: { id: productId } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('does not publish a shippable product without sku, image, weight and dimensions', async () => {
    await expect(service.publish(productId)).rejects.toMatchObject({
      code: 'PRODUCT_INCOMPLETE',
      fields: ['sku', 'mainImage', 'weightGrams', 'widthMm', 'heightMm', 'lengthMm'],
    });
  });
});
