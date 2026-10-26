import { describe, expect, it, vi } from 'vitest';
import { GET, POST } from './route';

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('API Route /api/storefront/revisions', () => {
  it('GET rejeita usuários não autorizados com 403', async () => {
    const request = new Request('http://localhost:3001/api/storefront/revisions');
    const res = await GET(request);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('GET retorna lista de revisões para administrador autenticado', async () => {
    const request = new Request('http://localhost:3001/api/storefront/revisions', {
      headers: { 'x-admin-role': 'ADMIN' },
    });
    const res = await GET(request);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(1);
  });

  it('POST rejeita restauração sem permissão de admin com 403', async () => {
    const request = new Request('http://localhost:3001/api/storefront/revisions', {
      method: 'POST',
      body: JSON.stringify({ revisionId: 'rev-fake' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(request);
    expect(res.status).toBe(403);
  });

  it('POST restaura uma revisão existente quando solicitado por admin', async () => {
    // Primeiro obtemos a revisão baseline
    const getReq = new Request('http://localhost:3001/api/storefront/revisions', {
      headers: { 'x-admin-role': 'ADMIN' },
    });
    const getRes = await GET(getReq);
    const { data: revisions } = await getRes.json();
    const targetRev = revisions[0];

    const postReq = new Request('http://localhost:3001/api/storefront/revisions', {
      method: 'POST',
      body: JSON.stringify({ revisionId: targetRev.id }),
      headers: {
        'Content-Type': 'application/json',
        'x-admin-role': 'ADMIN',
      },
    });

    const postRes = await POST(postReq);
    expect(postRes.status).toBe(200);
    const json = await postRes.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain('restaurada com sucesso');
    expect(json.data.id).toBe(targetRev.id);
  });
});
