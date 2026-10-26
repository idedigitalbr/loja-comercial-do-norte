#!/usr/bin/env node
import { mkdir, rename, writeFile, rm } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { clientFor, inspectSchema, readTable, tableChecksum, hash, transaction } from './postgres-backup-core.mjs';
export { sortTablesTopologically } from './postgres-backup-core.mjs';

export async function runBackup({ connectionUrl = process.env.BACKUP_DATABASE_URL, outDir, dryRun = false, onSnapshot } = {}) {
  const prisma = clientFor(connectionUrl);
  try {
    const snapshot = await transaction(prisma, async tx => {
      const schema = await inspectSchema(tx);
      const data = Object.create(null);
      const tables = [];
      for (const table of schema.orderedTables) {
        const rows = await readTable(tx, table);
        data[table] = rows;
        tables.push({ table, rowCount: rows.length, checksum: tableChecksum(rows) });
        if (onSnapshot) await onSnapshot(table);
      }
      return { schema, data, tables };
    }, true);
    const dataText = JSON.stringify(snapshot.data);
    const manifest = {
      version: 2, format: 'postgres-jsonb-text', createdAt: new Date().toISOString(),
      schemaFingerprint: snapshot.schema.fingerprint, schema: snapshot.schema.descriptor,
      topologicalOrder: snapshot.schema.orderedTables, tables: snapshot.tables,
      tablesCount: snapshot.tables.length, totalRows: snapshot.tables.reduce((sum, table) => sum + table.rowCount, 0),
      dataChecksum: hash(dataText),
    };
    if (dryRun) return { dryRun: true, manifest, data: snapshot.data };
    const directory = resolve(outDir ?? join('backups', `postgres-${new Date().toISOString().replaceAll(/[:.]/g, '-')}`));
    const temporary = `${directory}.pending-${randomUUID()}`;
    await mkdir(dirname(directory), { recursive: true });
    await mkdir(temporary, { recursive: false });
    try {
      await writeFile(join(temporary, 'data.json'), dataText, { flag: 'wx', mode: 0o600 });
      await writeFile(join(temporary, 'manifest.json'), JSON.stringify(manifest, null, 2), { flag: 'wx', mode: 0o600 });
      await rename(temporary, directory);
    } catch (error) { await rm(temporary, { recursive: true, force: true }); throw error; }
    return { backupDir: directory, manifest, totalRows: manifest.totalRows };
  } finally { await prisma.$disconnect(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const index = args.indexOf('--out');
  runBackup({ dryRun: args.includes('--dry-run'), outDir: index < 0 ? undefined : args[index + 1] })
    .then(result => console.log(JSON.stringify({ success: true, dryRun: result.dryRun ?? false, tables: result.manifest.tablesCount, rows: result.manifest.totalRows, directory: result.backupDir })))
    .catch(error => { const reason = /^[A-Z_]+$/.test(error.message) ? error.message : error.code ?? 'DATABASE_ERROR'; console.error(`Backup falhou (${reason}). Nenhum backup parcial confirmado.`); process.exitCode = 1; });
}
