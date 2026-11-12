import { z } from 'zod';

const UNSAFE_OBJECT_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const CONTROL_CHARS_RE = /[\u0000-\u001F\u007F]/;
const DANGEROUS_CHARS_RE = /[<>"'`\\]/;
const PATH_TRAVERSAL_RE = /(?:^|\/)\.\.(?:\/|$)/;

const LINK_URL_KEYS = new Set([
  'linkUrl',
  'ctaUrl',
  'buttonUrl',
  'actionUrl',
  'externalUrl',
  'mapExternalUrl',
  'whatsappUrl',
  'href',
  'url',
  'videoUrl',
  'permalink',
]);

const IMAGE_URL_KEYS = new Set([
  'imageUrl',
  'mobileImageUrl',
  'thumbnailUrl',
  'thumbUrl',
  'logoUrl',
  'avatarUrl',
  'iconUrl',
  'bannerUrl',
  'backgroundImageUrl',
  'src',
]);

const MAP_EMBED_URL_KEYS = new Set(['mapEmbedUrl']);

function isSafeRelativePath(value: string): boolean {
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return false;
  }
  if (CONTROL_CHARS_RE.test(value) || DANGEROUS_CHARS_RE.test(value)) {
    return false;
  }
  const pathOnly = value.split(/[?#]/, 1)[0] ?? '';
  try {
    const decoded = decodeURIComponent(pathOnly);
    if (PATH_TRAVERSAL_RE.test(decoded) || decoded.includes('\\')) {
      return false;
    }
  } catch {
    // Malformed percent-encoding falls through to raw check
  }
  return !PATH_TRAVERSAL_RE.test(pathOnly);
}

function isValidLinkUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (CONTROL_CHARS_RE.test(trimmed) || DANGEROUS_CHARS_RE.test(trimmed)) return false;
  if (trimmed === '#' || (trimmed.startsWith('#') && !/\s/.test(trimmed))) return true;
  if (isSafeRelativePath(trimmed)) return true;
  try {
    const parsed = new URL(trimmed);
    return ['https:', 'http:', 'mailto:', 'tel:'].includes(parsed.protocol.toLowerCase());
  } catch {
    return false;
  }
}

function isValidImageUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (CONTROL_CHARS_RE.test(trimmed) || DANGEROUS_CHARS_RE.test(trimmed)) return false;
  if (trimmed.toLowerCase().startsWith('data:')) return false;
  if (isSafeRelativePath(trimmed)) return true;
  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol === 'https:') return true;
    return (
      protocol === 'http:' &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
    );
  } catch {
    return false;
  }
}

function isValidMapEmbedUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (CONTROL_CHARS_RE.test(trimmed) || DANGEROUS_CHARS_RE.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol.toLowerCase() !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    const isGoogleHost =
      host === 'www.google.com' || host === 'google.com' || host === 'maps.google.com';
    return isGoogleHost && parsed.pathname.toLowerCase().startsWith('/maps');
  } catch {
    return false;
  }
}

function validatePropsSecurity(
  value: unknown,
  path: Array<string | number>,
  context: z.RefinementCtx,
): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => validatePropsSecurity(item, [...path, index], context));
    return;
  }
  if (!value || typeof value !== 'object') {
    return;
  }
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (UNSAFE_OBJECT_KEYS.has(key)) {
      context.addIssue({
        code: 'custom',
        path: [...path, key],
        message: `Chave não permitida na composição: ${key}.`,
      });
      continue;
    }
    const entry = record[key];
    if (typeof entry === 'string') {
      if (LINK_URL_KEYS.has(key) && !isValidLinkUrl(entry)) {
        context.addIssue({
          code: 'custom',
          path: [...path, key],
          message: `URL de link inválida em ${key}.`,
        });
      } else if (IMAGE_URL_KEYS.has(key) && !isValidImageUrl(entry)) {
        context.addIssue({
          code: 'custom',
          path: [...path, key],
          message: `URL de imagem inválida ou insegura em ${key}.`,
        });
      } else if (MAP_EMBED_URL_KEYS.has(key) && !isValidMapEmbedUrl(entry)) {
        context.addIssue({
          code: 'custom',
          path: [...path, key],
          message: `URL de incorporação de mapa inválida em ${key}.`,
        });
      }
      continue;
    }
    validatePropsSecurity(entry, [...path, key], context);
  }
}

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
    props: z
      .unknown()
      .superRefine((props, context) => {
        if (!props || typeof props !== 'object' || Array.isArray(props)) {
          context.addIssue({
            code: 'custom',
            message: 'Propriedades do widget inválidas.',
          });
          return;
        }
        validatePropsSecurity(props, [], context);
      })
      .pipe(z.record(z.string(), z.json())),
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
