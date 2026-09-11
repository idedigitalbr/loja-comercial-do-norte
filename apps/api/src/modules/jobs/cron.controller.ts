import { Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { JobsService } from './jobs.service';

@Controller('internal/cron')
export class CronController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('process')
  process(@Headers('authorization') authorization?: string) {
    const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`;
    if (!authorization || authorization.length !== expected.length || !timingSafeEqual(Buffer.from(authorization), Buffer.from(expected))) {
      throw new UnauthorizedException('INVALID_CRON_SECRET');
    }
    return this.jobsService.processBatch(50, 'hostinger-cron');
  }
}
