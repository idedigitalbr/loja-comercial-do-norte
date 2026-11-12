import { z } from 'zod';
import { MoneySchema } from './money';

export const CatalogStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']);
export const CatalogAuditHealthSchema = z.enum(['GREEN', 'YELLOW', 'RED']);
export const PricingModeSchema = z.enum(['QUOTE_ONLY', 'FIXED_PRICE']);

export const ProductSummarySchema = z.object({
  publicId: z.string(),
  slug: z.string(),
  name: z.string(),
  brandName: z.string().nullable(),
  pricingMode: PricingModeSchema.default('QUOTE_ONLY'),
  price: MoneySchema.nullable(),
  available: z.boolean(),
  auditHealth: CatalogAuditHealthSchema.optional(),
});

export type ProductSummary = z.infer<typeof ProductSummarySchema>;
