import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../database/prisma.service';
import { CartsService } from './carts.service';

describe('CartsService', () => {
  const prisma = new PrismaService();
  const service = new CartsService(prisma);
  let productId: string;
  let variantId: string;
  let cartId: string;

  beforeAll(async () => {
    await prisma.$connect();
    const product = await prisma.product.create({ data: { name: 'Produto carrinho', slug: `produto-carrinho-${Date.now()}` } });
    productId = product.id;
    const variant = await prisma.productVariant.create({ data: { productId, sku: `CART-${Date.now()}`, priceCents: 19_000 } });
    variantId = variant.id;
    const cart = await prisma.cart.create({ data: { anonymousToken: `cart-token-${Date.now()}` } });
    cartId = cart.id;
  });

  afterAll(async () => {
    await prisma.cart.deleteMany({ where: { id: cartId } });
    await prisma.product.deleteMany({ where: { id: productId } });
    await prisma.$disconnect();
  });

  it('recalculates server price and ignores client totals', async () => {
    const cart = await service.addItem({ cartId, variantId, quantity: 2, clientPriceCents: 1 });
    expect(cart.subtotalCents).toBe(38_000);
  });
});
