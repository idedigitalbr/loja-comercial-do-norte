import { BadRequestException } from '@nestjs/common';

const STORAGE_PREFIX = 'storage/';
const UPLOADS_PREFIX = 'uploads/';
const MEDIA_PATH_PATTERN = /^uploads\/[A-Za-z0-9][A-Za-z0-9._-]*(?:\/[A-Za-z0-9][A-Za-z0-9._-]*)+$/;

/**
 * Converts an API/public media URL to the relative path stored in the database.
 * Only files below storage/uploads are accepted; absolute paths and remote URLs
 * are deliberately rejected so settings cannot turn into an arbitrary file
 * publisher.
 */
export function normalizeStoredMediaPath(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  let normalized = value.trim().replace(/^\/+/, '');
  if (normalized.startsWith(STORAGE_PREFIX)) normalized = normalized.slice(STORAGE_PREFIX.length);
  if (!normalized.startsWith(UPLOADS_PREFIX) || !MEDIA_PATH_PATTERN.test(normalized)) {
    throw new BadRequestException('INVALID_MEDIA_PATH');
  }
  return normalized;
}

export function publicStoragePath(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const normalized = normalizeStoredMediaPath(value);
    return normalized ? `/${STORAGE_PREFIX}${normalized}` : null;
  } catch {
    return null;
  }
}

export const SUPPORTED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function imageFileFilter(
  _request: unknown,
  file: { mimetype?: string },
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  if (!file.mimetype || !SUPPORTED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    callback(new BadRequestException({ code: 'UNSUPPORTED_IMAGE_TYPE', message: 'Use uma imagem JPG, PNG ou WEBP.' }), false);
    return;
  }
  callback(null, true);
}

export function imageUploadErrorCode(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  return ['UNSUPPORTED_IMAGE_TYPE', 'IMAGE_TOO_LARGE', 'INVALID_IMAGE_NAME'].includes(code)
    ? code
    : 'INVALID_IMAGE';
}
