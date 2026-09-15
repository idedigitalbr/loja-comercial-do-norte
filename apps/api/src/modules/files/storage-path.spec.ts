import { describe, expect, it } from 'vitest';
import { normalizeStoredMediaPath, publicStoragePath } from './storage-path';

describe('storage media paths', () => {
  it('keeps generated upload paths under the public uploads namespace', () => {
    expect(normalizeStoredMediaPath('/storage/uploads/site/logo.webp')).toBe('uploads/site/logo.webp');
    expect(publicStoragePath('uploads/site/logo.webp')).toBe('/storage/uploads/site/logo.webp');
  });

  it('rejects paths outside local uploads and hides malformed persisted values', () => {
    expect(() => normalizeStoredMediaPath('https://example.com/logo.webp')).toThrow('INVALID_MEDIA_PATH');
    expect(() => normalizeStoredMediaPath('uploads/../secrets.txt')).toThrow('INVALID_MEDIA_PATH');
    expect(publicStoragePath('/etc/passwd')).toBeNull();
  });
});
