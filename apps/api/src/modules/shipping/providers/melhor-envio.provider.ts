import { ProviderQuote, ShippingInput, ShippingProvider } from '../shipping-provider';

type MelhorEnvioResponse = { price: number; delivery_time: number };
type MelhorEnvioFetcher = (input: ShippingInput) => Promise<MelhorEnvioResponse>;

export class ShippingUnavailableError extends Error {
  readonly code = 'SHIPPING_UNAVAILABLE';

  constructor() {
    super('Serviço de frete indisponível.');
  }
}

export class MelhorEnvioProvider implements ShippingProvider {
  constructor(private readonly fetchQuote: MelhorEnvioFetcher = async () => {
    throw new ShippingUnavailableError();
  }) {}

  async quote(input: ShippingInput): Promise<ProviderQuote> {
    try {
      const result = await this.fetchQuote(input);
      return {
        code: 'MELHOR_ENVIO_STANDARD',
        provider: 'MELHOR_ENVIO',
        label: 'Entrega padrão',
        priceCents: Math.round(result.price),
        deliveryDays: result.delivery_time,
      };
    } catch {
      throw new ShippingUnavailableError();
    }
  }
}
