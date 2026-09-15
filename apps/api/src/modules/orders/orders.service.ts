import { ActorType, EmailEventKey, OrderItemType, OrderStatus, Prisma } from '@prisma/client';
import { BadRequestException, Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { assertIdempotencyScope } from '../../common/idempotency/idempotency';
import { PrismaService } from '../database/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { NotificationsService } from '../notifications/notifications.service';
import { canTransition } from './order-status-machine';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(InventoryService) private readonly inventoryService: InventoryService,
    @Optional() @Inject(NotificationsService) private readonly notifications?: NotificationsService,
  ) {}

  async createFromCart(input: {
    cartId: string;
    contactEmail: string;
    userId?: string;
    idempotencyKey?: string;
    shippingCents?: number;
    shippingMethodCode?: string;
    shippingDays?: number;
    shippingAddress?: Prisma.InputJsonValue;
    billingAddress?: Prisma.InputJsonValue;
  }) {
    return this.prisma.$transaction(async (transaction) => {
      if (input.idempotencyKey) {
        const existing = await transaction.idempotencyKey.findUnique({ where: { key: input.idempotencyKey } });
        assertIdempotencyScope(existing, `checkout:${input.cartId}`);
        if (existing?.responseJson && typeof existing.responseJson === 'object' && 'orderPublicId' in existing.responseJson) {
          return transaction.order.findUnique({ where: { publicId: String(existing.responseJson.orderPublicId) }, include: { items: true, statusHistory: true, inventoryReservations: true } });
        }
      }
      const cart = await transaction.cart.findUnique({ where: { id: input.cartId }, include: { items: { include: { variant: { include: { product: true } } } } } });
      if (!cart || !cart.items.length) throw new BadRequestException('CART_EMPTY');
      const subtotalCents = cart.items.reduce((sum, item) => sum + (item.unitPriceCents ?? item.variant.priceCents) * item.quantity, 0);
      const shippingCents = input.shippingCents ?? 0;
      if (!Number.isInteger(shippingCents) || shippingCents < 0) throw new BadRequestException('INVALID_SHIPPING_AMOUNT');
      const order = await transaction.order.create({
        data: {
          userId: input.userId,
          status: OrderStatus.DRAFT,
          subtotalCents,
          shippingCents,
          totalCents: subtotalCents + shippingCents,
          contactEmail: input.contactEmail,
          shippingMethodCode: input.shippingMethodCode,
          shippingDays: input.shippingDays,
          shippingAddressJson: input.shippingAddress,
          billingAddressJson: input.billingAddress,
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
      const result = await transaction.order.findUnique({ where: { id: order.id }, include: { items: true, statusHistory: true, inventoryReservations: true } });
      if (result) {
        try {
          await this.notifications?.enqueue(EmailEventKey.ORDER_CREATED, {
            entityId: result.id,
            orderId: result.publicId,
            recipient: result.contactEmail,
            customerName: result.contactEmail.split('@')[0],
            totalCents: result.totalCents,
            total: `R$ ${(result.totalCents / 100).toFixed(2).replace('.', ',')}`,
            status: OrderStatus.AWAITING_PAYMENT,
            orderUrl: `/pedido/${result.publicId}`,
          }, transaction);
        } catch {
          // Order creation must remain independent from notification persistence.
        }
      }
      if (input.idempotencyKey && result) {
        await transaction.idempotencyKey.create({
          data: {
            key: input.idempotencyKey,
            scope: `checkout:${input.cartId}`,
            responseJson: {
              orderPublicId: result.publicId,
              amountCents: result.totalCents,
              expiresAt: result.inventoryReservations[0]?.expiresAt.toISOString(),
            },
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
      }
      return result;
    });
  }

  async transition(orderId: string, toStatus: OrderStatus, input: { actorType: ActorType; actorId?: string; reason?: string; source?: string }) {
    return this.prisma.$transaction(async (transaction) => {
      const order = await transaction.order.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundException('ORDER_NOT_FOUND');
      if (!canTransition(order.status, toStatus)) throw new BadRequestException('INVALID_ORDER_TRANSITION');
      const updated = await transaction.order.update({ where: { id: orderId }, data: { status: toStatus } });
      await transaction.orderStatusHistory.create({ data: { orderId, fromStatus: order.status, toStatus, actorType: input.actorType, actorId: input.actorId, reason: input.reason, source: input.source } });
      try {
        await this.notifications?.enqueue(EmailEventKey.ORDER_STATUS_CHANGED, {
          entityId: updated.id,
          orderId: updated.publicId,
          recipient: order.contactEmail,
          customerName: order.contactEmail.split('@')[0],
          status: toStatus,
          orderUrl: `/pedido/${updated.publicId}`,
        }, transaction);
      } catch {
        // A notification failure must not roll back an operational status change.
      }
      return updated;
    });
  }

  getByPublicId(publicId: string) {
    return this.prisma.order.findUnique({ where: { publicId }, include: { items: true, statusHistory: { orderBy: { createdAt: 'asc' } }, payments: true } });
  }

  listForUser(userId: string) {
    return this.prisma.order.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { items: true, payments: true, statusHistory: { orderBy: { createdAt: 'asc' } } } });
  }

  listForOperations() {
    return this.prisma.order.findMany({ take: 100, orderBy: { createdAt: 'desc' }, include: { items: true, payments: true } });
  }
}
