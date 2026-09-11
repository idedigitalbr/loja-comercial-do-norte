import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PrismaService } from '../database/prisma.service';
import { ShippingController } from './shipping.controller';
import { MelhorEnvioProvider } from './providers/melhor-envio.provider';
import { PickupProvider } from './providers/pickup.provider';
import { ShippingService } from './shipping.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ShippingController],
  providers: [
    PickupProvider,
    MelhorEnvioProvider,
    { provide: ShippingService, useFactory: (pickup: PickupProvider, melhorEnvio: MelhorEnvioProvider, prisma: PrismaService) => new ShippingService([pickup, melhorEnvio], prisma), inject: [PickupProvider, MelhorEnvioProvider, PrismaService] },
  ],
  exports: [ShippingService],
})
export class ShippingModule {}
