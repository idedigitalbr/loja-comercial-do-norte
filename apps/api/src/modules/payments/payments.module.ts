import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { PrismaService } from '../database/prisma.service';
import { SettingsModule } from '../settings/settings.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { NotificationsService } from '../notifications/notifications.service';
import { MercadoPagoProvider } from './mercado-pago.provider';
import { MercadoPagoWebhookController } from './mercado-pago-webhook.controller';
import { PaymentsController } from './payments.controller';
import { PaymentProvider } from './payment-provider';
import { PaymentsService } from './payments.service';

@Module({
  imports: [DatabaseModule, AuthModule, SettingsModule, NotificationsModule],
  controllers: [PaymentsController, MercadoPagoWebhookController],
  providers: [
    MercadoPagoProvider,
    { provide: 'PAYMENT_PROVIDER', useExisting: MercadoPagoProvider },
    { provide: PaymentsService, useFactory: (prisma: PrismaService, provider: PaymentProvider, notifications: NotificationsService) => new PaymentsService(prisma, provider, notifications), inject: [PrismaService, 'PAYMENT_PROVIDER', NotificationsService] },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
