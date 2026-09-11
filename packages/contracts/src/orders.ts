import { z } from 'zod';
import { MoneySchema } from './money';

export const PriceAdjustmentSchema = z.object({
  code: z.string(),
  label: z.string(),
  amount: MoneySchema,
});

export const PriceQuoteSchema = z.object({
  cartId: z.string(),
  subtotal: MoneySchema,
  discount: MoneySchema,
  shipping: MoneySchema,
  total: MoneySchema,
  adjustments: z.array(PriceAdjustmentSchema),
  expiresAt: z.string().datetime(),
});

export const OrderStatusSchema = z.enum([
  'DRAFT',
  'AWAITING_PAYMENT',
  'PAID',
  'PREPARING',
  'SHIPPED',
  'READY_FOR_PICKUP',
  'COMPLETED',
  'CANCELLED',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
]);

export type PriceQuote = z.infer<typeof PriceQuoteSchema>;
