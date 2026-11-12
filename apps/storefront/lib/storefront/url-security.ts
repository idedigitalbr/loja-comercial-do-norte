const UNSAFE_OBJECT_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const CONTROL_CHARS_RE = /[\u0000-\u001F\u007F]/;
const DANGEROUS_CHARS_RE = /[<>"'`\\]/;
const PATH_TRAVERSAL_RE = /(?:^|\/)\.\.(?:\/|$)/;
const SAFE_RASTER_DATA_IMAGE_RE = /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i;

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

function normalizeRawUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (CONTROL_CHARS_RE.test(trimmed) || DANGEROUS_CHARS_RE.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function isSafeRelativePath(value: string): boolean {
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
    // Malformed percent-encoding can still be checked directly on raw path
  }
  return !PATH_TRAVERSAL_RE.test(pathOnly);
}

export function isValidLinkUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return true; // empty means optional/unset
  if (CONTROL_CHARS_RE.test(trimmed) || DANGEROUS_CHARS_RE.test(trimmed)) {
    return false;
  }
  if (trimmed === '#' || (trimmed.startsWith('#') && !/\s/.test(trimmed))) {
    return true;
  }
  if (isSafeRelativePath(trimmed)) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    return (
      protocol === 'https:' ||
      protocol === 'http:' ||
      protocol === 'mailto:' ||
      protocol === 'tel:'
    );
  } catch {
    return false;
  }
}

export function sanitizeLinkUrl(value: unknown, fallback = '#'): string {
  const normalized = normalizeRawUrl(value);
  if (!normalized) return fallback;
  return isValidLinkUrl(normalized) ? normalized : fallback;
}

export interface SanitizeImageUrlOptions {
  allowSafeRasterDataUrl?: boolean;
  allowHttpLocalhost?: boolean;
}

export function isValidImageUrl(
  value: unknown,
  options: SanitizeImageUrlOptions = {},
): boolean {
  const { allowSafeRasterDataUrl = false, allowHttpLocalhost = true } = options;
  const normalized = normalizeRawUrl(value);
  if (!normalized) return false;

  if (normalized.toLowerCase().startsWith('data:')) {
    if (!allowSafeRasterDataUrl) return false;
    return SAFE_RASTER_DATA_IMAGE_RE.test(normalized);
  }

  if (isSafeRelativePath(normalized)) {
    return true;
  }

  try {
    const parsed = new URL(normalized);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol === 'https:') {
      return true;
    }
    if (
      allowHttpLocalhost &&
      protocol === 'http:' &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function sanitizeImageUrl(
  value: unknown,
  fallback = '',
  options: SanitizeImageUrlOptions = {},
): string {
  const normalized = normalizeRawUrl(value);
  if (!normalized) return fallback;
  return isValidImageUrl(normalized, options) ? normalized : fallback;
}

export function isValidMapEmbedUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (CONTROL_CHARS_RE.test(trimmed) || DANGEROUS_CHARS_RE.test(trimmed)) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol.toLowerCase() !== 'https:') {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    const isGoogleMapsHost =
      hostname === 'www.google.com' ||
      hostname === 'google.com' ||
      hostname === 'maps.google.com';
    if (!isGoogleMapsHost) {
      return false;
    }
    return parsed.pathname.toLowerCase().startsWith('/maps');
  } catch {
    return false;
  }
}

export function sanitizeMapEmbedUrl(value: unknown, fallback = ''): string {
  const normalized = normalizeRawUrl(value);
  if (!normalized) return fallback;
  return isValidMapEmbedUrl(normalized) ? normalized : fallback;
}

export function stripUnsafeKeys<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => stripUnsafeKeys(item)) as unknown as T;
  }
  if (input && typeof input === 'object') {
    const record = input as Record<string, unknown>;
    const clean: Record<string, unknown> = {};
    for (const key of Object.keys(record)) {
      if (UNSAFE_OBJECT_KEYS.has(key)) {
        continue;
      }
      clean[key] = stripUnsafeKeys(record[key]);
    }
    return clean as T;
  }
  return input;
}

export function sanitizePropsObject<T>(
  input: T,
  options: { allowSafeRasterDataUrl?: boolean } = {},
): T {
  const { allowSafeRasterDataUrl = false } = options;

  if (Array.isArray(input)) {
    return input.map((item) => sanitizePropsObject(item, options)) as unknown as T;
  }

  if (input && typeof input === 'object') {
    const record = input as Record<string, unknown>;
    const clean: Record<string, unknown> = {};
    for (const key of Object.keys(record)) {
      if (UNSAFE_OBJECT_KEYS.has(key)) {
        continue;
      }
      const rawValue = record[key];
      if (typeof rawValue === 'string') {
        const trimmed = rawValue.trim();
        if (LINK_URL_KEYS.has(key)) {
          clean[key] = trimmed === '' ? '' : sanitizeLinkUrl(trimmed, '#');
          continue;
        }
        if (IMAGE_URL_KEYS.has(key)) {
          clean[key] =
            trimmed === ''
              ? ''
              : sanitizeImageUrl(trimmed, '', { allowSafeRasterDataUrl });
          continue;
        }
        if (MAP_EMBED_URL_KEYS.has(key)) {
          clean[key] = trimmed === '' ? '' : sanitizeMapEmbedUrl(trimmed, '');
          continue;
        }
      }
      clean[key] = sanitizePropsObject(rawValue, options);
    }
    return clean as T;
  }

  return input;
}

export function sanitizeCompositionProps<
  T extends { widgets?: Array<{ props?: Record<string, unknown> }> },
>(
  composition: T,
  options: { allowSafeRasterDataUrl?: boolean } = {},
): T {
  const stripped = stripUnsafeKeys(composition);
  if (!stripped || !Array.isArray(stripped.widgets)) {
    return stripped;
  }
  return {
    ...stripped,
    widgets: stripped.widgets.map((widget) => ({
      ...widget,
      props: sanitizePropsObject(widget.props ?? {}, options),
    })),
  };
}

export function resolveSafeRedirectUrl(
  redirectUrl: string | null | undefined,
  options: {
    isAdmin?: boolean;
    adminUrl?: string;
    currentOrigin?: string;
  } = {},
): string {
  const {
    isAdmin = false,
    adminUrl = 'http://localhost:5174/admin/',
    currentOrigin,
  } = options;

  const trimmed = typeof redirectUrl === 'string' ? redirectUrl.trim() : '';

  if (!trimmed || trimmed === '/conta') {
    return isAdmin ? adminUrl : '/';
  }

  if (isSafeRelativePath(trimmed)) {
    return trimmed;
  }

  try {
    const parsedTarget = new URL(trimmed);
    const protocol = parsedTarget.protocol.toLowerCase();
    if (protocol !== 'https:' && protocol !== 'http:') {
      return isAdmin ? adminUrl : '/';
    }

    if (currentOrigin && parsedTarget.origin === currentOrigin) {
      return `${parsedTarget.pathname}${parsedTarget.search}${parsedTarget.hash}`;
    }

    if (isAdmin) {
      try {
        const parsedAdmin = new URL(adminUrl);
        if (parsedTarget.origin === parsedAdmin.origin) {
          return parsedTarget.toString();
        }
      } catch {
        // Ignore malformed adminUrl
      }
    }
  } catch {
    // Reject non-URL arbitrary strings
  }

  return isAdmin ? adminUrl : '/';
}
