import { UserStatus } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../database/prisma.service';
import { PrivacyService } from './privacy.service';

describe('PrivacyService', () => {
  const prisma = new PrismaService();
  const service = new PrivacyService(prisma);
  let userId: string;
  let orderId: string;

  beforeAll(async () => {
    await prisma.$connect();
    const user = await prisma.user.create({ data: { email: `privacy-${Date.now()}@teste.local`, passwordHash: 'hash', status: UserStatus.ACTIVE, profile: { create: { firstName: 'Cliente', lastName: 'Teste', phone: '11999999999', document: '00000000000' } } } });
    userId = user.id;
    const order = await prisma.order.create({ data: { userId, subtotalCents: 19_000, totalCents: 19_000, contactEmail: user.email } });
    orderId = order.id;
  });

  afterAll(async () => {
    await prisma.order.delete({ where: { id: orderId } });
    await prisma.customerProfile.delete({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('anonymizes customer data while preserving fiscal order totals', async () => {
    await service.anonymizeCustomer(userId);
    const customer = await prisma.user.findUniqueOrThrow({ where: { id: userId }, include: { profile: true } });
    const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    expect(customer.email).toMatch(/^anon-/);
    expect(customer.profile?.firstName).toBe('Anonimizado');
    expect(order.totalCents).toBe(19_000);
  });
});
