import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CustomersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  list(input: { search?: string } = {}) {
    const search = input.search?.trim();
    return this.prisma.user.findMany({
      where: {
        profile: { isNot: null },
        ...(search
          ? { OR: [{ email: { contains: search } }, { profile: { is: { firstName: { contains: search } } } }, { profile: { is: { lastName: { contains: search } } } }] }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { profile: true, _count: { select: { orders: true } } },
    });
  }

  async get360ByPublicId(publicId: string) {
    const user = await this.prisma.user.findUnique({ where: { publicId }, include: { profile: true, addresses: true, orders: { orderBy: { createdAt: 'desc' }, include: { items: true, payments: true } }, vipMemberships: { include: { tier: true } } } });
    if (!user) throw new NotFoundException('CUSTOMER_NOT_FOUND');
    return user;
  }
}
