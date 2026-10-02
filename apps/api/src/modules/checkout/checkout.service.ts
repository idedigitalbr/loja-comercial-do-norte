import { BadRequestException, Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { assertIdempotencyScope } from '../../common/idempotency/idempotency';
import { PrismaService } from '../database/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { CouponService } from '../promotions/coupon.service';

type CheckoutInput = {
  cartId: string;
  contactEmail: string;
  userId?: string;
  shippingCents?: number;
  shippingMethodCode?: string;
  shippingDays?: number;
  couponCode?: string;
  shippingAddress?: Record<string, unknown>;
  billingAddress?: Record<string, unknown>;
};

@Injectable()
export class CheckoutService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(OrdersService) private readonly ordersService: OrdersService,
    @Optional() @Inject(CouponService) private readonly couponService?: CouponService,
  ) {}

  async quote(input: { cartId: string; userId?: string; contactEmail?: string; shippingCents?: number; couponCode?: string }) {
    const cart = await this.prisma.cart.findFirst({
      where: { OR: [{ id: input.cartId }, { publicId: input.cartId }] },
      include: { items: { include: { variant: { include: { product: { include: { categories: true } } } } } } },
    });
    if (!cart || !cart.items.length) throw new NotFoundException('CART_NOT_FOUND');
    const subtotalCents = cart.items.reduce((sum, item) => sum + (item.unitPriceCents ?? item.variant.priceCents) * item.quantity, 0);
    const shippingCents = input.shippingCents ?? 0;
    if (!Number.isInteger(shippingCents) || shippingCents < 0) throw new BadRequestException('INVALID_SHIPPING_AMOUNT');
    if (!input.couponCode?.trim()) return { subtotalCents, discountCents: 0, shippingCents, totalCents: subtotalCents + shippingCents };
    if (!this.couponService) throw new BadRequestException('COUPON_SERVICE_UNAVAILABLE');
    const coupon = await this.couponService.quote({
      code: input.couponCode,
      userId: input.userId,
      email: input.contactEmail,
      subtotalCents,
      shippingCents,
      items: cart.items.map((item) => ({
        productId: item.variant.productId,
        brandId: item.variant.product.brandId,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents ?? item.variant.priceCents,
        compareAtPriceCents: item.variant.compareAtPriceCents,
        categoryIds: item.variant.product.categories.map((category) => category.categoryId),
      })),
    });
    return { subtotalCents, couponCode: coupon.code, ...coupon };
  }

  async prepare(input: CheckoutInput, idempotencyKey: string) {
    if (!idempotencyKey) throw new BadRequestException('IDEMPOTENCY_KEY_REQUIRED');
    const existing = await this.prisma.idempotencyKey.findUnique({ where: { key: idempotencyKey } });

    const cart = await this.prisma.cart.findFirst({ where: { OR: [{ id: input.cartId }, { publicId: input.cartId }] } });
    if (!cart) throw new NotFoundException('CART_NOT_FOUND');
    assertIdempotencyScope(existing, `checkout:${cart.id}`);
    if (existing?.responseJson && typeof existing.responseJson === 'object' && 'orderPublicId' in existing.responseJson && 'amountCents' in existing.responseJson) {
      return existing.responseJson;
    }
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
