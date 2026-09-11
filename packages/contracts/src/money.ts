import { z } from 'zod';

export const MoneySchema = z.object({
  amount: z.number().int().nonnegative(),
  currency: z.literal('BRL'),
});

export type Money = z.infer<typeof MoneySchema>;
