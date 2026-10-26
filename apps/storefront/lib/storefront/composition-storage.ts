import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { defaultHomeComposition } from './home-configuration';
import type { PageComposition, StorefrontRevision } from './widget-types';

let memoryCache: PageComposition | null = null;
let revisionsMemoryCache: StorefrontRevision[] | null = null;

export function getCompositionFilePath(): string {
  const localPath = path.resolve(process.cwd(), 'data', 'home-composition.json');
  if (fsSync.existsSync(localPath)) return localPath;

  const repoPath = path.resolve(process.cwd(), 'apps', 'storefront', 'data', 'home-composition.json');
  if (fsSync.existsSync(repoPath)) return repoPath;

  if (process.cwd().endsWith('storefront')) {
    return localPath;
  }
  return repoPath;
}

export function getRevisionsFilePath(): string {
  const localPath = path.resolve(process.cwd(), 'data', 'home-revisions.json');
  if (fsSync.existsSync(localPath)) return localPath;

  const repoPath = path.resolve(process.cwd(), 'apps', 'storefront', 'data', 'home-revisions.json');
  if (fsSync.existsSync(repoPath)) return repoPath;

  if (process.cwd().endsWith('storefront')) {
    return localPath;
  }
  return repoPath;
}

export async function getStorefrontComposition(): Promise<PageComposition> {
  if (memoryCache) {
    return memoryCache;
  }

  try {
    const filePath = getCompositionFilePath();
    if (fsSync.existsSync(filePath)) {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (
        parsed &&
        parsed.page === 'home' &&
        Array.isArray(parsed.widgets) &&
        parsed.widgets.length > 0
      ) {
        memoryCache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[storefront-composition] Falha ao ler arquivo de composição:', err);
  }

  return defaultHomeComposition;
}

export async function getStorefrontRevisions(): Promise<StorefrontRevision[]> {
  if (revisionsMemoryCache) {
    return revisionsMemoryCache;
  }

  try {
    const filePath = getRevisionsFilePath();
    if (fsSync.existsSync(filePath)) {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        revisionsMemoryCache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[storefront-composition] Falha ao ler histórico de revisões:', err);
  }

  // Baseline oficial inicial se ainda não existirem revisões
  const baselineRevision: StorefrontRevision = {
    id: 'rev-baseline-oficial',
    createdAt: new Date().toISOString(),
    authorName: 'Sistema Comercial do Norte',
    authorEmail: 'admin@admin.com',
    widgetsCount: defaultHomeComposition.widgets.length,
    note: 'Versão de referência oficial inicial (19 seções)',
    composition: defaultHomeComposition,
  };

  revisionsMemoryCache = [baselineRevision];
  return revisionsMemoryCache;
}

export async function saveStorefrontComposition(
  composition: PageComposition,
  author?: { name?: string; email?: string; note?: string }
): Promise<StorefrontRevision> {
  // 1. Grava a composição atual
  const filePath = getCompositionFilePath();
  const dir = path.dirname(filePath);
  if (!fsSync.existsSync(dir)) {
    await fs.mkdir(dir, { recursive: true });
  }

  await fs.writeFile(filePath, JSON.stringify(composition, null, 2), 'utf-8');
  memoryCache = composition;

  // 2. Grava o checkpoint / revisão histórica
  const currentRevisions = await getStorefrontRevisions();
  const newRevision: StorefrontRevision = {
    id: `rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    authorName: author?.name || 'Administrador',
    authorEmail: author?.email || 'admin@admin.com',
    widgetsCount: composition.widgets.length,
    note: author?.note || `Edição da vitrine com ${composition.widgets.length} seções`,
    composition,
  };

  // Mantém as últimas 50 revisões em ordem cronológica reversa
  const updatedRevisions = [newRevision, ...currentRevisions].slice(0, 50);
  const revisionsPath = getRevisionsFilePath();
  const revDir = path.dirname(revisionsPath);
  if (!fsSync.existsSync(revDir)) {
    await fs.mkdir(revDir, { recursive: true });
  }

  await fs.writeFile(revisionsPath, JSON.stringify(updatedRevisions, null, 2), 'utf-8');
  revisionsMemoryCache = updatedRevisions;

  return newRevision;
}

export async function restoreStorefrontRevision(revisionId: string): Promise<StorefrontRevision | null> {
  const revisions = await getStorefrontRevisions();
  const target = revisions.find((r) => r.id === revisionId);
  if (!target) return null;

  await saveStorefrontComposition(target.composition, {
    name: target.authorName,
    email: target.authorEmail,
    note: `Restaurado a partir do checkpoint de ${new Date(target.createdAt).toLocaleString('pt-BR')}`,
  });

  return target;
}

export function clearStorefrontCompositionCache(): void {
  memoryCache = null;
  revisionsMemoryCache = null;
}
