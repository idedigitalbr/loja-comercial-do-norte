import { Injectable } from '@nestjs/common';
import { VipMembershipStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { PromotionCandidate } from '../promotions/promotion-engine';

export type VipBenefit = {
  code: string;
  label: string;
  percentage: number;
  stackable: boolean;
};

@Injectable()
export class VipService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveBenefit(userId: string, now = new Date()): Promise<VipBenefit | null> {
    const membership = await this.prisma.vipMembership.findFirst({
      where: {
        userId,
        status: VipMembershipStatus.ACTIVE,
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
      orderBy: { tier: { rank: 'desc' } },
      select: { tier: { select: { id: true, name: true, discountBps: true } } },
    });
    if (!membership) return null;
    return {
      code: `VIP_${membership.tier.id}`,
      label: membership.tier.name,
      percentage: membership.tier.discountBps / 100,
      stackable: true,
    };
  }

  async grantManual(input: { userId: string; tierId: string; actorId?: string; startsAt?: Date; endsAt?: Date }) {
    const membership = await this.prisma.$transaction(async (transaction) => {
      const created = await transaction.vipMembership.create({
        data: {
          userId: input.userId,
          tierId: input.tierId,
          startsAt: input.startsAt ?? new Date(),
          endsAt: input.endsAt,
        },
      });
      await transaction.auditLog.create({
        data: {
          actorType: input.actorId ? 'USER' : 'SYSTEM',
          actorId: input.actorId,
          action: 'VIP_MEMBERSHIP_GRANTED',
          entityType: 'VipMembership',
          entityId: created.id,
          afterJson: { userId: input.userId, tierId: input.tierId },
        },
      });
      return created;
    });
    return membership;
  }

  grantAutomatic(input: { userId: string; tierId: string; startsAt?: Date; endsAt?: Date }) {
    return this.grantManual(input);
  }

  toPromotion(benefit: VipBenefit): PromotionCandidate {
    return {
      code: benefit.code,
      label: benefit.label,
      scope: 'VIP',
      kind: 'PERCENTAGE',
      value: benefit.percentage,
      stackable: benefit.stackable,
    };
  }
}
