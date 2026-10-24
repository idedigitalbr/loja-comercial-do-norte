import { Body, Controller, Get, Inject, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { QuoteStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import type { Request } from 'express';
import { AuthenticatedUser } from '../auth/auth.service';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { QuotesService } from './quotes.service';

class ListQuotesQueryDto {
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

class QuoteStatusDto {
  @IsEnum(QuoteStatus)
  status!: QuoteStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

@UseGuards(SessionGuard, PermissionGuard)
@RequirePermissions(Permissions.QUOTES_MANAGE)
@Controller('admin/quotes')
export class AdminQuotesController {
  constructor(@Inject(QuotesService) private readonly quotesService: QuotesService) {}

  @Get()
  list(@Query() query: ListQuotesQueryDto) {
    return this.quotesService.listForAdmin(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.quotesService.getForAdmin(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: QuoteStatusDto,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.quotesService.transition(id, body.status, { actorId: request.user.id, reason: body.reason });
  }
}
