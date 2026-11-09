import { describe, expect, it } from 'vitest';
import { resolveMediaUrl } from './media-url';

describe('resolveMediaUrl', () => {
  it('returns empty string for null or undefined or empty', () => {
    expect(resolveMediaUrl(null)).toBe('');
    expect(resolveMediaUrl(undefined)).toBe('');
    expect(resolveMediaUrl('   ')).toBe('');
  });

  it('keeps absolute URLs intact', () => {
    expect(resolveMediaUrl('https://example.com/photo.jpg')).toBe('https://example.com/photo.jpg');
    expect(resolveMediaUrl('http://example.com/photo.jpg')).toBe('http://example.com/photo.jpg');
    expect(resolveMediaUrl('data:image/png;base64,...')).toBe('data:image/png;base64,...');
  });

  it('prepends /storage/ to uploads/ paths', () => {
    expect(resolveMediaUrl('uploads/seed-fasapel/960.webp')).toBe('/storage/uploads/seed-fasapel/960.webp');
  });

  it('prepends slash to storage/ paths', () => {
    expect(resolveMediaUrl('storage/uploads/seed-fasapel/960.webp')).toBe('/storage/uploads/seed-fasapel/960.webp');
  });

  it('prepends slash to assets/ paths', () => {
    expect(resolveMediaUrl('assets/HOME Vitrine/doces.webp')).toBe('/assets/HOME Vitrine/doces.webp');
  });

  it('preserves paths that already start with slash', () => {
    expect(resolveMediaUrl('/assets/HOME Vitrine/doces.webp')).toBe('/assets/HOME Vitrine/doces.webp');
    expect(resolveMediaUrl('/storage/uploads/seed-fasapel/960.webp')).toBe('/storage/uploads/seed-fasapel/960.webp');
  });
});
