import { OrderStatus, Prisma, RecordStatus } from '@prisma/client';
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../database/prisma.service';
import { AddFavoriteDto, CreateAddressDto, UpdateAddressDto, UpdateProfileDto } from './account.dto';

const spentOrderStatuses = [OrderStatus.PAID, OrderStatus.PREPARING, OrderStatus.SHIPPED, OrderStatus.READY_FOR_PICKUP, OrderStatus.COMPLETED, OrderStatus.PARTIALLY_REFUNDED];

const orderInclude = {
  items: {
    select: {
      id: true,
      name: true,
      sku: true,
      quantity: true,
      unitPriceCents: true,
      totalCents: true,
      variant: { select: { product: { select: { slug: true, name: true } } } },
    },
  },
  payments: { select: { publicId: true, method: true, status: true, amountCents: true, expiresAt: true } },
  statusHistory: { orderBy: { createdAt: 'asc' as const }, select: { id: true, fromStatus: true, toStatus: true, reason: true, createdAt: true } },
} as const;

type AddressFields = {
  label: string;
  recipientName: string;
  street: string;
  number: string;
  complement?: string | null;
  district: string;
  city: string;
  state: string;
  postalCode: string;
};

@Injectable()
export class AccountService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuthService) private readonly authService: AuthService,
  ) {}

  async getSummary(userId: string) {
    const [user, totalSpent] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          publicId: true,
          email: true,
          createdAt: true,
          profile: true,
          addresses: { orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] },
          _count: { select: { orders: true, favorites: true } },
          orders: { take: 1, orderBy: { createdAt: 'desc' }, select: { publicId: true, status: true, totalCents: true, createdAt: true } },
        },
      }),
      this.prisma.order.aggregate({ where: { userId, status: { in: spentOrderStatuses } }, _sum: { totalCents: true } }),
    ]);
    if (!user) throw new NotFoundException('CUSTOMER_NOT_FOUND');

    return {
      user: { publicId: user.publicId, email: user.email, createdAt: user.createdAt, profile: user.profile },
      metrics: {
        orderCount: user._count.orders,
        favoriteCount: user._count.favorites,
        totalSpentCents: totalSpent._sum.totalCents ?? 0,
      },
      defaultAddress: user.addresses.find((address) => address.isDefault) ?? user.addresses[0] ?? null,
      lastOrder: user.orders[0] ?? null,
    };
  }

  async listOrders(userId: string, input: { page?: string; pageSize?: string; status?: string } = {}) {
    const page = Math.max(1, Number.parseInt(input.page ?? '1', 10) || 1);
    const pageSize = Math.min(20, Math.max(1, Number.parseInt(input.pageSize ?? '6', 10) || 6));
    if (input.status && !Object.values(OrderStatus).includes(input.status as OrderStatus)) throw new BadRequestException('INVALID_ORDER_STATUS');
    const where = { userId, ...(input.status ? { status: input.status as OrderStatus } : {}) };
    const [total, items] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize, include: orderInclude }),
    ]);
    return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
  }

  async getOrder(userId: string, publicId: string) {
    const order = await this.prisma.order.findFirst({ where: { userId, publicId }, include: orderInclude });
    if (!order) throw new NotFoundException('ORDER_NOT_FOUND');
    return order;
  }

  updateProfile(userId: string, input: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        profile: {
          upsert: {
            create: { firstName: input.firstName.trim(), lastName: input.lastName.trim(), phone: input.phone?.trim() || null },
            update: { firstName: input.firstName.trim(), lastName: input.lastName.trim(), phone: input.phone?.trim() || null },
          },
        },
      },
      select: { publicId: true, email: true, profile: true },
    });
  }

  listAddresses(userId: string) {
    return this.prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
  }

  async createAddress(userId: string, input: CreateAddressDto) {
    const fields = this.normalizeAddress(input);
    return this.prisma.$transaction(async (transaction) => {
      const hasAddress = await transaction.address.count({ where: { userId } });
      const shouldBeDefault = input.isDefault === true || hasAddress === 0;
      if (shouldBeDefault) await transaction.address.updateMany({ where: { userId }, data: { isDefault: false } });
      return transaction.address.create({ data: { ...fields, userId, isDefault: shouldBeDefault } });
    });
  }

  async updateAddress(userId: string, publicId: string, input: UpdateAddressDto) {
    const current = await this.findAddress(userId, publicId);
    const fields = this.normalizeAddress({ ...current, ...input });
    return this.prisma.address.update({ where: { id: current.id }, data: fields });
  }

  async deleteAddress(userId: string, publicId: string) {
    const current = await this.findAddress(userId, publicId);
    return this.prisma.$transaction(async (transaction) => {
      const remaining = await transaction.address.findMany({ where: { userId, id: { not: current.id } }, orderBy: { createdAt: 'desc' }, select: { id: true } });
      await transaction.address.delete({ where: { id: current.id } });
      if (current.isDefault && remaining[0]) await transaction.address.update({ where: { id: remaining[0].id }, data: { isDefault: true } });
      return { deleted: true };
    });
  }

  async setDefaultAddress(userId: string, publicId: string) {
    const address = await this.findAddress(userId, publicId);
    return this.prisma.$transaction(async (transaction) => {
      await transaction.address.updateMany({ where: { userId }, data: { isDefault: false } });
      return transaction.address.update({ where: { id: address.id }, data: { isDefault: true } });
    });
  }

  async listFavorites(userId: string) {
    const favorites = await this.prisma.customerFavorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        product: {
          select: {
            publicId: true,
            slug: true,
            name: true,
            status: true,
            brand: { select: { name: true } },
            images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { path: true, altText: true } },
            variants: { where: { status: RecordStatus.ACTIVE }, orderBy: { createdAt: 'asc' }, take: 1, select: { priceCents: true, compareAtPriceCents: true, stockStatus: true } },
          },
        },
      },
    });
    return favorites.map((favorite) => ({ id: favorite.id, createdAt: favorite.createdAt, product: favorite.product }));
  }

  async addFavorite(userId: string, input: AddFavoriteDto) {
    const product = await this.prisma.product.findFirst({ where: { OR: [{ publicId: input.productId }, { slug: input.productId }] }, select: { id: true } });
    if (!product) throw new NotFoundException('PRODUCT_NOT_FOUND');
    try {
      await this.prisma.customerFavorite.upsert({ where: { userId_productId: { userId, productId: product.id } }, create: { userId, productId: product.id }, update: {} });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('FAVORITE_ALREADY_EXISTS');
      throw error;
    }
    return this.listFavorites(userId);
  }

  async removeFavorite(userId: string, productKey: string) {
    const favorite = await this.prisma.customerFavorite.findFirst({ where: { userId, product: { OR: [{ publicId: productKey }, { slug: productKey }] } }, select: { id: true } });
    if (!favorite) throw new NotFoundException('FAVORITE_NOT_FOUND');
    await this.prisma.customerFavorite.delete({ where: { id: favorite.id } });
    return { deleted: true };
  }

  changePassword(userId: string, currentPassword: string, newPassword: string) {
    return this.authService.changePassword(userId, currentPassword, newPassword);
  }

  private async findAddress(userId: string, publicId: string) {
    const address = await this.prisma.address.findFirst({ where: { userId, publicId } });
    if (!address) throw new NotFoundException('ADDRESS_NOT_FOUND');
    return address;
  }

  private normalizeAddress(input: AddressFields): AddressFields {
    const postalCode = input.postalCode.replace(/\D/g, '');
    const state = input.state.trim().toUpperCase();
    if (postalCode.length !== 8) throw new BadRequestException('INVALID_POSTAL_CODE');
    if (!/^[A-Z]{2}$/.test(state)) throw new BadRequestException('INVALID_STATE');
    return {
      label: input.label.trim(),
      recipientName: input.recipientName.trim(),
      street: input.street.trim(),
      number: input.number.trim(),
      complement: input.complement?.trim() || null,
      district: input.district.trim(),
      city: input.city.trim(),
      state,
      postalCode,
    };
  }
}
