import { ActorType, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  record(input: { actorType: ActorType; actorId?: string; action: string; entityType: string; entityId: string; before?: Prisma.InputJsonValue; after?: Prisma.InputJsonValue; requestId?: string }) {
    const { before, after, ...audit } = input;
    return this.prisma.auditLog.create({ data: { ...audit, beforeJson: before, afterJson: after } });
  }
}
