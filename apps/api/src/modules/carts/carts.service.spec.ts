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
    await prisma.productImage.create({ data: { productId, variantId, path: '/storage/cart-product.jpg', isPrimary: true } });
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

  it('returns product and variant images for cart previews', async () => {
    await service.addItem({ cartId, variantId, quantity: 1 });
    const cart = await service.getByPublicId((await prisma.cart.findUniqueOrThrow({ where: { id: cartId }, select: { publicId: true } })).publicId);
    expect(cart.items[0]?.variant.product.images[0]).toMatchObject({ path: '/storage/cart-product.jpg', isPrimary: true });
  });
});
