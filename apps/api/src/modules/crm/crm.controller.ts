import { Body, Controller, Get, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { PublicRateLimit, PublicRateLimitGuard } from '../../common/security/public-rate-limit.guard';
import { CrmService } from './crm.service';
import { CreateCrmLeadDto } from './crm.types';

@UseGuards(PublicRateLimitGuard)
@Controller('crm')
export class CrmController {
  constructor(@Inject(CrmService) private readonly crmService: CrmService) {}

  @PublicRateLimit({ limit: 30, windowMs: 60_000 })
  @Post('leads')
  createLead(@Body() body: CreateCrmLeadDto) {
    return this.crmService.createLead(body);
  }

  @PublicRateLimit({ limit: 30, windowMs: 60_000 })
  @Get('leads/session')
  async getLeadSession(
    @Query('publicId') publicId?: string,
    @Query('phone') phone?: string
  ) {
    const lead = await this.crmService.getLeadSession({ publicId, phone });
    return { found: Boolean(lead), lead };
  }
}
