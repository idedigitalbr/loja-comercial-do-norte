import { Body, Controller, Get, Inject, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CouponDiscountType, CouponStatus } from '@prisma/client';
import { ArrayUnique, IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { PromotionsService } from './promotions.service';

class CouponDto {
  @IsString() code!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(CouponDiscountType) discountType?: CouponDiscountType;
  @IsOptional() @IsInt() @Min(0) discountValue?: number;
  @IsOptional() @IsBoolean() allowFreeShipping?: boolean;
  @IsOptional() @IsBoolean() individualUse?: boolean;
  @IsOptional() @IsBoolean() excludeSaleItems?: boolean;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() endsAt?: string | null;
  @IsOptional() @IsInt() @Min(1) usageLimit?: number;
  @IsOptional() @IsInt() @Min(1) perCustomerLimit?: number;
  @IsOptional() @IsInt() @Min(0) minimumSubtotalCents?: number;
  @IsOptional() @IsInt() @Min(0) maximumSubtotalCents?: number;
  @IsOptional() @IsInt() @Min(1) maxEligibleItems?: number;
  @IsOptional() @IsArray() @ArrayUnique() @IsString({ each: true }) productIds?: string[];
  @IsOptional() @IsArray() @ArrayUnique() @IsString({ each: true }) excludedProductIds?: string[];
  @IsOptional() @IsArray() @ArrayUnique() @IsString({ each: true }) brandIds?: string[];
  @IsOptional() @IsArray() @ArrayUnique() @IsString({ each: true }) excludedBrandIds?: string[];
  @IsOptional() @IsArray() @ArrayUnique() @IsString({ each: true }) categoryIds?: string[];
  @IsOptional() @IsArray() @ArrayUnique() @IsString({ each: true }) excludedCategoryIds?: string[];
  @IsOptional() @IsArray() @ArrayUnique() @IsString({ each: true }) emailPatterns?: string[];
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
    return this.promotionsService.createCoupon({ ...body, startsAt: body.startsAt ? new Date(body.startsAt) : undefined, endsAt: body.endsAt === null ? null : body.endsAt ? new Date(body.endsAt) : undefined });
  }

  @Patch('coupons/:id')
  updateCoupon(@Param('id') id: string, @Body() body: CouponDto) {
    return this.promotionsService.updateCoupon(id, { ...body, startsAt: body.startsAt ? new Date(body.startsAt) : undefined, endsAt: body.endsAt === null ? null : body.endsAt ? new Date(body.endsAt) : undefined });
  }
}
