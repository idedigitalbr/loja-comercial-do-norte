import { CartStatus } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';

export type AddCartItemInput = {
  cartId: string;
  variantId: string;
  quantity: number;
  clientPriceCents?: number;
};

@Injectable()
export class CartsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAnonymousCart() {
    return this.prisma.cart.create({
      data: {
        anonymousToken: randomBytes(32).toString('base64url'),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  async getByPublicId(publicId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { publicId },
      include: { items: { include: { variant: { include: { product: true } } } } },
    });
    if (!cart) throw new NotFoundException('CART_NOT_FOUND');
    return this.snapshot(cart);
  }

  async addItem(input: AddCartItemInput) {
    if (!Number.isInteger(input.quantity) || input.quantity < 1) throw new Error('INVALID_QUANTITY');
    const variant = await this.prisma.productVariant.findUnique({ where: { id: input.variantId } });
    if (!variant) throw new NotFoundException('VARIANT_NOT_FOUND');
    const cart = await this.prisma.cart.findUnique({ where: { id: input.cartId } });
    if (!cart || cart.status !== CartStatus.ACTIVE) throw new NotFoundException('CART_NOT_FOUND');

    await this.prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: input.cartId, variantId: input.variantId } },
      create: { cartId: input.cartId, variantId: input.variantId, quantity: input.quantity, unitPriceCents: variant.priceCents },
      update: { quantity: { increment: input.quantity }, unitPriceCents: variant.priceCents },
    });
    return this.getById(input.cartId);
  }

  async updateItem(cartId: string, variantId: string, quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error('INVALID_QUANTITY');
    const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) throw new NotFoundException('VARIANT_NOT_FOUND');
    await this.prisma.cartItem.update({
      where: { cartId_variantId: { cartId, variantId } },
      data: { quantity, unitPriceCents: variant.priceCents },
    });
    return this.getById(cartId);
  }

  async removeItem(cartId: string, variantId: string) {
    await this.prisma.cartItem.delete({ where: { cartId_variantId: { cartId, variantId } } });
    return this.getById(cartId);
  }

  async mergeAfterLogin(cartId: string, userId: string) {
    await this.prisma.cart.update({ where: { id: cartId }, data: { userId } });
    return this.getById(cartId);
  }

  private async getById(id: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id },
      include: { items: { include: { variant: { include: { product: true } } } } },
    });
    if (!cart) throw new NotFoundException('CART_NOT_FOUND');
    return this.snapshot(cart);
  }

  private snapshot(cart: {
    id: string;
    publicId: string;
    items: Array<{ quantity: number; unitPriceCents: number | null }>;
  }) {
    const items = cart.items.map((item) => ({ ...item, unitPriceCents: item.unitPriceCents ?? 0 }));
    return {
      id: cart.id,
      publicId: cart.publicId,
      items,
      subtotalCents: items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0),
    };
  }
}
