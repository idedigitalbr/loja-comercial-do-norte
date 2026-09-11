import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PermissionGuard } from './guards/permission.guard';
import { SessionGuard } from './guards/session.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, PermissionGuard, SessionGuard],
  exports: [AuthService, PermissionGuard, SessionGuard],
})
export class AuthModule {}
