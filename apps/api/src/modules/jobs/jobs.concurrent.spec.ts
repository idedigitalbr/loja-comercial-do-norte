import { JobType } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../database/prisma.service';
import { JobsService } from './jobs.service';

describe('JobsService concurrency', () => {
  const prisma = new PrismaService();
  const service = new JobsService(prisma);
  let jobId: string;

  beforeAll(async () => {
    await prisma.$connect();
    const job = await prisma.scheduledJob.create({ data: { type: JobType.RECONCILE_PAYMENT, payloadJson: {} } });
    jobId = job.id;
  });

  afterAll(async () => {
    await prisma.scheduledJob.deleteMany({ where: { id: jobId } });
    await prisma.$disconnect();
  });

  it('does not execute the same job twice when cron overlaps', async () => {
    const [first, second] = await Promise.all([service.processBatch(10, 'runner-a'), service.processBatch(10, 'runner-b')]);
    expect(first.completed + second.completed).toBe(1);
    expect(first.claimed + second.claimed).toBe(1);
  });
});
