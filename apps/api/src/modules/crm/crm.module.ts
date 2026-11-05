import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { AdminCrmController } from './admin-crm.controller';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [CrmController, AdminCrmController],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}

