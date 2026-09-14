import { Module } from '@nestjs/common';
import { SecurityModule } from '../../common/security/security.module';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { PublicSiteConfigController, SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [DatabaseModule, AuthModule, SecurityModule],
  controllers: [SettingsController, PublicSiteConfigController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
