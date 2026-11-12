import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);

export function resolveRepoRoot(fromDir = __dirname): string {
  let cursor = resolve(fromDir);
  for (let i = 0; i < 8; i++) {
    if (existsSync(resolve(cursor, 'prisma/schema.prisma'))) {
      return cursor;
    }
    const parent = resolve(cursor, '..');
    if (parent === cursor) break;
    cursor = parent;
  }
  throw new Error('Raiz do repositório loja-comercial-do-norte não encontrada (prisma/schema.prisma ausente).');
}

export function loadLocalEnvironment(repoRoot: string): { databaseUrl: string; parsedUrl: URL } {
  // Carrega somente arquivos locais (.env e .env.local). Nunca lê .env.neon automaticamente.
  const envPath = resolve(repoRoot, '.env');
  const envLocalPath = resolve(repoRoot, '.env.local');
  if (existsSync(envPath)) dotenv.config({ path: envPath });
  if (existsSync(envLocalPath)) dotenv.config({ path: envLocalPath });

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error('DATABASE_URL não definida no .env / ambiente atual.');
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL inválida para análise de destino.');
  }

  return { databaseUrl, parsedUrl };
}

export function assertLocalDatabaseUrl(parsedUrl: URL, options?: { allowRemote?: boolean }): void {
  const host = parsedUrl.hostname.toLowerCase();
  const isLocal = LOCAL_HOSTS.has(host);
  if (!isLocal && !options?.allowRemote) {
    throw new Error(
      `BLOQUEADO POR SEGURANÇA: DATABASE_URL aponta para host não local (${host}). ` +
        'Esta ferramenta opera estritamente no banco LOCAL (127.0.0.1 / localhost) por padrão.',
    );
  }
  if (/neon\.tech$/i.test(host) && !options?.allowRemote) {
    throw new Error('BLOQUEADO: conexão com Neon online proibida sem flag explícita.');
  }
}

export function cleanOptionalText(value: unknown, maxLen?: number): string | null {
  if (value == null) return null;
  const text = String(value).replace(/\s+/g, ' ').trim();
  if (!text) return null;
  if (maxLen && text.length > maxLen) {
    return text.slice(0, maxLen).trimEnd();
  }
  return text;
}

export function cleanMultilineText(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).replace(/\r\n/g, '\n').trim();
  return text || null;
}

export function toOptionalInt(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

export function toPositiveIntOrNull(value: unknown): number | null {
  const n = toOptionalInt(value);
  return n !== null && n > 0 ? n : null;
}

export function slugifyText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function normalizeCompareKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
