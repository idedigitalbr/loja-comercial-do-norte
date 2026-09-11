export type ShippingInput = {
  postalCode: string;
  totalCents: number;
};

export type ProviderQuote = {
  code: string;
  provider: string;
  label: string;
  priceCents: number;
  deliveryDays: number;
};

export interface ShippingProvider {
  quote(input: ShippingInput): Promise<ProviderQuote>;
}
