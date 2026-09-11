import {
  Controller,
  Get,
  Inject,
  Req,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

type RequestWithId = {
  requestId?: string;
};

@Controller('health')
export class HealthController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async getHealth(@Req() request: RequestWithId) {
    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
      return {
        status: 'ok',
        database: 'up',
        requestId: request.requestId,
      };
    } catch {
      throw new ServiceUnavailableException('Banco de dados indisponível.');
    }
  }
}
