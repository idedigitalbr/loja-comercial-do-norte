import { ActorType } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from './audit.service';

describe('AuditService', () => {
  const prisma = new PrismaService();
  const service = new AuditService(prisma);
  const entityId = `test-refund-${Date.now()}`;

  beforeAll(async () => prisma.$connect());
  afterAll(async () => {
    await prisma.auditLog.deleteMany({ where: { entityId } });
    await prisma.$disconnect();
  });

  it('records before and after values for a critical action', async () => {
    await service.record({ actorType: ActorType.SYSTEM, action: 'PAYMENT_REFUND', entityType: 'Payment', entityId, before: { status: 'APPROVED' }, after: { status: 'REFUNDED' } });
    const log = await prisma.auditLog.findFirstOrThrow({ where: { entityId } });
    expect(log.beforeJson).toEqual({ status: 'APPROVED' });
    expect(log.afterJson).toEqual({ status: 'REFUNDED' });
  });
});
