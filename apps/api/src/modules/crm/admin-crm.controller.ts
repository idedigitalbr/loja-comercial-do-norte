import { Body, Controller, Get, Inject, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthenticatedUser } from '../auth/auth.service';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { CrmService } from './crm.service';
import { AddLeadNoteDto, ListCrmLeadsQueryDto, UpdateLeadStageDto } from './crm.types';

@UseGuards(SessionGuard, PermissionGuard)
@RequirePermissions(Permissions.QUOTES_MANAGE)
@Controller('admin/crm')
export class AdminCrmController {
  constructor(@Inject(CrmService) private readonly crmService: CrmService) {}

  @Get('leads')
  listLeads(@Query() query: ListCrmLeadsQueryDto) {
    return this.crmService.listLeads(query);
  }

  @Patch('leads/:id/stage')
  updateStage(@Param('id') id: string, @Body() body: UpdateLeadStageDto) {
    return this.crmService.updateLeadStage(id, body.stage);
  }

  @Post('leads/:id/notes')
  addNote(
    @Param('id') id: string,
    @Body() body: AddLeadNoteDto,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.crmService.addNote(id, {
      ...body,
      authorName: body.authorName || request.user.email,
    });
  }
}
