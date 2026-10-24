import { Body, Controller, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import type { Request } from 'express';
import { PublicRateLimit, PublicRateLimitGuard } from '../../common/security/public-rate-limit.guard';
import { AuthenticatedUser } from '../auth/auth.service';
import { QuotesService } from './quotes.service';

class QuoteItemDto {
  @IsString()
  @MaxLength(60)
  variantId!: string;

  @IsInt()
  @Min(1)
  @Max(999)
  quantity!: number;
}

class CreateQuoteDto {
  @IsString()
  @MaxLength(160)
  customerName!: string;

  @IsString()
  @MaxLength(40)
  customerPhone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  customerEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  document?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  items!: QuoteItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(150)
  idempotencyKey?: string;
}

/**
 * Endpoints públicos da cotação: visitante não precisa de conta.
 * Não existe checkout, pagamento ou reserva de estoque neste fluxo.
 */
@UseGuards(PublicRateLimitGuard)
@Controller('quotes')
export class QuotesController {
  constructor(@Inject(QuotesService) private readonly quotesService: QuotesService) {}

  @PublicRateLimit({ limit: 10, windowMs: 60_000 })
  @Post()
  create(@Body() body: CreateQuoteDto, @Req() request: Request & { user?: AuthenticatedUser }) {
    return this.quotesService.create({ ...body, userId: request.user?.id });
  }

  @Get(':publicId')
  get(@Param('publicId') publicId: string) {
    return this.quotesService.getPublic(publicId);
  }
}
