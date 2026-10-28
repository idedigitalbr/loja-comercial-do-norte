import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RecordStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { EventsService } from './events.service';

class EventInputDto {
  @IsString()
  @Length(2, 255)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(2, 191)
  slug?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  posterUrl?: string;

  @IsOptional()
  @IsString()
  eventDate?: string;

  @IsOptional()
  @IsString()
  eventDateText?: string;

  @IsOptional()
  @IsString()
  eventTime?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  locationAddress?: string;

  @IsOptional()
  @IsString()
  instructor?: string;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  ctaLabel?: string;

  @IsOptional()
  @IsString()
  ctaUrl?: string;

  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

@UseGuards(SessionGuard, PermissionGuard)
@RequirePermissions(Permissions.SETTINGS_MANAGE)
@Controller('admin/events')
export class AdminEventsController {
  constructor(@Inject(EventsService) private readonly eventsService: EventsService) {}

  @Get()
  listEvents(@Query('search') search?: string, @Query('status') status?: RecordStatus) {
    return this.eventsService.listEvents({ search, status });
  }

  @Get(':id')
  getEvent(@Param('id') id: string) {
    return this.eventsService.getEventById(id);
  }

  @Post()
  createEvent(@Body() body: EventInputDto) {
    return this.eventsService.createEvent(body);
  }

  @Patch(':id')
  updateEvent(@Param('id') id: string, @Body() body: EventInputDto) {
    return this.eventsService.updateEvent(id, body);
  }

  @Post(':id/archive')
  archiveEvent(@Param('id') id: string) {
    return this.eventsService.archiveEvent(id);
  }

  @Delete(':id')
  deleteEvent(@Param('id') id: string) {
    return this.eventsService.deleteEvent(id);
  }
}
