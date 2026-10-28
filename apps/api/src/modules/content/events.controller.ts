import { Controller, Get, Inject, Param, Query, UseGuards } from '@nestjs/common';
import { RecordStatus } from '@prisma/client';
import { PublicRateLimit, PublicRateLimitGuard } from '../../common/security/public-rate-limit.guard';
import { EventsService } from './events.service';

@UseGuards(PublicRateLimitGuard)
@Controller('events')
export class EventsController {
  constructor(@Inject(EventsService) private readonly eventsService: EventsService) {}

  @PublicRateLimit({ limit: 120, windowMs: 60_000 })
  @Get()
  listEvents(@Query('search') search?: string) {
    return this.eventsService.listEvents({
      search,
      status: RecordStatus.ACTIVE,
    });
  }

  @Get(':slug')
  getEvent(@Param('slug') slug: string) {
    return this.eventsService.getEventBySlug(slug);
  }
}
