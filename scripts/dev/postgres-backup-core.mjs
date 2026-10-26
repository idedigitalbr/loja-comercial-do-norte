import { createHash } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

export const hash = value => createHash('sha256').update(value).digest('hex');
export const quoteIdentifier = value => `"${String(value).replaceAll('"', '""')}"`;
export const tableChecksum = rows => hash([...rows].sort().join('\n'));
export function sortTablesTopologically(tables, foreignKeys) {
  const remaining = new Set(tables);
  const sorted = [];
  while (remaining.size) {
    const ready = [...remaining].filter(table => !foreignKeys.some(fk => fk.fromTable === table && fk.toTable !== table && remaining.has(fk.toTable))).sort();
    if (!ready.length) throw new Error('UNSUPPORTED_FOREIGN_KEY_CYCLE');
    for (const table of ready) { sorted.push(table); remaining.delete(table); }
  }
  return sorted;
}
export function connectionIdentity(connectionUrl) {
  const url = new URL(connectionUrl);
  if (!['postgresql:', 'postgres:'].includes(url.protocol)) throw new Error('INVALID_POSTGRES_URL');
  if ((url.searchParams.get('schema') ?? 'public') !== 'public') throw new Error('ONLY_PUBLIC_SCHEMA_SUPPORTED');
  return `${url.hostname}:${url.port || '5432'}${url.pathname}`;
}
export function assertRestoreTarget(connectionUrl, confirmation, dryRun = false) {
  const url = new URL(connectionUrl);
  const identity = connectionIdentity(connectionUrl);
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) throw new Error('REMOTE_RESTORE_FORBIDDEN');
  const name = decodeURIComponent(url.pathname.slice(1));
  if (!/(?:^|_)(?:test|restore)(?:_|$)/.test(name)) throw new Error('RESTORE_REQUIRES_EXPLICIT_TEST_DATABASE');
  if (!dryRun && confirmation !== identity) throw new Error(`CONFIRM_TARGET_REQUIRED: ${identity}`);
  return identity;
}
export function clientFor(connectionUrl) {
  if (!connectionUrl) throw new Error('EXPLICIT_DATABASE_URL_REQUIRED');
  connectionIdentity(connectionUrl);
  return new PrismaClient({ datasources: { db: { url: connectionUrl } } });
}
export async function inspectSchema(tx) {
  const columns = await tx.$queryRawUnsafe(`SELECT c.table_name AS "table", c.column_name AS "name", c.ordinal_position AS "position", c.udt_name AS "type", c.data_type AS "dataType", c.is_nullable AS "nullable", c.column_default AS "default", c.is_identity AS "identity", c.is_generated AS "generated", c.generation_expression AS "expression", c.character_maximum_length::text AS "maxLength", c.numeric_precision AS "precision", c.numeric_scale AS "scale", c.datetime_precision AS "datePrecision" FROM information_schema.columns c JOIN information_schema.tables t ON t.table_schema=c.table_schema AND t.table_name=c.table_name WHERE c.table_schema='public' AND t.table_type='BASE TABLE' AND c.table_name <> '_prisma_migrations' ORDER BY c.table_name,c.ordinal_position`);
  const tables = [...new Set(columns.map(column => column.table))];
  if (!tables.length) throw new Error('NO_USER_TABLES');
  const constraints = await tx.$queryRawUnsafe(`SELECT r.relname AS "table", c.conname AS name, pg_get_constraintdef(c.oid) AS definition FROM pg_constraint c JOIN pg_class r ON r.oid=c.conrelid JOIN pg_namespace n ON n.oid=r.relnamespace WHERE n.nspname='public' AND r.relname <> '_prisma_migrations' ORDER BY r.relname,c.conname`);
  const indexes = await tx.$queryRawUnsafe(`SELECT tablename AS "table", indexname AS name, indexdef AS definition FROM pg_indexes WHERE schemaname='public' AND tablename <> '_prisma_migrations' ORDER BY tablename,indexname`);
  const enums = await tx.$queryRawUnsafe(`SELECT t.typname AS name, e.enumlabel AS value, e.enumsortorder::text AS position FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' ORDER BY t.typname,e.enumsortorder`);
  const foreignKeys = await tx.$queryRawUnsafe(`SELECT r.relname AS "fromTable", f.relname AS "toTable", rn.nspname AS "fromSchema", fn.nspname AS "toSchema" FROM pg_constraint c JOIN pg_class r ON r.oid=c.conrelid JOIN pg_namespace rn ON rn.oid=r.relnamespace JOIN pg_class f ON f.oid=c.confrelid JOIN pg_namespace fn ON fn.oid=f.relnamespace WHERE c.contype='f' AND (rn.nspname='public' OR fn.nspname='public') ORDER BY r.relname,f.relname,c.conname`);
  if (foreignKeys.some(fk => fk.fromSchema !== 'public' || fk.toSchema !== 'public')) throw new Error('CROSS_SCHEMA_FOREIGN_KEYS_UNSUPPORTED');
  const unsupported = await tx.$queryRawUnsafe(`SELECT EXISTS(SELECT 1 FROM pg_sequences WHERE schemaname='public') OR EXISTS(SELECT 1 FROM pg_trigger t JOIN pg_class r ON r.oid=t.tgrelid JOIN pg_namespace n ON n.oid=r.relnamespace WHERE n.nspname='public' AND NOT t.tgisinternal) AS unsupported`);
  if (unsupported[0]?.unsupported || columns.some(c => c.identity === 'YES' || c.default?.includes('nextval('))) throw new Error('SEQUENCES_OR_CUSTOM_TRIGGERS_REQUIRE_PG_DUMP');
  const migrationsTable = await tx.$queryRawUnsafe(`SELECT to_regclass('public._prisma_migrations')::text AS name`);
  let migrations = [];
  if (migrationsTable[0]?.name) {
    const pending = await tx.$queryRawUnsafe(`SELECT migration_name FROM public._prisma_migrations WHERE finished_at IS NULL AND rolled_back_at IS NULL`);
    if (pending.length) throw new Error('UNRESOLVED_PRISMA_MIGRATIONS');
    migrations = await tx.$queryRawUnsafe(`SELECT migration_name,checksum FROM public._prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL ORDER BY migration_name,checksum`);
  }
  const descriptor = { columns, constraints, indexes, enums, migrations };
  return { tables, columns, orderedTables: sortTablesTopologically(tables, foreignKeys), descriptor, fingerprint: hash(JSON.stringify(descriptor)) };
}
export async function readTable(tx, table) {
  // Keep PostgreSQL's JSON text intact: bigint/numeric values must never pass through JS Number.
  const rows = await tx.$queryRawUnsafe(`SELECT to_jsonb(t)::text AS row FROM public.${quoteIdentifier(table)} t`);
  return rows.map(item => item.row).sort();
}
export async function transaction(client, callback, readOnly = false) {
  return client.$transaction(async tx => {
    if (readOnly) await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
    await tx.$executeRawUnsafe("SET LOCAL TIME ZONE 'UTC'");
    await tx.$executeRawUnsafe("SET LOCAL lock_timeout = '5s'");
    return callback(tx);
  }, { isolationLevel: readOnly ? 'RepeatableRead' : 'Serializable', timeout: 120_000, maxWait: 10_000 });
}
