import { Body, Controller, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { EmailEventKey } from '@prisma/client';
import { IsEmail, IsEnum, IsObject, IsOptional, IsString, Length } from 'class-validator';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { NotificationPayload, NotificationsService } from './notifications.service';

class TestEmailDto {
  @IsEmail() recipient!: string;
}

class TestTemplateDto extends TestEmailDto {
  @IsOptional() @IsObject() variables?: NotificationPayload;
}

class TestTemplateParamsDto {
  @IsEnum(EmailEventKey) key!: EmailEventKey;
  @IsString() @Length(2, 10) locale!: string;
}

@UseGuards(SessionGuard, PermissionGuard)
@Controller('admin/settings')
export class NotificationsController {
  constructor(@Inject(NotificationsService) private readonly notificationsService: NotificationsService) {}

  @Post('email/test')
  @RequirePermissions(Permissions.NOTIFICATIONS_MANAGE)
  testEmail(@Body() body: TestEmailDto) {
    return this.notificationsService.sendTestEmail(body.recipient).then(() => ({ ok: true }));
  }

  @Post('templates/:key/:locale/test')
  @RequirePermissions(Permissions.NOTIFICATIONS_MANAGE)
  testTemplate(@Param() params: TestTemplateParamsDto, @Body() body: TestTemplateDto) {
    return this.notificationsService.sendTemplateTest(params.key, params.locale, body.recipient, body.variables).then(() => ({ ok: true }));
  }
}
