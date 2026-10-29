import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DELETE, GET, POST } from './route';
import { defaultHomeComposition } from '@/lib/storefront/home-configuration';

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('API Route /api/storefront/composition', () => {
  let directory: string;
  beforeEach(async () => {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), 'cn-route-test-'));
    vi.stubEnv('STOREFRONT_DATA_DIR', directory);
    vi.stubEnv('NODE_ENV', 'test'); vi.stubEnv('VERCEL', '');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  });
  afterEach(async () => {
    vi.unstubAllGlobals(); vi.unstubAllEnvs();
    await fs.rm(directory, { recursive: true, force: true });
  });
  it('GET retorna sucesso e a composição de widgets', async () => {
    const res = await GET();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.page).toBe('home');
    expect(Array.isArray(json.data.widgets)).toBe(true);
  });

  it('POST rejeita requisição de usuário comum / não administrador com 403', async () => {
    const request = new Request('http://localhost:3001/api/storefront/composition', {
      method: 'POST',
      body: JSON.stringify(defaultHomeComposition),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(request);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain('Acesso negado');
  });

  it('POST autoriza e persiste quando enviado por administrador autenticado', async () => {
    const request = new Request('http://localhost:3001/api/storefront/composition', {
      method: 'POST',
      body: JSON.stringify(defaultHomeComposition),
      headers: {
        'Content-Type': 'application/json',
        'x-admin-role': 'ADMIN',
      },
    });

    const res = await POST(request);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain('salva no servidor');
    expect(json.widgetsCount).toBeGreaterThan(0);
  });
  it('never returns success or revalidates after a failed production write', async () => {
    vi.stubEnv('VERCEL', '1');
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({ user: { email: 'editor@localhost', permissions: ['settings.manage'] } }))
      .mockResolvedValueOnce(new Response('{}', { status: 503 }));
    const result = await POST(new Request('https://store.local/api/storefront/composition', {
      method: 'POST', headers: { authorization: 'Bearer editor', 'content-type': 'application/json' },
      body: JSON.stringify(defaultHomeComposition),
    }));
    expect(result.status).toBe(500);
    expect((await result.json()).success).toBe(false);
    expect(await fs.readdir(directory)).toEqual([]);
  });
  it('rejects cross-origin publication', async () => {
    const result = await POST(new Request('https://store.local/api/storefront/composition', {
      method: 'POST', headers: { origin: 'https://attacker.local', 'x-admin-role': 'ADMIN' },
      body: JSON.stringify(defaultHomeComposition),
    }));
    expect(result.status).toBe(403);
    expect(await fs.readdir(directory)).toEqual([]);
  });

  it('exclui o rascunho local via DELETE', async () => {
    const res = await DELETE(new Request('http://localhost:3001/api/storefront/composition', {
      method: 'DELETE',
    }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain('excluído');
  });
});
