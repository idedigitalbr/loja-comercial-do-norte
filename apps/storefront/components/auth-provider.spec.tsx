/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth-provider';

describe('official storefront authentication', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })));
  });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
  it('does not trust cached admin privileges in a public runtime', async () => {
    localStorage.setItem('cn.auth_user.v1', JSON.stringify({ email: 'admin@admin.com', isAdmin: true }));
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/v1/auth/me', expect.objectContaining({ credentials: 'include' })));
    expect(result.current.user).toBeNull();
  });
  it('does not authenticate a demo administrator when the API is offline in production', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    let loggedIn: { ok: boolean } | undefined;
    await act(async () => { loggedIn = await result.current.login('admin@admin.com', 'admin123456'); });
    expect(loggedIn?.ok).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });
  it('uses same-origin login and permission from the server, never the email address', async () => {
    const user = { id: 'real', email: 'admin@admin.com', roles: [], permissions: [] };
    vi.mocked(fetch).mockImplementation(async () => Response.json({ user }));
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    let loggedIn: { isAdmin?: boolean } | undefined;
    await act(async () => { loggedIn = await result.current.login(user.email, 'test-password'); });
    expect(loggedIn?.isAdmin).toBe(false);
    expect(fetch).toHaveBeenCalledWith('/api/v1/auth/login', expect.objectContaining({ credentials: 'include', method: 'POST' }));
  });
  it('preserves offline demo login in local development', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', '');
    vi.mocked(fetch).mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    let loggedIn: { ok: boolean; isAdmin?: boolean } | undefined;
    await act(async () => { loggedIn = await result.current.login('admin@admin.com', 'admin123456'); });
    expect(loggedIn).toMatchObject({ ok: true, isAdmin: true });
  });
});
