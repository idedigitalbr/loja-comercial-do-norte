import { InventoryReservationStatus, StockMovementType } from '@prisma/client';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export type ReservationInput = {
  orderId: string;
  items: Array<{ variantId: string; quantity: number }>;
  expiresAt?: Date;
};

export class InventoryUnavailableError extends BadRequestException {
  readonly code = 'INVENTORY_UNAVAILABLE';

  constructor() {
    super({ code: 'INVENTORY_UNAVAILABLE', message: 'Estoque insuficiente.' });
  }
}

type Transaction = Parameters<Parameters<PrismaService['$transaction']>[0]>[0];

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async reserve(input: ReservationInput) {
    const sortedItems = [...input.items].sort((left, right) => left.variantId.localeCompare(right.variantId));
    const expiresAt = input.expiresAt ?? new Date(Date.now() + 15 * 60 * 1000);
    return this.prisma.$transaction(async (transaction) => {
      const reservations = [];
      for (const item of sortedItems) {
        if (!Number.isInteger(item.quantity) || item.quantity < 1) throw new InventoryUnavailableError();
        const balance = await this.lockBalance(transaction, item.variantId);
        const available = balance.physicalQuantity - balance.reservedQuantity;
        if (available < item.quantity) throw new InventoryUnavailableError();

        await transaction.inventoryBalance.update({
          where: { variantId: item.variantId },
          data: { reservedQuantity: { increment: item.quantity } },
        });
        const reservation = await transaction.inventoryReservation.create({
          data: { orderId: input.orderId, variantId: item.variantId, quantity: item.quantity, expiresAt },
        });
        await transaction.stockMovement.create({
          data: {
            variantId: item.variantId,
            orderId: input.orderId,
            type: StockMovementType.SALE_RESERVATION,
            quantity: item.quantity,
            beforeQuantity: available,
            afterQuantity: available - item.quantity,
          },
        });
        reservations.push(reservation);
      }
      return reservations;
    });
  }

  async releaseExpiredReservations(now = new Date(), limit = 100): Promise<number> {
    return this.prisma.$transaction((transaction) => this.releaseExpiredInTransaction(transaction, now, limit));
  }

  async adjust(input: { variantId: string; quantity: number; reason: string; actorId?: string }) {
    if (!input.reason.trim()) throw new BadRequestException('ADJUSTMENT_REASON_REQUIRED');
    return this.prisma.$transaction(async (transaction) => {
      const balance = await this.lockBalance(transaction, input.variantId);
      const nextPhysical = balance.physicalQuantity + input.quantity;
      if (nextPhysical < balance.reservedQuantity) throw new InventoryUnavailableError();
      const updated = await transaction.inventoryBalance.update({
        where: { variantId: input.variantId },
        data: { physicalQuantity: nextPhysical },
      });
      await transaction.stockMovement.create({
        data: {
          variantId: input.variantId,
          type: StockMovementType.MANUAL_ADJUSTMENT,
          quantity: input.quantity,
          beforeQuantity: balance.physicalQuantity - balance.reservedQuantity,
          afterQuantity: nextPhysical - balance.reservedQuantity,
          reason: input.reason,
        },
      });
      await transaction.auditLog.create({
        data: {
          actorType: input.actorId ? 'USER' : 'SYSTEM',
          actorId: input.actorId,
          action: 'INVENTORY_ADJUSTED',
          entityType: 'InventoryBalance',
          entityId: updated.id,
          afterJson: { quantity: input.quantity, reason: input.reason },
        },
      });
      return updated;
    });
  }

  private async lockBalance(transaction: Transaction, variantId: string) {
    const rows = await transaction.$queryRaw<Array<{ id: string; physicalQuantity: number; reservedQuantity: number }>>`
      SELECT id, physicalQuantity, reservedQuantity
      FROM InventoryBalance
      WHERE variantId = ${variantId}
      FOR UPDATE
    `;
    if (!rows[0]) throw new NotFoundException('INVENTORY_BALANCE_NOT_FOUND');
    return {
      ...rows[0],
      physicalQuantity: Number(rows[0].physicalQuantity),
      reservedQuantity: Number(rows[0].reservedQuantity),
    };
  }

  private async releaseExpiredInTransaction(transaction: Transaction, now: Date, limit: number) {
    const reservations = await transaction.inventoryReservation.findMany({
      where: { status: InventoryReservationStatus.PENDING, expiresAt: { lte: now } },
      orderBy: { expiresAt: 'asc' },
      take: limit,
    });
    for (const reservation of reservations) {
      const balance = await this.lockBalance(transaction, reservation.variantId);
      await transaction.inventoryBalance.update({
        where: { variantId: reservation.variantId },
        data: { reservedQuantity: { decrement: reservation.quantity } },
      });
      await transaction.inventoryReservation.update({
        where: { id: reservation.id },
        data: { status: InventoryReservationStatus.RELEASED, releasedAt: now },
      });
      await transaction.stockMovement.create({
        data: {
          variantId: reservation.variantId,
          orderId: reservation.orderId,
          type: StockMovementType.RESERVATION_RELEASE,
          quantity: reservation.quantity,
          beforeQuantity: balance.physicalQuantity - balance.reservedQuantity,
          afterQuantity: balance.physicalQuantity - balance.reservedQuantity + reservation.quantity,
        },
      });
    }
    return reservations.length;
  }
}
