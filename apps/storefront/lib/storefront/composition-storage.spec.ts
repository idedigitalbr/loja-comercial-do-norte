import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  getStorefrontComposition, getStorefrontRevisions,
  restoreStorefrontRevision, saveStorefrontComposition,
} from './composition-storage';
import { defaultHomeComposition } from './home-configuration';

describe('composition persistence', () => {
  let directory: string;
  beforeEach(async () => {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), 'cn-composition-test-'));
    vi.stubEnv('STOREFRONT_DATA_DIR', directory);
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('VERCEL', '');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  });
  afterEach(async () => {
    vi.unstubAllGlobals(); vi.unstubAllEnvs();
    await fs.rm(directory, { recursive: true, force: true });
  });
  it('preserves offline development with atomic composition + history', async () => {
    const revision = await saveStorefrontComposition(defaultHomeComposition, { name: 'Local tester', email: 'test@localhost' });
    expect((await getStorefrontComposition()).widgets).toEqual(defaultHomeComposition.widgets);
    expect((await getStorefrontRevisions())[0].id).toBe(revision.id);
    expect((await restoreStorefrontRevision(revision.id))?.id).toBe(revision.id);
    expect(await getStorefrontRevisions()).toHaveLength(2);
  });
  it.each(['production', 'preview'])('never acknowledges an unconfirmed %s publication', async (environment) => {
    vi.stubEnv('NODE_ENV', environment === 'production' ? 'production' : 'test');
    vi.stubEnv('VERCEL', '1');
    await expect(saveStorefrontComposition(defaultHomeComposition)).rejects.toThrow('offline');
    expect(await fs.readdir(directory)).toEqual([]);
  });
  it('does not use local fallback when an authenticated API write fails', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 503 }));
    await expect(saveStorefrontComposition(defaultHomeComposition, undefined, { Authorization: 'Bearer test' })).rejects.toThrow();
    expect(await fs.readdir(directory)).toEqual([]);
  });
  it('forwards session to Nest and only returns its confirmed revision', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const confirmed = { id: 'confirmed', createdAt: new Date().toISOString(), composition: defaultHomeComposition };
    vi.mocked(fetch).mockResolvedValue(Response.json({ data: confirmed }));
    expect(await saveStorefrontComposition(defaultHomeComposition, undefined, { Authorization: 'Bearer test' })).toEqual(confirmed);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/admin/storefront/composition'), expect.objectContaining({
      method: 'POST', headers: expect.objectContaining({ authorization: 'Bearer test' }),
    }));
  });
  it('rejects a malformed success response instead of inventing confirmation', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.mocked(fetch).mockResolvedValue(Response.json({ success: true }));
    await expect(saveStorefrontComposition(defaultHomeComposition)).rejects.toThrow();
  });
  it('does not retain stale process caches across remote publications', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({ data: { version: 1 } })).mockResolvedValueOnce(Response.json({ data: { version: 2 } }));
    expect((await getStorefrontComposition()).version).toBe(1);
    expect((await getStorefrontComposition()).version).toBe(2);
  });
  it('propagates offline disk errors instead of reporting success', async () => {
    vi.stubEnv('STOREFRONT_DATA_DIR', path.join(directory, 'file'));
    await fs.writeFile(path.join(directory, 'file'), 'not a directory');
    await expect(saveStorefrontComposition(defaultHomeComposition)).rejects.toThrow();
  });
});
