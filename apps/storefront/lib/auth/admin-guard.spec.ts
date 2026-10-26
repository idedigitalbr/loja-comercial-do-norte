import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { verifyAdminAuthorization } from './admin-guard';

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  }),
}));

describe('admin-guard (Segurança por Ambiente)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.VERCEL;
    (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  it('permite bypass de x-admin-role em desenvolvimento/testes locais', async () => {
    const request = new Request('http://localhost:3001/api/storefront/composition', {
      headers: {
        'x-admin-role': 'ADMIN',
        'x-admin-name': 'Codex Agent',
        'x-admin-email': 'codex@agent.local',
      },
    });

    const result = await verifyAdminAuthorization(request);
    expect(result.isAdmin).toBe(true);
    expect(result.authorName).toBe('Codex Agent');
    expect(result.authorEmail).toBe('codex@agent.local');
  });

  it('rejeita usuário sem credenciais em ambiente de desenvolvimento', async () => {
    const request = new Request('http://localhost:3001/api/storefront/composition');
    const result = await verifyAdminAuthorization(request);
    expect(result.isAdmin).toBe(false);
  });

  it('BLOQUEIA bypass de x-admin-role quando em PRODUÇÃO na Vercel', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    process.env.VERCEL = '1';

    const request = new Request('https://lojacomercialdonorte.vercel.app/api/storefront/composition', {
      headers: {
        'x-admin-role': 'ADMIN',
      },
    });

    const result = await verifyAdminAuthorization(request);
    expect(result.isAdmin).toBe(false);
    expect(result.reason).toContain('produção');
  });

  it('não transforma segredo de cron em autorização de publicação em produção', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    process.env.VERCEL = '1';
    process.env.CRON_SECRET = 'super-secret-service-token-123';

    const request = new Request('https://lojacomercialdonorte.vercel.app/api/storefront/composition', {
      headers: {
        'x-admin-secret': 'super-secret-service-token-123',
        'x-admin-name': 'Pipeline CI/CD',
        'x-admin-email': 'deploy@comercialdonorte.local',
      },
    });

    const result = await verifyAdminAuthorization(request);
    expect(result.isAdmin).toBe(false);
  });

  it('interpreta o contrato { user } e encaminha a sessão com settings.manage', async () => {
    process.env.VERCEL = '1';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ user: {
      id: 'admin', email: 'editor@localhost', permissions: ['settings.manage'],
    } })));
    const result = await verifyAdminAuthorization(new Request('https://store.local', { headers: { Authorization: 'Bearer session' } }));
    expect(result.isAdmin).toBe(true);
    expect(result.authorEmail).toBe('editor@localhost');
    expect(result.headers).toEqual({ Authorization: 'Bearer session' });
  });

  it.each([
    { roles: ['ADMIN'], permissions: [] },
    { email: 'admin@admin.com' },
    null,
  ])('rejeita sessão sem permissão settings.manage: %j', async (user) => {
    process.env.VERCEL = '1';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ user })));
    expect((await verifyAdminAuthorization(new Request('https://store.local', { headers: { Authorization: 'Bearer session' } }))).isAdmin).toBe(false);
  });
});
