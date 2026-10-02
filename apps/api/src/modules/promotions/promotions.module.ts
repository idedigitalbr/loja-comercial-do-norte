import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { AdminPromotionsController } from './admin-promotions.controller';
import { CouponService } from './coupon.service';
import { PromotionsService } from './promotions.service';

@Module({ imports: [DatabaseModule, AuthModule], controllers: [AdminPromotionsController], providers: [PromotionsService, CouponService], exports: [PromotionsService, CouponService] })
export class PromotionsModule {}
