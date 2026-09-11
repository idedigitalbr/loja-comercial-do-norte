export type CardPaymentInput = {
  amountCents: number;
  cardToken: string;
  installments: number;
};

export type PixPaymentInput = {
  amountCents: number;
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
  refundPayment?(input: { externalId: string; amountCents: number }): Promise<{ externalId: string; status: string }>;
}
