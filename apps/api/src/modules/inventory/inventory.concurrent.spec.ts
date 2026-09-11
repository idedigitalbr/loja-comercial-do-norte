import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../database/prisma.service';
import { InventoryService } from './inventory.service';

describe('InventoryService concurrency', () => {
  const prisma = new PrismaService();
  const service = new InventoryService(prisma);
  let productId: string;
  let variantId: string;
  let orderA: string;
  let orderB: string;

  beforeAll(async () => {
    await prisma.$connect();
    const product = await prisma.product.create({ data: { name: 'Produto estoque', slug: `produto-estoque-${Date.now()}` } });
    productId = product.id;
    const variant = await prisma.productVariant.create({ data: { productId, sku: `STOCK-${Date.now()}`, priceCents: 10_000 } });
    variantId = variant.id;
    await prisma.inventoryBalance.create({ data: { variantId, physicalQuantity: 1 } });
    const common = { subtotalCents: 10_000, totalCents: 10_000, contactEmail: 'estoque@teste.local' };
    const createdA = await prisma.order.create({ data: common });
    const createdB = await prisma.order.create({ data: common });
    orderA = createdA.id;
    orderB = createdB.id;
  });

  afterAll(async () => {
    await prisma.stockMovement.deleteMany({ where: { variantId } });
    await prisma.inventoryReservation.deleteMany({ where: { variantId } });
    await prisma.inventoryBalance.deleteMany({ where: { variantId } });
    await prisma.order.deleteMany({ where: { id: { in: [orderA, orderB] } } });
    await prisma.product.deleteMany({ where: { id: productId } });
    await prisma.$disconnect();
  });

  it('allows only one reservation for the final unit', async () => {
    const results = await Promise.allSettled([
      service.reserve({ orderId: orderA, items: [{ variantId, quantity: 1 }] }),
      service.reserve({ orderId: orderB, items: [{ variantId, quantity: 1 }] }),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
  });
});
