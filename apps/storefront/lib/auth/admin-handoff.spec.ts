/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildAdminUrlWithHandoff, openAdminPanel, resolveAdminPanelUrl } from './admin-handoff';

describe('admin-handoff client helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('appends #handoff= ticket when /api/v1/auth/admin-handoff succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 'abc.def' }), { status: 201 })),
    );

    const target = await buildAdminUrlWithHandoff('https://admin-comercialdonorte.vercel.app');
    expect(target).toBe('https://admin-comercialdonorte.vercel.app#handoff=abc.def');
  });

  it('falls back to base URL when handoff endpoint fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    const target = await buildAdminUrlWithHandoff('http://localhost:5174/admin/');
    expect(target).toBe('http://localhost:5174/admin/');
  });

  it('matches 127.0.0.1 locally when NEXT_PUBLIC_ADMIN_URL uses localhost', () => {
    vi.stubEnv('NEXT_PUBLIC_ADMIN_URL', 'http://localhost:5174/admin/');
    vi.stubGlobal('location', { hostname: '127.0.0.1' });

    expect(resolveAdminPanelUrl()).toBe('http://127.0.0.1:5174/admin/');
  });

  it('opens a popup synchronously and navigates it with opener=null', async () => {
    const replace = vi.fn();
    const fakePopup = { closed: false, opener: window, location: { replace } };
    vi.stubGlobal('open', vi.fn().mockReturnValue(fakePopup));
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 'ticket-1' }), { status: 201 })),
    );

    await openAdminPanel({ newTab: true });

    expect(window.open).toHaveBeenCalledWith('about:blank', '_blank');
    expect(fakePopup.opener).toBeNull();
    expect(replace).toHaveBeenCalledWith('http://localhost:5174/admin/#handoff=ticket-1');
  });
});
