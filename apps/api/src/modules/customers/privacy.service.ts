import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrivacyService {
  constructor(private readonly prisma: PrismaService) {}

  async anonymizeCustomer(userId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.findUnique({ where: { id: userId }, include: { profile: true } });
      if (!user) throw new NotFoundException('CUSTOMER_NOT_FOUND');
      const token = userId.slice(-12).toLowerCase();
      await transaction.user.update({ where: { id: userId }, data: { email: `anon-${token}@invalid.local` } });
      if (user.profile) await transaction.customerProfile.update({ where: { userId }, data: { firstName: 'Anonimizado', lastName: 'Anonimizado', phone: null, document: null, consentJson: Prisma.JsonNull } });
      return { userId, anonymized: true };
    });
  }
}
