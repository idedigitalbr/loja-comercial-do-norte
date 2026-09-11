import { ProviderQuote, ShippingInput, ShippingProvider } from '../shipping-provider';

export class PickupProvider implements ShippingProvider {
  async quote(_input: ShippingInput): Promise<ProviderQuote> {
    return {
      code: 'PICKUP_SALON',
      provider: 'PICKUP',
      label: 'Retirada no salão',
      priceCents: 0,
      deliveryDays: 1,
    };
  }
}
