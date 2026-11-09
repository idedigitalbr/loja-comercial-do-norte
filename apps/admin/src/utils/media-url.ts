import { SyntheticEvent } from 'react';

export const DEFAULT_PLACEHOLDER = '/assets/placeholders/placeholder-1.png';

/**
 * Resolves any image URL stored in the database or passed in drafts into a
 * reliable absolute path or public URL for the admin panel.
 *
 * Handles:
 * - Full remote URLs (http://, https://, data:, blob:)
 * - Storage uploads (uploads/xxx -> /storage/uploads/xxx)
 * - Public assets (assets/xxx -> /assets/xxx)
 * - Relative paths without leading slash
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  if (trimmed.startsWith('uploads/')) {
    return `/storage/${trimmed}`;
  }

  if (trimmed.startsWith('storage/')) {
    return `/${trimmed}`;
  }

  if (trimmed.startsWith('assets/')) {
    return `/${trimmed}`;
  }

  if (!trimmed.startsWith('/')) {
    return `/${trimmed}`;
  }

  return trimmed;
}

/**
 * Fallback handler for <img> onError events to display a placeholder and
 * prevent infinite error loops.
 */
export function handleImageFallback(
  event: SyntheticEvent<HTMLImageElement>,
  fallbackSrc = DEFAULT_PLACEHOLDER
) {
  const target = event.currentTarget;
  target.onerror = null;
  target.src = fallbackSrc;
}
