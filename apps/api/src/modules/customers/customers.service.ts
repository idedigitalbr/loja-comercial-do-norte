import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async get360ByPublicId(publicId: string) {
    const user = await this.prisma.user.findUnique({ where: { publicId }, include: { profile: true, addresses: true, orders: { orderBy: { createdAt: 'desc' }, include: { items: true, payments: true } }, vipMemberships: { include: { tier: true } } } });
    if (!user) throw new NotFoundException('CUSTOMER_NOT_FOUND');
    return user;
  }
}
