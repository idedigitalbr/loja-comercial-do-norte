import { describe, expect, it, vi } from 'vitest';
import { GET } from './route';

describe('Storefront /admin Route Handler', () => {
  it('redirects to the configured NEXT_PUBLIC_ADMIN_URL with status 307', async () => {
    vi.stubEnv('NEXT_PUBLIC_ADMIN_URL', 'https://admin-comercialdonorte.vercel.app/admin/');
    try {
      const response = await GET();
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('https://admin-comercialdonorte.vercel.app/admin/');
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('falls back to local admin URL when NEXT_PUBLIC_ADMIN_URL is not set', async () => {
    delete process.env.NEXT_PUBLIC_ADMIN_URL;
    const response = await GET();
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:5174/admin/');
  });
});
