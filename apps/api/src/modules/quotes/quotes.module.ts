import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminQuotesController } from './admin-quotes.controller';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';

@Module({
  imports: [DatabaseModule, AuthModule, NotificationsModule],
  controllers: [QuotesController, AdminQuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
