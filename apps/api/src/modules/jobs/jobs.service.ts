import { JobStatus, JobType } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { jobHandlers, JobHandler } from './job-handlers';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService, private readonly handlers: Record<JobType, JobHandler> = jobHandlers) {}

  async processBatch(limit: number, runnerId: string) {
    const boundedLimit = Math.min(Math.max(limit, 1), 50);
    const now = new Date();
    await this.prisma.scheduledJob.updateMany({
      where: { status: JobStatus.PROCESSING, lockedAt: { lt: new Date(now.getTime() - 15 * 60 * 1000) } },
      data: { status: JobStatus.RETRY, lockedAt: null, lockedBy: null, runAt: now },
    });
    const counters = { claimed: 0, completed: 0, retry: 0, failed: 0 };

    for (let index = 0; index < boundedLimit; index += 1) {
      const job = await this.claimOne(runnerId, now);
      if (!job) break;
      counters.claimed += 1;
      try {
        await (this.handlers[job.type] ?? (async () => undefined))(job.payloadJson);
        await this.prisma.scheduledJob.update({ where: { id: job.id }, data: { status: JobStatus.COMPLETED, completedAt: new Date(), lockedAt: null, lockedBy: null } });
        counters.completed += 1;
      } catch (error) {
        const shouldRetry = job.attempts < job.maxAttempts;
        await this.prisma.scheduledJob.update({ where: { id: job.id }, data: { status: shouldRetry ? JobStatus.RETRY : JobStatus.FAILED, runAt: new Date(Date.now() + job.attempts * 60_000), lastError: error instanceof Error ? error.message : 'JOB_FAILED', lockedAt: null, lockedBy: null } });
        counters[shouldRetry ? 'retry' : 'failed'] += 1;
      }
    }
    return counters;
  }

  private async claimOne(runnerId: string, now: Date) {
    return this.prisma.$transaction(async (transaction) => {
      const candidate = await transaction.scheduledJob.findFirst({ where: { status: { in: [JobStatus.PENDING, JobStatus.RETRY] }, runAt: { lte: now } }, orderBy: { runAt: 'asc' } });
      if (!candidate) return null;
      const claimed = await transaction.scheduledJob.updateMany({ where: { id: candidate.id, status: candidate.status }, data: { status: JobStatus.PROCESSING, lockedAt: now, lockedBy: runnerId, attempts: { increment: 1 } } });
      if (claimed.count !== 1) return null;
      return { ...candidate, attempts: candidate.attempts + 1 };
    });
  }
}
