import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';
import { defaultHomeComposition } from './home-configuration';
import type { PageComposition, StorefrontRevision } from './widget-types';

let memoryCache: PageComposition | null = null;
let revisionsMemoryCache: StorefrontRevision[] | null = null;

function getDatabaseUrl(): string | null {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    null;

  // Se for URL local que requer porta direta inacessível em serverless, ou nula
  if (!url || url.includes('127.0.0.1:55432') || url.includes('localhost:55432')) {
    return null;
  }
  return url;
}

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

  // 1. Tenta recuperar do PostgreSQL Neon (Persistência em Produção / Vercel)
  const dbUrl = getDatabaseUrl();
  if (dbUrl) {
    try {
      const sql = neon(dbUrl);
      const rows = await sql`SELECT "homeComposition" FROM "SiteConfiguration" WHERE id = 'default' LIMIT 1`;
      const storedComp = rows[0]?.homeComposition as PageComposition | undefined;
      if (
        storedComp &&
        storedComp.page === 'home' &&
        Array.isArray(storedComp.widgets) &&
        storedComp.widgets.length > 0
      ) {
        memoryCache = storedComp;
        return storedComp;
      }
    } catch (err) {
      console.warn('[storefront-composition] Neon indisponível, usando fallback local:', err);
    }
  }

  // 2. Fallback de arquivo local (Desenvolvimento, CI e Mocks)
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
    console.warn('[storefront-composition] Falha ao ler arquivo de composição local:', err);
  }

  return defaultHomeComposition;
}

export async function getStorefrontRevisions(): Promise<StorefrontRevision[]> {
  if (revisionsMemoryCache) {
    return revisionsMemoryCache;
  }

  // 1. Tenta recuperar histórico de revisões do PostgreSQL Neon (AuditLog)
  const dbUrl = getDatabaseUrl();
  if (dbUrl) {
    try {
      const sql = neon(dbUrl);
      const rows = await sql`
        SELECT "id", "createdAt", "afterJson" 
        FROM "AuditLog" 
        WHERE "entityType" = 'StorefrontComposition' AND "entityId" = 'home' 
        ORDER BY "createdAt" DESC 
        LIMIT 50
      `;

      if (rows && rows.length > 0) {
        const neonRevisions = rows
          .map((r: any) => r.afterJson as StorefrontRevision)
          .filter((rev) => rev && rev.composition);

        if (neonRevisions.length > 0) {
          revisionsMemoryCache = neonRevisions;
          return neonRevisions;
        }
      }
    } catch (err) {
      console.warn('[storefront-composition] AuditLog Neon indisponível, usando fallback local:', err);
    }
  }

  // 2. Fallback de histórico local em arquivo JSON
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
    console.warn('[storefront-composition] Falha ao ler histórico de revisões local:', err);
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
  const newRevision: StorefrontRevision = {
    id: `rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    authorName: author?.name || 'Administrador',
    authorEmail: author?.email || 'admin@admin.com',
    widgetsCount: composition.widgets.length,
    note: author?.note || `Edição da vitrine com ${composition.widgets.length} seções`,
    composition,
  };

  // 1. Persistência no PostgreSQL Neon (se conectado)
  const dbUrl = getDatabaseUrl();
  let neonSuccess = false;
  if (dbUrl) {
    try {
      const sql = neon(dbUrl);
      const jsonStr = JSON.stringify(composition);
      const revStr = JSON.stringify(newRevision);

      // Atualiza composição ativa na SiteConfiguration
      await sql`
        UPDATE "SiteConfiguration" 
        SET "homeComposition" = ${jsonStr}::jsonb, "updatedAt" = NOW() 
        WHERE id = 'default'
      `;

      // Grava no AuditLog imutável
      await sql`
        INSERT INTO "AuditLog" 
          ("id", "actorType", "actorId", "action", "entityType", "entityId", "afterJson", "createdAt")
        VALUES 
          (${newRevision.id}, 'ADMIN', ${newRevision.authorEmail}, 'UPDATE', 'StorefrontComposition', 'home', ${revStr}::jsonb, NOW())
      `;

      neonSuccess = true;
    } catch (err) {
      console.warn('[storefront-composition] Erro ao gravar no Neon PostgreSQL, usando fallback em disco:', err);
    }
  }

  // 2. Persistência em arquivo local (quando sistema de arquivos permitir escrita)
  try {
    const filePath = getCompositionFilePath();
    const dir = path.dirname(filePath);
    if (!fsSync.existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
    await fs.writeFile(filePath, JSON.stringify(composition, null, 2), 'utf-8');

    const currentRevisions = await getStorefrontRevisions();
    const updatedRevisions = [newRevision, ...currentRevisions.filter((r) => r.id !== newRevision.id)].slice(0, 50);
    const revisionsPath = getRevisionsFilePath();
    await fs.writeFile(revisionsPath, JSON.stringify(updatedRevisions, null, 2), 'utf-8');
    revisionsMemoryCache = updatedRevisions;
  } catch {
    // Em ambientes serverless read-only da Vercel sem permissão de disco, a gravação em arquivo é silenciosa
  }

  memoryCache = composition;
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
