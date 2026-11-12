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
  // The service intentionally uses production Argon2 parameters for session
  // hashes; allow slower CI/Windows workers to finish the integration flow.
  }, 30_000);

  it('issues and exchanges a single-use admin handoff code while blocking non-admins, tampering, and replay', async () => {
    // Customer without ADMIN role cannot request a handoff code
    const customerSession = await service.login(email, 'SenhaSegura123!');
    await expect(service.createAdminHandoffCode(customerSession.accessToken)).rejects.toThrow('INSUFFICIENT_PERMISSIONS');

    // Seeded ADMIN can request and exchange a single-use handoff code
    const adminSession = await service.login('admin@isolated.test', 'TestAdmin!2026');
    const handoff = await service.createAdminHandoffCode(adminSession.accessToken);
    expect(handoff.expiresInSeconds).toBe(45);
    expect(handoff.code).toContain('.');

    const exchanged = await service.exchangeAdminHandoffCode(handoff.code);
    expect(exchanged.user.email).toBe('admin@isolated.test');
    expect(exchanged.user.roles).toContain('ADMIN');

    // Replay with the same handoff code must fail
    await expect(service.exchangeAdminHandoffCode(handoff.code)).rejects.toThrow('HANDOFF_ALREADY_USED');

    // Tampered signature must fail
    await expect(service.exchangeAdminHandoffCode(`${handoff.code}tampered`)).rejects.toThrow('INVALID_HANDOFF_CODE');

    // Revoking the original session invalidates any outstanding handoff code
    const handoffBeforeLogout = await service.createAdminHandoffCode(adminSession.accessToken);
    await service.logout(adminSession.refreshToken);
    await expect(service.exchangeAdminHandoffCode(handoffBeforeLogout.code)).rejects.toThrow('SESSION_REVOKED');
  }, 30_000);
});
