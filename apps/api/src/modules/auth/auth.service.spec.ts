import argon2 from 'argon2';
import { UserStatus } from '@prisma/client';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../database/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const prisma = new PrismaService();
  const service = new AuthService(prisma);
  const email = `cliente-${Date.now()}@exemplo.com`;

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.user.create({
      data: {
        email,
        // Keep the integration fixture lightweight; production hashes use
        // Argon2 defaults through AuthService.
        passwordHash: await argon2.hash('SenhaSegura123!', { type: argon2.argon2id, timeCost: 1, memoryCost: 4096, parallelism: 1 }),
        status: UserStatus.ACTIVE,
      },
    });
  });

  afterEach(async () => {
    await prisma.session.deleteMany({ where: { user: { email } } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('rotates refresh token and invalidates the previous hash', async () => {
    const first = await service.login(email, 'SenhaSegura123!');
    const second = await service.refresh(first.refreshToken);

    await expect(service.refresh(first.refreshToken)).rejects.toThrow('SESSION_REVOKED');
    expect(second.refreshToken).not.toBe(first.refreshToken);

    const sessions = await prisma.session.findMany({
      where: { user: { email } },
      orderBy: { createdAt: 'asc' },
    });
    expect(sessions).toHaveLength(2);
    expect(sessions[0].revokedAt).not.toBeNull();
    expect(sessions[1].revokedAt).toBeNull();
  }, 15_000);
});
