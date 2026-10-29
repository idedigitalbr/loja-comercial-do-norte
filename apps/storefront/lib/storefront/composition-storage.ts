import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { API_URL } from '@/lib/api';
import { defaultHomeComposition } from './home-configuration';
import type { PageComposition, StorefrontRevision } from './widget-types';

type LocalState = { composition: PageComposition; revisions: StorefrontRevision[] };
export function allowsLocalComposition(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1';
}
export function getCompositionFilePath(): string {
  return path.resolve(process.env.STOREFRONT_DATA_DIR ?? (
    process.cwd().endsWith('storefront') ? 'data' : 'apps/storefront/data'
  ), 'home-composition.json');
}
export function getRevisionsFilePath(): string {
  return path.join(path.dirname(getCompositionFilePath()), 'home-revisions.json');
}
function statePath() { return path.join(path.dirname(getCompositionFilePath()), 'home-state.json'); }
export async function isLocalDraftActive(): Promise<boolean> {
  if (!allowsLocalComposition()) return false;
  try {
    await fs.access(statePath());
    return true;
  } catch {
    return false;
  }
}
export async function clearLocalDraft(): Promise<void> {
  if (allowsLocalComposition()) {
    try {
      await fs.rm(statePath(), { force: true });
    } catch {
      // Ignora erro
    }
  }
}
export async function getStorefrontCompositionInfo(): Promise<{
  composition: PageComposition;
  isDraft: boolean;
}> {
  const isDraft = await isLocalDraftActive();
  const composition = await getStorefrontComposition();
  return { composition, isDraft };
}
async function readLocalState(): Promise<LocalState> {
  try { return JSON.parse(await fs.readFile(statePath(), 'utf8')) as LocalState; } catch { /* Legacy local draft. */ }
  let composition = defaultHomeComposition;
  let revisions: StorefrontRevision[] = [];
  try { composition = JSON.parse(await fs.readFile(getCompositionFilePath(), 'utf8')); } catch { /* Default composition. */ }
  try { revisions = JSON.parse(await fs.readFile(getRevisionsFilePath(), 'utf8')); } catch { /* No checkpoints yet. */ }
  return { composition, revisions };
}
export class CompositionApiError extends Error {
  constructor(public readonly status: number) { super('Não foi possível confirmar a operação da vitrine na API.'); }
}
async function api<T>(endpoint: string, headers: HeadersInit = {}, body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}/api/v1/${endpoint}`, {
    method: body === undefined ? 'GET' : 'POST', cache: 'no-store',
    headers: { ...Object.fromEntries(new Headers(headers)), 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new CompositionApiError(response.status);
  return (await response.json() as { data: T }).data;
}
export async function getStorefrontComposition(): Promise<PageComposition> {
  if (allowsLocalComposition()) {
    try { return (JSON.parse(await fs.readFile(statePath(), 'utf8')) as LocalState).composition; } catch { /* No local offline publication. */ }
  }
  try {
    const composition = await api<PageComposition | null>('site/composition');
    return composition ?? defaultHomeComposition;
  } catch {
    if (allowsLocalComposition()) return (await readLocalState()).composition;
    return defaultHomeComposition;
  }
}
export async function getStorefrontRevisions(headers: HeadersInit = {}): Promise<StorefrontRevision[]> {
  if (allowsLocalComposition() && !new Headers(headers).has('authorization')) {
    return (await readLocalState()).revisions;
  }
  return api<StorefrontRevision[]>('admin/storefront/revisions', headers);
}
export async function saveStorefrontComposition(
  composition: PageComposition,
  author?: { name?: string; email?: string; note?: string },
  headers: HeadersInit = {},
): Promise<StorefrontRevision> {
  if (!allowsLocalComposition() || new Headers(headers).has('authorization')) {
    const revision = await api<StorefrontRevision>('admin/storefront/composition', headers, composition);
    if (!revision?.id || !revision.createdAt || !revision.composition) throw new CompositionApiError(502);
    return revision;
  }
  // Offline development keeps composition + history in one atomic file replacement.
  const previous = await readLocalState();
  const revision: StorefrontRevision = {
    id: `rev-${randomUUID()}`, createdAt: new Date().toISOString(),
    authorName: author?.name ?? 'Administrador Dev', authorEmail: author?.email ?? 'dev@localhost',
    note: author?.note, widgetsCount: composition.widgets.length, composition,
  };
  const next = { composition, revisions: [revision, ...previous.revisions].slice(0, 50) };
  await fs.mkdir(path.dirname(statePath()), { recursive: true });
  const temporary = `${statePath()}.${randomUUID()}.tmp`;
  try {
    await fs.writeFile(temporary, JSON.stringify(next), 'utf8');
    await fs.rename(temporary, statePath());
  } finally {
    await fs.rm(temporary, { force: true });
  }
  return revision;
}
export async function restoreStorefrontRevision(
  revisionId: string, headers: HeadersInit = {}, author?: { name?: string; email?: string },
): Promise<StorefrontRevision | null> {
  if (!allowsLocalComposition() || new Headers(headers).has('authorization')) {
    return api<StorefrontRevision>(`admin/storefront/revisions/${encodeURIComponent(revisionId)}/restore`, headers, {});
  }
  const target = (await getStorefrontRevisions()).find((revision) => revision.id === revisionId);
  if (!target) return null;
  await saveStorefrontComposition(target.composition, {
    ...author, note: `Restaurado a partir do checkpoint ${revisionId}`,
  });
  return target;
}
// Kept for existing callers; process caches no longer hide remote publications.
export function clearStorefrontCompositionCache(): void {}
