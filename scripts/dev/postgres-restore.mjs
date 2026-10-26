#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { assertRestoreTarget, clientFor, inspectSchema, quoteIdentifier, tableChecksum, hash, readTable, transaction } from './postgres-backup-core.mjs';

export function validateBackup(manifest, dataText) {
  if (manifest?.version !== 2 || manifest.format !== 'postgres-jsonb-text') throw new Error('UNSUPPORTED_BACKUP_VERSION');
  if (hash(dataText) !== manifest.dataChecksum) throw new Error('BACKUP_FILE_CHECKSUM_MISMATCH');
  const data = JSON.parse(dataText);
  const names = manifest.tables?.map(table => table.table);
  if (!names?.length || new Set(names).size !== names.length || manifest.tablesCount !== names.length || JSON.stringify([...names].sort()) !== JSON.stringify(Object.keys(data).sort()) || JSON.stringify([...manifest.topologicalOrder].sort()) !== JSON.stringify([...names].sort())) throw new Error('INVALID_BACKUP_MANIFEST');
  if (hash(JSON.stringify(manifest.schema)) !== manifest.schemaFingerprint) throw new Error('SCHEMA_CHECKSUM_MISMATCH');
  let count = 0;
  for (const table of manifest.tables) {
    const rows = data[table.table];
    if (!Array.isArray(rows) || rows.some(row => typeof row !== 'string') || rows.length !== table.rowCount || tableChecksum(rows) !== table.checksum) throw new Error('BACKUP_TABLE_CHECKSUM_MISMATCH');
    for (const row of rows) { const parsed = JSON.parse(row); if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('INVALID_BACKUP_ROW'); }
    count += rows.length;
  }
  if (count !== manifest.totalRows) throw new Error('BACKUP_ROW_COUNT_MISMATCH');
  return data;
}
export async function runRestore({ connectionUrl = process.env.RESTORE_DATABASE_URL, fromDir, confirmTarget, dryRun = false } = {}) {
  if (!connectionUrl || !fromDir) throw new Error('EXPLICIT_RESTORE_URL_AND_DIRECTORY_REQUIRED');
  assertRestoreTarget(connectionUrl, confirmTarget, dryRun);
  const directory = resolve(fromDir);
  const manifest = JSON.parse(await readFile(join(directory, 'manifest.json'), 'utf8'));
  const data = validateBackup(manifest, await readFile(join(directory, 'data.json'), 'utf8'));
  const prisma = clientFor(connectionUrl);
  try {
    return await transaction(prisma, async tx => {
      const [server] = await tx.$queryRawUnsafe('SELECT current_database() AS name, host(inet_server_addr()) AS address');
      if (server.name !== decodeURIComponent(new URL(connectionUrl).pathname.slice(1)) || !['127.0.0.1', '::1'].includes(server.address)) throw new Error('ACTUAL_DATABASE_IS_NOT_LOCAL_TEST_TARGET');
      let schema = await inspectSchema(tx);
      if (!dryRun) {
        await tx.$executeRawUnsafe(`LOCK TABLE ${schema.tables.map(table => `public.${quoteIdentifier(table)}`).join(', ')} IN ACCESS EXCLUSIVE MODE`);
        schema = await inspectSchema(tx);
      }
      if (schema.fingerprint !== manifest.schemaFingerprint || JSON.stringify(schema.orderedTables) !== JSON.stringify(manifest.topologicalOrder)) throw new Error('TARGET_SCHEMA_OR_MIGRATION_MISMATCH');
      if (dryRun) return { dryRun: true, manifest };
      // No CASCADE, no disabled constraints, no table skipped because its backup is empty.
      for (const table of [...schema.orderedTables].reverse()) await tx.$executeRawUnsafe(`DELETE FROM public.${quoteIdentifier(table)}`);
      for (const table of schema.orderedTables) {
        if (!data[table].length) continue;
        const columns = schema.columns.filter(column => column.table === table && column.generated === 'NEVER').map(column => quoteIdentifier(column.name)).join(', ');
        await tx.$executeRawUnsafe(`INSERT INTO public.${quoteIdentifier(table)} (${columns}) SELECT ${columns} FROM jsonb_populate_recordset(NULL::public.${quoteIdentifier(table)}, $1::jsonb)`, `[${data[table].join(',')}]`);
      }
      await tx.$executeRawUnsafe('SET CONSTRAINTS ALL IMMEDIATE');
      for (const table of manifest.tables) {
        const restored = await readTable(tx, table.table);
        if (restored.length !== table.rowCount || tableChecksum(restored) !== table.checksum) throw new Error('RESTORED_CONTENT_MISMATCH');
      }
      return { restoredRows: manifest.totalRows, manifest };
    }, dryRun);
  } finally { await prisma.$disconnect(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const value = flag => { const index = args.indexOf(flag); return index < 0 ? undefined : args[index + 1]; };
  runRestore({ fromDir: value('--from'), confirmTarget: value('--confirm-target'), dryRun: args.includes('--dry-run') })
    .then(result => console.log(JSON.stringify({ success: true, dryRun: result.dryRun ?? false, rows: result.restoredRows })))
    .catch(error => { const reason = /^[A-Z_]+(?:: [a-zA-Z0-9_.:/-]+)?$/.test(error.message) ? error.message : error.code ?? 'DATABASE_ERROR'; console.error(`Restore falhou (${reason}). Nenhuma restauração parcial confirmada; a transação é revertida.`); process.exitCode = 1; });
}
