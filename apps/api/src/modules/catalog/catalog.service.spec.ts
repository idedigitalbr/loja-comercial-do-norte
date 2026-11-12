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

  it('does not publish a product without primary image and sku, and publishes with name + image even without price or freight', async () => {
    await expect(service.publish(productId)).rejects.toMatchObject({
      code: 'PRODUCT_INCOMPLETE',
      fields: ['mainImage', 'sku'],
    });

    const ready = await service.createProduct({
      name: 'Produto mínimo publicável',
      slug: `produto-minimo-${Date.now()}`,
      variants: [{ sku: `MIN-${Date.now()}`, priceCents: null }],
      images: [{ path: 'uploads/demo/min.webp', isPrimary: true, sortOrder: 0 }],
    });

    const published = await service.publish(ready.id);
    expect(published.status).toBe('ACTIVE');
    expect(published.auditHealth).toBe('YELLOW');
    expect(published.auditIssueCodes).toEqual(expect.arrayContaining(['SEM_PRECO', 'SEM_PESO_FRETE', 'SEM_DIMENSOES_FRETE']));
    await prisma.product.deleteMany({ where: { id: ready.id } });
  });
});
