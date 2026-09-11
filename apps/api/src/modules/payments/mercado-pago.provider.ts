import { PaymentProvider, CardPaymentInput, PixPaymentInput, ProviderPayment } from './payment-provider';

export class MercadoPagoProvider implements PaymentProvider {
  async createCardPayment(_input: CardPaymentInput): Promise<ProviderPayment> {
    throw new Error('MERCADO_PAGO_NOT_CONFIGURED');
  }

  async createPixPayment(_input: PixPaymentInput): Promise<ProviderPayment> {
    throw new Error('MERCADO_PAGO_NOT_CONFIGURED');
  }

  async refundPayment(_input: { externalId: string; amountCents: number }): Promise<{ externalId: string; status: string }> {
    throw new Error('MERCADO_PAGO_NOT_CONFIGURED');
  }
}
