export type CardPaymentInput = {
  amountCents: number;
  cardToken: string;
  installments: number;
  paymentMethodId?: string;
  payerEmail?: string;
  externalReference?: string;
  idempotencyKey?: string;
};

export type PixPaymentInput = {
  amountCents: number;
  payerEmail?: string;
  externalReference?: string;
  idempotencyKey?: string;
};

export type ProviderPayment = {
  externalId: string;
  status: 'approved' | 'pending' | 'rejected';
  qrCode?: string;
  qrCodeBase64?: string;
  copyPaste?: string;
  expiresAt?: Date;
};

export interface PaymentProvider {
  createCardPayment(input: CardPaymentInput): Promise<ProviderPayment>;
  createPixPayment(input: PixPaymentInput): Promise<ProviderPayment>;
  refundPayment?(input: { externalId: string; amountCents: number; idempotencyKey?: string }): Promise<{ externalId: string; status: string }>;
  getPayment?(externalId: string): Promise<{ status: ProviderPayment['status']; payload: unknown }>;
}
