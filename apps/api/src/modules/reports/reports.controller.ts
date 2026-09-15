import { Body, Controller, Get, Inject, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IsDateString, IsObject, IsOptional, IsString } from 'class-validator';
import type { Request } from 'express';
import { AuthenticatedUser } from '../auth/auth.service';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { ReportsService } from './reports.service';

class PeriodQuery {
  @IsDateString() from!: string;
  @IsDateString() to!: string;
}

class ExportDto {
  @IsString() type!: string;
  @IsOptional() @IsObject() filters?: Record<string, unknown>;
}

@UseGuards(SessionGuard, PermissionGuard)
@RequirePermissions(Permissions.REPORTS_FINANCIAL)
@Controller('admin/reports')
export class ReportsController {
  constructor(@Inject(ReportsService) private readonly reportsService: ReportsService) {}

  @Get('sales-summary')
  salesSummary(@Query() query: PeriodQuery) {
    return this.reportsService.salesSummary({ from: new Date(query.from), to: new Date(query.to) });
  }

  @Post('exports')
  createExport(@Body() body: ExportDto, @Req() request: Request & { user: AuthenticatedUser }) {
    return this.reportsService.createExport({ userId: request.user.id, type: body.type, filters: (body.filters ?? {}) as Prisma.InputJsonValue });
  }
}
