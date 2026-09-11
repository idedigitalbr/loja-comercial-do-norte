import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ShippingQuoteStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ProviderQuote, ShippingInput, ShippingProvider } from './shipping-provider';

@Injectable()
export class ShippingService {
  constructor(private readonly providers: ShippingProvider[] = [], private readonly prisma?: PrismaService) {}

  async quote(input: ShippingInput): Promise<ProviderQuote[]> {
    const results = await Promise.allSettled(this.providers.map((provider) => provider.quote(input)));
    const quotes = results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
    if (!quotes.length) throw new ServiceUnavailableException('SHIPPING_UNAVAILABLE');
    return quotes;
  }

  async snapshotQuote(input: {
    cartId?: string;
    orderId?: string;
    option: ProviderQuote;
    originPostalCode: string;
    destinationPostalCode: string;
    expiresAt: Date;
  }) {
    if (!this.prisma) throw new Error('DATABASE_NOT_CONFIGURED');
    return this.prisma.shippingQuote.create({
      data: {
        cartId: input.cartId,
        orderId: input.orderId,
        status: ShippingQuoteStatus.QUOTED,
        provider: input.option.provider,
        serviceCode: input.option.code,
        priceCents: input.option.priceCents,
        deliveryDays: input.option.deliveryDays,
        originPostalCode: input.originPostalCode,
        destinationPostalCode: input.destinationPostalCode,
        expiresAt: input.expiresAt,
      },
    });
  }
}
