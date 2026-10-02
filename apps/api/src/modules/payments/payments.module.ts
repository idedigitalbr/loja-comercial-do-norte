import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { PrismaService } from '../database/prisma.service';
import { SettingsModule } from '../settings/settings.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { NotificationsService } from '../notifications/notifications.service';
import { PromotionsModule } from '../promotions/promotions.module';
import { CouponService } from '../promotions/coupon.service';
import { MercadoPagoProvider } from './mercado-pago.provider';
import { MercadoPagoWebhookController } from './mercado-pago-webhook.controller';
import { PaymentsController } from './payments.controller';
import { PaymentProvider } from './payment-provider';
import { PaymentsService } from './payments.service';

@Module({
  imports: [DatabaseModule, AuthModule, SettingsModule, NotificationsModule, PromotionsModule],
  controllers: [PaymentsController, MercadoPagoWebhookController],
  providers: [
    MercadoPagoProvider,
    { provide: 'PAYMENT_PROVIDER', useExisting: MercadoPagoProvider },
    { provide: PaymentsService, useFactory: (prisma: PrismaService, provider: PaymentProvider, notifications: NotificationsService, couponService: CouponService) => new PaymentsService(prisma, provider, notifications, couponService), inject: [PrismaService, 'PAYMENT_PROVIDER', NotificationsService, CouponService] },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
