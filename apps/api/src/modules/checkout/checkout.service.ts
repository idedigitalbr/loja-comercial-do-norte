import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { OrdersService } from '../orders/orders.service';

type CheckoutInput = {
  cartId: string;
  contactEmail: string;
  userId?: string;
  shippingCents?: number;
  shippingMethodCode?: string;
  shippingDays?: number;
  shippingAddress?: Record<string, unknown>;
  billingAddress?: Record<string, unknown>;
};

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService, private readonly ordersService: OrdersService) {}

  async prepare(input: CheckoutInput, idempotencyKey: string) {
    if (!idempotencyKey) throw new BadRequestException('IDEMPOTENCY_KEY_REQUIRED');
    const existing = await this.prisma.idempotencyKey.findUnique({ where: { key: idempotencyKey } });
    if (existing?.responseJson && typeof existing.responseJson === 'object' && 'orderPublicId' in existing.responseJson && 'amountCents' in existing.responseJson) {
      return existing.responseJson;
    }

    const cart = await this.prisma.cart.findFirst({ where: { OR: [{ id: input.cartId }, { publicId: input.cartId }] } });
    if (!cart) throw new NotFoundException('CART_NOT_FOUND');
    const order = await this.ordersService.createFromCart({
      ...input,
      cartId: cart.id,
      idempotencyKey,
      shippingAddress: input.shippingAddress as never,
      billingAddress: input.billingAddress as never,
    });
    if (!order) throw new NotFoundException('ORDER_NOT_FOUND');
    const response = {
      orderPublicId: order.publicId,
      amountCents: order.totalCents,
      expiresAt: order.inventoryReservations[0]?.expiresAt.toISOString(),
    };
    const persisted = await this.prisma.idempotencyKey.findUnique({ where: { key: idempotencyKey } });
    if (persisted?.responseJson && typeof persisted.responseJson === 'object' && 'orderPublicId' in persisted.responseJson) return persisted.responseJson;
    return response;
  }

  get(publicId: string) {
    return this.prisma.order.findUnique({ where: { publicId }, include: { items: true, payments: true, statusHistory: { orderBy: { createdAt: 'asc' } } } });
  }
}
