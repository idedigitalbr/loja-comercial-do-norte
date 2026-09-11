import { z } from 'zod';
import { MoneySchema } from './money';

export const CatalogStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']);

export const ProductSummarySchema = z.object({
  publicId: z.string(),
  slug: z.string(),
  name: z.string(),
  brandName: z.string().nullable(),
  price: MoneySchema,
  available: z.boolean(),
});

export type ProductSummary = z.infer<typeof ProductSummarySchema>;
