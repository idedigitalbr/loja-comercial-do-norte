import { Body, Controller, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.service';
import { SessionGuard } from '../auth/guards/session.guard';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { StorefrontCompositionService } from './storefront-composition.service';

@Controller('site/composition')
export class PublicStorefrontCompositionController {
  constructor(@Inject(StorefrontCompositionService) private readonly service: StorefrontCompositionService) {}

  @Get()
  async get() { return { data: await this.service.getComposition() }; }
}

@UseGuards(SessionGuard, PermissionGuard)
@RequirePermissions(Permissions.SETTINGS_MANAGE)
@Controller('admin/storefront')
export class StorefrontCompositionController {
  constructor(@Inject(StorefrontCompositionService) private readonly service: StorefrontCompositionService) {}

  @Post('composition')
  async publish(@Body() body: unknown, @Req() request: { user: AuthenticatedUser }) {
    return { data: await this.service.publish(body, request.user) };
  }

  @Get('revisions')
  async revisions() { return { data: await this.service.getRevisions() }; }

  @Post('revisions/:id/restore')
  async restore(@Param('id') id: string, @Req() request: { user: AuthenticatedUser }) {
    return { data: await this.service.restore(id, request.user) };
  }
}
