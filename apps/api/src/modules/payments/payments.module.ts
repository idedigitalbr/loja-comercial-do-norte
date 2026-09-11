import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PrismaService } from '../database/prisma.service';
import { MercadoPagoProvider } from './mercado-pago.provider';
import { MercadoPagoWebhookController } from './mercado-pago-webhook.controller';
import { PaymentsController } from './payments.controller';
import { PaymentProvider } from './payment-provider';
import { PaymentsService } from './payments.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PaymentsController, MercadoPagoWebhookController],
  providers: [
    MercadoPagoProvider,
    { provide: 'PAYMENT_PROVIDER', useExisting: MercadoPagoProvider },
    { provide: PaymentsService, useFactory: (prisma: PrismaService, provider: PaymentProvider) => new PaymentsService(prisma, provider), inject: [PrismaService, 'PAYMENT_PROVIDER'] },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
