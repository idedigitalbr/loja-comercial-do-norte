import { z } from 'zod';
import { MoneySchema } from './money';

export const PaymentMethodSchema = z.enum(['CARD', 'PIX']);
export const PaymentStatusSchema = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
]);

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  requestId: z.string(),
  fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
});

export const PaymentSummarySchema = z.object({
  publicId: z.string(),
  method: PaymentMethodSchema,
  status: PaymentStatusSchema,
  amount: MoneySchema,
  expiresAt: z.string().datetime().nullable(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
