import argon2 from 'argon2';
import { PrismaClient, UserStatus } from '@prisma/client';
import { afterAll, describe, expect, it } from 'vitest';

const prisma = new PrismaClient();
const adminCredential = process.env.DEFAULT_ADMIN_PASSWORD;
const customerCredential = process.env.DEFAULT_CUSTOMER_PASSWORD;
const hasConfiguredSeedPasswords = Boolean(adminCredential?.trim() && customerCredential?.trim());

describe.skipIf(!hasConfiguredSeedPasswords)('seed default accounts', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('provisions active admin and customer accounts with usable access', async () => {
    const [admin, customer] = await Promise.all([
      prisma.user.findUnique({
        where: { email: 'admin@admin.com' },
        select: { status: true, passwordHash: true, roles: { select: { role: { select: { name: true } } } } },
      }),
      prisma.user.findUnique({
        where: { email: 'cliente@demo.com' },
        select: { status: true, passwordHash: true, profile: { select: { firstName: true, lastName: true, phone: true } }, _count: { select: { orders: true } } },
      }),
    ]);

    expect(admin).not.toBeNull();
    expect(admin?.status).toBe(UserStatus.ACTIVE);
    expect(admin?.roles.map(({ role }) => role.name)).toContain('ADMIN');
    expect(await argon2.verify(admin?.passwordHash ?? '', adminCredential ?? '')).toBe(true);

    expect(customer).not.toBeNull();
    expect(customer?.status).toBe(UserStatus.ACTIVE);
    expect(customer?.profile).toEqual({ firstName: 'Cliente', lastName: 'Demonstração', phone: '(96) 98100-1897' });
    expect(customer?._count.orders).toBe(1);
    expect(await argon2.verify(customer?.passwordHash ?? '', customerCredential ?? '')).toBe(true);
  });
});
