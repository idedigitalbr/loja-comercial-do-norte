import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CronController } from './cron.controller';
import { JobsService } from './jobs.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CronController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
