#!/usr/bin/env node
/**
 * PostgreSQL Backup Utility — Comercial do Norte (Issue #12)
 *
 * Realiza backup confiável do banco de dados (Neon ou Local) em ordem topológica,
 * gerando manifest.json com contagens/checksums, data.json e dump.sql idempotente.
 *
 * Uso:
 *   node scripts/dev/postgres-backup.mjs [--dry-run] [--neon] [--local] [--out <dir>]
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Carrega variáveis conforme flags
const isNeon = process.argv.includes('--neon');
const isDryRun = process.argv.includes('--dry-run');
const outArgIndex = process.argv.indexOf('--out');
const customOutDir = outArgIndex !== -1 && process.argv[outArgIndex + 1] ? process.argv[outArgIndex + 1] : null;

if (isNeon && existsSync('.env.neon')) {
  dotenv.config({ path: '.env.neon', override: true });
} else if (existsSync('.env')) {
  dotenv.config({ path: '.env' });
}

const connectionUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!connectionUrl) {
  console.error('ERRO: Nenhuma connection string (DATABASE_URL ou DATABASE_URL_UNPOOLED) encontrada.');
  process.exit(1);
}

export function sortTablesTopologically(tables, foreignKeys) {
  // Constrói grafo de dependências
  const graph = new Map();
  const inDegree = new Map();

  for (const table of tables) {
    graph.set(table, new Set());
    inDegree.set(table, 0);
  }

  for (const { fromTable, toTable } of foreignKeys) {
    if (fromTable !== toTable && graph.has(toTable) && graph.has(fromTable)) {
      if (!graph.get(toTable).has(fromTable)) {
        graph.get(toTable).add(fromTable);
        inDegree.set(fromTable, (inDegree.get(fromTable) || 0) + 1);
      }
    }
  }

  // Algoritmo de Kahn
  const queue = [];
  for (const [table, degree] of inDegree.entries()) {
    if (degree === 0) queue.push(table);
  }

  const sorted = [];
  while (queue.length > 0) {
    const current = queue.shift();
    sorted.push(current);

    for (const dependent of graph.get(current) || []) {
      const newDegree = inDegree.get(dependent) - 1;
      inDegree.set(dependent, newDegree);
      if (newDegree === 0) {
        queue.push(dependent);
      }
    }
  }

  // Se houver ciclos, inclui tabelas restantes
  for (const table of tables) {
    if (!sorted.includes(table)) {
      sorted.push(table);
    }
  }

  return sorted;
}

export function escapeSqlValue(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (value instanceof Date) return `'${value.toISOString()}'::timestamptz`;
  if (typeof value === 'object') {
    const jsonStr = JSON.stringify(value).replace(/'/g, "''");
    return `'${jsonStr}'::jsonb`;
  }
  const str = String(value).replace(/'/g, "''");
  return `'${str}'`;
}

export function generateSqlInsert(table, rows) {
  if (!rows || rows.length === 0) return '';
  const columns = Object.keys(rows[0]);
  const quotedColumns = columns.map((col) => `"${col}"`).join(', ');

  const valuesLines = rows.map((row) => {
    const values = columns.map((col) => escapeSqlValue(row[col])).join(', ');
    return `  (${values})`;
  });

  return `INSERT INTO "${table}" (${quotedColumns})\nVALUES\n${valuesLines.join(',\n')}\nON CONFLICT DO NOTHING;\n`;
}

export async function runBackup(options = {}) {
  const prisma = new PrismaClient({
    datasources: { db: { url: connectionUrl } },
  });

  try {
    console.log(`[Backup PostgreSQL] Conectando... (Origem: ${isNeon ? 'Neon Cloud' : 'Local/Padrão'})`);

    // 1. Obter todas as tabelas públicas (exceto migrations)
    const tablesQuery = await prisma.$queryRawUnsafe(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name != '_prisma_migrations'
      ORDER BY table_name ASC;
    `);
    const allTables = tablesQuery.map((r) => r.table_name);

    if (allTables.length === 0) {
      console.log('Nenhuma tabela de usuário encontrada para backup.');
      return null;
    }

    // 2. Mapear chaves estrangeiras para ordenação topológica
    const fkQuery = await prisma.$queryRawUnsafe(`
      SELECT
        tc.table_name as "fromTable",
        ccu.table_name as "toTable"
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public';
    `);

    const orderedTables = sortTablesTopologically(allTables, fkQuery);

    console.log(`[Backup PostgreSQL] Identificadas ${orderedTables.length} tabelas no schema public.`);

    const manifestTables = [];
    const fullData = {};
    let totalRows = 0;
    const sqlChunks = [
      '-- Backup Automático Comercial do Norte',
      `-- Gerado em: ${new Date().toISOString()}`,
      'BEGIN;',
      "SET session_replication_role = 'replica';\n",
    ];

    for (const table of orderedTables) {
      const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "${table}";`);
      const rowCount = rows.length;
      totalRows += rowCount;
      fullData[table] = rows;

      const hash = createHash('sha256').update(JSON.stringify(rows)).digest('hex');
      manifestTables.push({
        table,
        rowCount,
        columns: rows.length > 0 ? Object.keys(rows[0]) : [],
        checksum: hash,
      });

      if (rowCount > 0) {
        sqlChunks.push(generateSqlInsert(table, rows));
      }
    }

    sqlChunks.push("SET session_replication_role = 'origin';");
    sqlChunks.push('COMMIT;');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = customOutDir || resolve(process.cwd(), 'backups', `postgres-${timestamp}`);

    const manifest = {
      version: 1,
      createdAt: new Date().toISOString(),
      source: isNeon ? 'neon' : 'local',
      tablesCount: orderedTables.length,
      totalRows,
      topologicalOrder: orderedTables,
      tables: manifestTables,
    };

    if (isDryRun || options.dryRun) {
      console.log(`\n[DRY-RUN] Backup concluído em modo de inspeção (nenhum arquivo gravado):`);
      console.log(`  - Tabelas: ${orderedTables.length}`);
      console.log(`  - Total de registros: ${totalRows}`);
      const populated = manifestTables.filter((t) => t.rowCount > 0);
      console.log(`  - Tabelas com dados (${populated.length}): ${populated.map((t) => `${t.table} (${t.rowCount})`).join(', ')}`);
      return { manifest, data: fullData };
    }

    mkdirSync(backupDir, { recursive: true });
    writeFileSync(join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
    writeFileSync(join(backupDir, 'data.json'), JSON.stringify(fullData, null, 2), 'utf8');
    writeFileSync(join(backupDir, 'dump.sql'), sqlChunks.join('\n'), 'utf8');

    console.log(`\n✅ Backup gravado com sucesso em: ${backupDir}`);
    console.log(`   - Tabelas processadas: ${orderedTables.length}`);
    console.log(`   - Total de registros: ${totalRows}`);
    console.log(`   - Arquivos gerados: manifest.json, data.json, dump.sql`);

    return { backupDir, manifest, totalRows };
  } finally {
    await prisma.$disconnect();
  }
}

// Execução direta via CLI
if (process.argv[1]?.endsWith('postgres-backup.mjs')) {
  runBackup().catch((error) => {
    console.error('Falha ao executar backup:', error);
    process.exit(1);
  });
}
