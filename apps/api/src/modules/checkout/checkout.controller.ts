import { Body, Controller, Get, Headers, Inject, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { IsEmail, IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';
import type { Request, Response } from 'express';
import { FeatureGuard, RequireFeature } from '../../common/features/feature-flags';
import { AuthenticatedUser } from '../auth/auth.service';
import { CheckoutService } from './checkout.service';

class PrepareCheckoutDto {
  @IsString() cartId!: string;
  @IsEmail() contactEmail!: string;
  @IsOptional() @IsInt() @Min(0) shippingCents?: number;
  @IsOptional() @IsString() shippingMethodCode?: string;
  @IsOptional() @IsInt() @Min(0) shippingDays?: number;
  @IsOptional() @IsString() couponCode?: string;
  @IsOptional() @IsObject() shippingAddress?: Record<string, unknown>;
  @IsOptional() @IsObject() billingAddress?: Record<string, unknown>;
}

class QuoteCheckoutDto {
  @IsString() cartId!: string;
  @IsOptional() @IsEmail() contactEmail?: string;
  @IsOptional() @IsString() couponCode?: string;
  @IsOptional() @IsInt() @Min(0) shippingCents?: number;
}

@UseGuards(FeatureGuard)
@RequireFeature('CHECKOUT')
@Controller('checkout')
export class CheckoutController {
  constructor(@Inject(CheckoutService) private readonly checkoutService: CheckoutService) {}

  @Post('prepare')
  async prepare(@Body() body: PrepareCheckoutDto, @Headers('idempotency-key') idempotencyKey: string, @Req() request: Request & { user?: AuthenticatedUser }, @Res({ passthrough: true }) response: Response) {
    const prepared = await this.checkoutService.prepare({ ...body, userId: request.user?.id }, idempotencyKey);
    response.cookie('je_checkout', prepared.orderPublicId, { signed: true, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
    return prepared;
  }

  @Post('quote')
  quote(@Body() body: QuoteCheckoutDto, @Req() request: Request & { user?: AuthenticatedUser }) {
    return this.checkoutService.quote({ ...body, userId: request.user?.id });
  }

  @Get(':publicId')
  get(@Param('publicId') publicId: string) {
    return this.checkoutService.get(publicId);
  }
}
