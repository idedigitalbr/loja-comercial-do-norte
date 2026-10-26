import { z } from 'zod';

export const StorefrontCompositionSchema = z.object({
  page: z.literal('home'),
  version: z.number().int().positive(),
  widgets: z.array(z.object({
    id: z.string().min(1).max(120),
    type: z.enum([
      'hero-carousel', 'contained-hero', 'benefits-bar', 'product-carousel',
      'category-grid', 'banner-grid', 'brands-carousel', 'quote-steps-banner',
      'segments-carousel', 'promo-strip', 'events-carousel', 'video-articles-carousel',
      'instagram-feed', 'testimonials-grid', 'store-locations-map',
    ]),
    enabled: z.boolean(),
    order: z.number().int().nonnegative(),
    props: z.record(z.string(), z.json()),
  }).strict()).min(1).max(100),
}).strict().superRefine((composition, context) => {
  if (new Set(composition.widgets.map((widget) => widget.id)).size !== composition.widgets.length) {
    context.addIssue({ code: 'custom', message: 'IDs de widgets devem ser únicos.' });
  }
  if (JSON.stringify(composition).length > 500_000) {
    context.addIssue({ code: 'custom', message: 'Composição excede o limite permitido.' });
  }
});

export type StorefrontComposition = z.infer<typeof StorefrontCompositionSchema>;
