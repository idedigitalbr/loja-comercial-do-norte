import { JobType, OrderStatus, Prisma, RefundStatus } from '@prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

const paidStatuses = [OrderStatus.PAID, OrderStatus.PREPARING, OrderStatus.SHIPPED, OrderStatus.READY_FOR_PICKUP, OrderStatus.COMPLETED, OrderStatus.PARTIALLY_REFUNDED, OrderStatus.REFUNDED];

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async salesSummary(input: { from: Date; to: Date }) {
    if (input.to.getTime() - input.from.getTime() > 366 * 24 * 60 * 60 * 1000) throw new BadRequestException('REPORT_PERIOD_TOO_LARGE');
    const where = { status: { in: paidStatuses }, createdAt: { gte: input.from, lte: input.to } };
    const [orders, refunds] = await Promise.all([
      this.prisma.order.aggregate({ where, _sum: { totalCents: true }, _count: { _all: true } }),
      this.prisma.refund.aggregate({ where: { status: RefundStatus.APPROVED, payment: { order: where } }, _sum: { amountCents: true } }),
    ]);
    const grossCents = orders._sum.totalCents ?? 0;
    const refundedCents = refunds._sum.amountCents ?? 0;
    return { grossCents, refundedCents, netCents: grossCents - refundedCents, ordersCount: orders._count._all };
  }

  async createExport(input: { userId: string; type: string; filters: Prisma.InputJsonValue }) {
    return this.prisma.$transaction(async (transaction) => {
      const report = await transaction.reportExport.create({ data: { createdById: input.userId, type: input.type, filtersJson: input.filters } });
      await transaction.scheduledJob.create({ data: { type: JobType.GENERATE_REPORT, payloadJson: { reportExportId: report.id, type: input.type, filters: input.filters } } });
      return report;
    });
  }
}
