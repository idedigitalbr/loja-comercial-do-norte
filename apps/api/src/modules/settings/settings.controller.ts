import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { EmailEventKey } from '@prisma/client';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { EmailTemplateDto, NotificationPreferenceDto, PaymentSettingsDto, SiteBannerDto, SiteUpdateDto, SmtpSettingsDto } from './settings.dto';
import { SettingsService } from './settings.service';

@UseGuards(SessionGuard, PermissionGuard)
@Controller('admin/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @RequirePermissions(Permissions.SETTINGS_MANAGE)
  snapshot() {
    return this.settingsService.getAdminSnapshot();
  }

  @Get('site')
  @RequirePermissions(Permissions.SETTINGS_MANAGE)
  site() {
    return this.settingsService.getAdminSnapshot().then(({ site }) => site);
  }

  @Put('site')
  @RequirePermissions(Permissions.SETTINGS_MANAGE)
  updateSite(@Body() body: SiteUpdateDto) {
    return this.settingsService.updateSite(body);
  }

  @Get('banners')
  @RequirePermissions(Permissions.SETTINGS_MANAGE)
  banners() {
    return this.settingsService.listBanners();
  }

  @Post('banners')
  @RequirePermissions(Permissions.SETTINGS_MANAGE)
  createBanner(@Body() body: SiteBannerDto) {
    return this.settingsService.createBanner(body);
  }

  @Patch('banners/:id')
  @RequirePermissions(Permissions.SETTINGS_MANAGE)
  updateBanner(@Param('id') id: string, @Body() body: Partial<SiteBannerDto>) {
    return this.settingsService.updateBanner(id, body);
  }

  @Delete('banners/:id')
  @RequirePermissions(Permissions.SETTINGS_MANAGE)
  deleteBanner(@Param('id') id: string) {
    return this.settingsService.deleteBanner(id);
  }

  @Get('payments')
  @RequirePermissions(Permissions.PAYMENTS_MANAGE)
  payments() {
    return this.settingsService.getPaymentSettings();
  }

  @Put('payments')
  @RequirePermissions(Permissions.PAYMENTS_MANAGE)
  updatePayments(@Body() body: PaymentSettingsDto) {
    return this.settingsService.updatePaymentSettings(body);
  }

  @Get('email')
  @RequirePermissions(Permissions.NOTIFICATIONS_MANAGE)
  email() {
    return this.settingsService.getSmtpSettings();
  }

  @Put('email')
  @RequirePermissions(Permissions.NOTIFICATIONS_MANAGE)
  updateEmail(@Body() body: SmtpSettingsDto) {
    return this.settingsService.updateSmtpSettings(body);
  }

  @Get('templates')
  @RequirePermissions(Permissions.NOTIFICATIONS_MANAGE)
  templates() {
    return this.settingsService.listEmailTemplates();
  }

  @Put('templates/:key/:locale')
  @RequirePermissions(Permissions.NOTIFICATIONS_MANAGE)
  updateTemplate(@Param('key') key: EmailEventKey, @Param('locale') locale: string, @Body() body: EmailTemplateDto) {
    return this.settingsService.updateEmailTemplate(key, locale, body);
  }

  @Put('notifications/:eventKey')
  @RequirePermissions(Permissions.NOTIFICATIONS_MANAGE)
  updateNotification(@Param('eventKey') eventKey: EmailEventKey, @Body() body: NotificationPreferenceDto) {
    return this.settingsService.updateNotificationPreference(eventKey, body);
  }
}

@Controller('site')
export class PublicSiteConfigController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('config')
  publicConfig() {
    return this.settingsService.getPublicConfig();
  }
}
