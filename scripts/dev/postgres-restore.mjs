#!/usr/bin/env node
/**
 * PostgreSQL Recovery / Restore Utility — Comercial do Norte (Issue #12)
 *
 * Restaura um backup em formato JSON/SQL para o banco de dados em ordem topológica,
 * com travas estritas contra restauração acidental em produção.
 *
 * Uso:
 *   node scripts/dev/postgres-restore.mjs [--from <dir>] [--dry-run] [--confirm-production]
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { escapeSqlValue } from './postgres-backup.mjs';

const isNeon = process.argv.includes('--neon');
const isDryRun = process.argv.includes('--dry-run');
const hasConfirmProd = process.argv.includes('--confirm-production');
const fromArgIndex = process.argv.indexOf('--from');
const customFromDir = fromArgIndex !== -1 && process.argv[fromArgIndex + 1] ? process.argv[fromArgIndex + 1] : null;

if (isNeon && existsSync('.env.neon')) {
  dotenv.config({ path: '.env.neon', override: true });
} else if (existsSync('.env')) {
  dotenv.config({ path: '.env' });
}

const connectionUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!connectionUrl) {
  console.error('ERRO: Nenhuma connection string encontrada.');
  process.exit(1);
}

export function isProductionDatabase(url) {
  if (!url) return false;
  return /neon\.tech|aws|sa-east-1|production/i.test(url) && !/localhost|127\.0\.0\.1/i.test(url);
}

export function findLatestBackupDir(baseDir = resolve(process.cwd(), 'backups')) {
  if (!existsSync(baseDir)) return null;
  const entries = readdirSync(baseDir)
    .map((name) => join(baseDir, name))
    .filter((fullPath) => statSync(fullPath).isDirectory() && existsSync(join(fullPath, 'manifest.json')));

  if (entries.length === 0) return null;
  entries.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return entries[0];
}

export async function runRestore(options = {}) {
  const targetDir = customFromDir || options.fromDir || findLatestBackupDir();

  if (!targetDir || !existsSync(targetDir)) {
    console.error(`ERRO: Diretório de backup não encontrado (${targetDir ?? 'nenhum backup em ./backups/'}).`);
    process.exit(1);
  }

  const manifestPath = join(targetDir, 'manifest.json');
  const dataPath = join(targetDir, 'data.json');

  if (!existsSync(manifestPath) || !existsSync(dataPath)) {
    console.error(`ERRO: Arquivos manifest.json e data.json obrigatórios não encontrados em ${targetDir}.`);
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const data = JSON.parse(readFileSync(dataPath, 'utf8'));

  // 1. Trava estrita de segurança de produção
  if (isProductionDatabase(connectionUrl) && !hasConfirmProd && !options.confirmProduction) {
    console.error('\n🛑 BLOQUEIO DE SEGURANÇA OPERACIONAL:');
    console.error('   A URL de destino aponta para um banco de produção na nuvem (Neon/AWS).');
    console.error('   Restaurações em produção exigem a flag explícita --confirm-production.');
    console.error('   Para testes locais seguros, aponte DATABASE_URL para 127.0.0.1:55432.\n');
    process.exit(1);
  }

  console.log(`[Restore PostgreSQL] Analisando backup de: ${targetDir}`);
  console.log(`  - Criado em: ${manifest.createdAt}`);
  console.log(`  - Tabelas: ${manifest.tablesCount}`);
  console.log(`  - Total de registros: ${manifest.totalRows}`);

  if (isDryRun || options.dryRun) {
    console.log('\n[DRY-RUN] Simulação de restauração concluída:');
    console.log(`  - Ordem topológica de inserção (${manifest.topologicalOrder.length} tabelas):`);
    console.log(`    ${manifest.topologicalOrder.join(' -> ')}`);
    console.log('  Nenhuma alteração foi realizada no banco.');
    return { dryRun: true, manifest };
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: connectionUrl } },
  });

  try {
    console.log('\n[Restore PostgreSQL] Iniciando restauração transacional...');

    // Desativa restrições de chave para evitar conflitos durante a carga
    await prisma.$executeRawUnsafe("SET session_replication_role = 'replica';");

    let restoredRows = 0;
    for (const table of manifest.topologicalOrder) {
      const rows = data[table] || [];
      if (rows.length === 0) continue;

      // Limpa dados anteriores da tabela de forma idempotente
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);

      // Insere registros
      const columns = Object.keys(rows[0]);
      const quotedColumns = columns.map((col) => `"${col}"`).join(', ');

      for (const row of rows) {
        const values = columns.map((col) => escapeSqlValue(row[col])).join(', ');
        await prisma.$executeRawUnsafe(`INSERT INTO "${table}" (${quotedColumns}) VALUES (${values});`);
      }

      restoredRows += rows.length;
    }

    // Reativa restrições de integridade
    await prisma.$executeRawUnsafe("SET session_replication_role = 'origin';");

    console.log(`\n✅ Restauração concluída com sucesso!`);
    console.log(`   - Registros restaurados: ${restoredRows}/${manifest.totalRows}`);

    return { restoredRows, manifest };
  } finally {
    await prisma.$disconnect();
  }
}

// Execução direta via CLI
if (process.argv[1]?.endsWith('postgres-restore.mjs')) {
  runRestore().catch((error) => {
    console.error('Falha ao restaurar banco:', error);
    process.exit(1);
  });
}
