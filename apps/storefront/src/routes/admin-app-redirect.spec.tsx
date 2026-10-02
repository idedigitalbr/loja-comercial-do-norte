import { describe, expect, it } from 'vitest';
import { getAdminAppUrl } from './admin-app-redirect';

describe('admin app redirect', () => {
  it('uses the dedicated local admin app during development', () => {
    expect(getAdminAppUrl({ DEV: true }, 'http://localhost:5173')).toBe('http://localhost:5174/admin/');
  });

  it('keeps a configured admin URL as the deployment contract', () => {
    expect(getAdminAppUrl({ DEV: false, VITE_ADMIN_URL: 'https://admin.example.com/admin' }, 'https://loja.example.com')).toBe('https://admin.example.com/admin/');
  });
});
