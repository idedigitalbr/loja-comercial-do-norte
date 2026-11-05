import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { PublicRateLimit, PublicRateLimitGuard } from '../../common/security/public-rate-limit.guard';
import { CrmService } from './crm.service';
import { CreateCrmLeadDto } from './crm.types';

@UseGuards(PublicRateLimitGuard)
@Controller('crm')
export class CrmController {
  constructor(@Inject(CrmService) private readonly crmService: CrmService) {}

  @PublicRateLimit({ limit: 15, windowMs: 60_000 })
  @Post('leads')
  createLead(@Body() body: CreateCrmLeadDto) {
    return this.crmService.createLead(body);
  }
}
