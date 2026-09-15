import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { NotificationsService } from '../notifications/notifications.service';
import { CronController } from './cron.controller';
import { jobHandlers, JobHandler } from './job-handlers';
import { JobsService } from './jobs.service';
import { PrismaService } from '../database/prisma.service';

export const JOB_HANDLERS = 'JOB_HANDLERS';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  controllers: [CronController],
  providers: [
    {
      provide: JOB_HANDLERS,
      useFactory: (notifications: NotificationsService): Record<string, JobHandler> => ({
        ...jobHandlers,
        SEND_TRANSACTIONAL_EMAIL: (payload) => notifications.processJob(payload),
      }),
      inject: [NotificationsService],
    },
    {
      provide: JobsService,
      useFactory: (prisma: PrismaService, handlers: Record<string, JobHandler>) => new JobsService(prisma, handlers),
      inject: [PrismaService, JOB_HANDLERS],
    },
  ],
  exports: [JobsService],
})
export class JobsModule {}
