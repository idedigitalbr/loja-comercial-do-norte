import { StorefrontCompositionSchema } from './storefront-composition.schema';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import type { AuthenticatedUser } from '../auth/auth.service';
import { PrismaService } from '../database/prisma.service';

const revisionWhere = { entityType: 'StorefrontComposition', entityId: 'home' };

@Injectable()
export class StorefrontCompositionService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getComposition() {
    const site = await this.prisma.siteConfiguration.findUnique({
      where: { id: 'default' }, select: { homeComposition: true },
    });
    return site?.homeComposition ?? null;
  }

  async getRevisions() {
    const rows = await this.prisma.auditLog.findMany({
      where: revisionWhere, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 50, select: { afterJson: true },
    });
    return rows.map((row) => row.afterJson);
  }

  async publish(input: unknown, actor: AuthenticatedUser, note?: string) {
    const parsed = StorefrontCompositionSchema.safeParse(input);
    if (!parsed.success) throw new BadRequestException('INVALID_STOREFRONT_COMPOSITION');
    const composition = parsed.data;
    const revision = {
      id: `rev-${randomUUID()}`, createdAt: new Date().toISOString(),
      authorName: actor.email, authorEmail: actor.email,
      widgetsCount: composition.widgets.length,
      note: note ?? `Atualização de vitrine (${composition.widgets.length} seções)`,
      composition,
    };
    // A missing configuration or failed audit must roll back the entire publication.
    await this.prisma.$transaction(async (tx) => {
      await tx.siteConfiguration.update({
        where: { id: 'default' }, data: { homeComposition: composition as Prisma.InputJsonValue }, select: { id: true },
      });
      await tx.auditLog.create({ data: {
        id: revision.id, actorType: 'USER', actorId: actor.id, action: 'UPDATE',
        ...revisionWhere, afterJson: revision as Prisma.InputJsonValue,
      } });
    });
    return revision;
  }

  async restore(id: string, actor: AuthenticatedUser) {
    const row = await this.prisma.auditLog.findFirst({ where: { id, ...revisionWhere } });
    const revision = row?.afterJson as { composition?: unknown; createdAt?: string } | null;
    if (!revision?.composition) throw new NotFoundException('STOREFRONT_REVISION_NOT_FOUND');
    return this.publish(revision.composition, actor, `Restaurado a partir do checkpoint ${id}`);
  }
}
