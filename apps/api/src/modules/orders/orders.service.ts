import { ActorType, OrderItemType, OrderStatus } from '@prisma/client';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { canTransition } from './order-status-machine';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService, private readonly inventoryService: InventoryService) {}

  async createFromCart(input: { cartId: string; contactEmail: string; userId?: string }) {
    return this.prisma.$transaction(async (transaction) => {
      const cart = await transaction.cart.findUnique({ where: { id: input.cartId }, include: { items: { include: { variant: { include: { product: true } } } } } });
      if (!cart || !cart.items.length) throw new BadRequestException('CART_EMPTY');
      const subtotalCents = cart.items.reduce((sum, item) => sum + (item.unitPriceCents ?? item.variant.priceCents) * item.quantity, 0);
      const order = await transaction.order.create({
        data: {
          userId: input.userId,
          status: OrderStatus.DRAFT,
          subtotalCents,
          totalCents: subtotalCents,
          contactEmail: input.contactEmail,
          items: {
            create: cart.items.map((item) => ({
              itemType: OrderItemType.PRODUCT_VARIANT,
              variantId: item.variantId,
              name: item.variant.product.name,
              sku: item.variant.sku,
              quantity: item.quantity,
              unitPriceCents: item.unitPriceCents ?? item.variant.priceCents,
              totalCents: (item.unitPriceCents ?? item.variant.priceCents) * item.quantity,
            })),
          },
        },
        include: { items: true },
      });
      await this.inventoryService.reserveInTransaction(transaction, {
        orderId: order.id,
        items: cart.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      });
      await transaction.order.update({ where: { id: order.id }, data: { status: OrderStatus.AWAITING_PAYMENT } });
      await transaction.orderStatusHistory.create({ data: { orderId: order.id, fromStatus: OrderStatus.DRAFT, toStatus: OrderStatus.AWAITING_PAYMENT, actorType: ActorType.USER, actorId: input.userId, source: 'CHECKOUT' } });
      await transaction.cart.update({ where: { id: input.cartId }, data: { status: 'CONVERTED' } });
      return transaction.order.findUnique({ where: { id: order.id }, include: { items: true, statusHistory: true } });
    });
  }

  async transition(orderId: string, toStatus: OrderStatus, input: { actorType: ActorType; actorId?: string; reason?: string; source?: string }) {
    return this.prisma.$transaction(async (transaction) => {
      const order = await transaction.order.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundException('ORDER_NOT_FOUND');
      if (!canTransition(order.status, toStatus)) throw new BadRequestException('INVALID_ORDER_TRANSITION');
      const updated = await transaction.order.update({ where: { id: orderId }, data: { status: toStatus } });
      await transaction.orderStatusHistory.create({ data: { orderId, fromStatus: order.status, toStatus, actorType: input.actorType, actorId: input.actorId, reason: input.reason, source: input.source } });
      return updated;
    });
  }

  getByPublicId(publicId: string) {
    return this.prisma.order.findUnique({ where: { publicId }, include: { items: true, statusHistory: { orderBy: { createdAt: 'asc' } }, payments: true } });
  }
}
