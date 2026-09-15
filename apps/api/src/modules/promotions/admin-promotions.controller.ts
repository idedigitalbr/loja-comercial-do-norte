import { Body, Controller, Get, Inject, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CouponStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { PromotionsService } from './promotions.service';

class CouponDto {
  @IsString() code!: string;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() endsAt?: string;
  @IsOptional() @IsInt() @Min(1) usageLimit?: number;
  @IsOptional() @IsInt() @Min(1) perCustomerLimit?: number;
  @IsOptional() @IsInt() @Min(0) minimumSubtotalCents?: number;
  @IsOptional() @IsEnum(CouponStatus) status?: CouponStatus;
}

@UseGuards(SessionGuard, PermissionGuard)
@RequirePermissions(Permissions.PROMOTIONS_PUBLISH)
@Controller('admin/promotions')
export class AdminPromotionsController {
  constructor(@Inject(PromotionsService) private readonly promotionsService: PromotionsService) {}

  @Get('coupons')
  listCoupons() {
    return this.promotionsService.listCoupons();
  }

  @Post('coupons')
  createCoupon(@Body() body: CouponDto) {
    return this.promotionsService.createCoupon({ ...body, startsAt: body.startsAt ? new Date(body.startsAt) : undefined, endsAt: body.endsAt ? new Date(body.endsAt) : undefined });
  }

  @Patch('coupons/:id')
  updateCoupon(@Param('id') id: string, @Body() body: CouponDto) {
    return this.promotionsService.updateCoupon(id, { ...body, startsAt: body.startsAt ? new Date(body.startsAt) : undefined, endsAt: body.endsAt ? new Date(body.endsAt) : undefined });
  }
}
