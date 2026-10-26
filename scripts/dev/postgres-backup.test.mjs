import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sortTablesTopologically,
  escapeSqlValue,
  generateSqlInsert,
  runBackup,
} from './postgres-backup.mjs';
import { isProductionDatabase } from './postgres-restore.mjs';

describe('PostgreSQL Backup & Recovery Suite (Issue #12)', () => {
  describe('sortTablesTopologically', () => {
    it('ordena tabelas independentes e com dependência direta', () => {
      const tables = ['ProductVariant', 'Product', 'ProductImage'];
      const fks = [
        { fromTable: 'ProductVariant', toTable: 'Product' },
        { fromTable: 'ProductImage', toTable: 'Product' },
      ];

      const sorted = sortTablesTopologically(tables, fks);

      // Product deve vir antes de ProductVariant e ProductImage
      const productIndex = sorted.indexOf('Product');
      const variantIndex = sorted.indexOf('ProductVariant');
      const imageIndex = sorted.indexOf('ProductImage');

      assert.ok(productIndex < variantIndex, 'Product deve preceder ProductVariant');
      assert.ok(productIndex < imageIndex, 'Product deve preceder ProductImage');
    });

    it('trata chaves autoreferenciadas sem travar', () => {
      const tables = ['Category'];
      const fks = [{ fromTable: 'Category', toTable: 'Category' }];

      const sorted = sortTablesTopologically(tables, fks);
      assert.deepEqual(sorted, ['Category']);
    });
  });

  describe('escapeSqlValue', () => {
    it('escapa null, booleanos e números', () => {
      assert.equal(escapeSqlValue(null), 'NULL');
      assert.equal(escapeSqlValue(undefined), 'NULL');
      assert.equal(escapeSqlValue(true), 'TRUE');
      assert.equal(escapeSqlValue(false), 'FALSE');
      assert.equal(escapeSqlValue(42), '42');
      assert.equal(escapeSqlValue(3.14), '3.14');
    });

    it('escapa strings com aspas simples para prevenir SQL injection', () => {
      assert.equal(escapeSqlValue("Pizza d'água"), "'Pizza d''água'");
      assert.equal(escapeSqlValue('Normal text'), "'Normal text'");
    });

    it('formata objetos como JSONB e datas como ISO', () => {
      const date = new Date('2026-10-26T12:00:00.000Z');
      assert.equal(escapeSqlValue(date), "'2026-10-26T12:00:00.000Z'::timestamptz");

      const obj = { foo: "bar's" };
      assert.equal(escapeSqlValue(obj), "'{\"foo\":\"bar''s\"}'::jsonb");
    });
  });

  describe('generateSqlInsert', () => {
    it('gera comandos INSERT com colunas entre aspas duplas', () => {
      const rows = [
        { id: '1', name: 'Caixa Pizza', active: true },
        { id: '2', name: 'Copo 180ml', active: false },
      ];

      const sql = generateSqlInsert('Product', rows);
      assert.ok(sql.includes('INSERT INTO "Product" ("id", "name", "active")'));
      assert.ok(sql.includes("('1', 'Caixa Pizza', TRUE)"));
      assert.ok(sql.includes("('2', 'Copo 180ml', FALSE)"));
      assert.ok(sql.includes('ON CONFLICT DO NOTHING;'));
    });
  });

  describe('isProductionDatabase', () => {
    it('detecta URLs de produção da nuvem', () => {
      assert.equal(
        isProductionDatabase('postgresql://user:pass@ep-bitter-haze.sa-east-1.aws.neon.tech/db?sslmode=require'),
        true,
      );
      assert.equal(
        isProductionDatabase('postgresql://user:pass@production-db.internal/db'),
        true,
      );
    });

    it('identifica instâncias locais como seguras para desenvolvimento', () => {
      assert.equal(
        isProductionDatabase('postgresql://postgres@localhost:5432/test_db'),
        false,
      );
      assert.equal(
        isProductionDatabase('postgresql://postgres@127.0.0.1:55432/comercial_norte_dev'),
        false,
      );
    });
  });

  describe('Execução em Dry-Run', () => {
    it('executa dry-run de backup contra o banco ativo sem erro', async () => {
      const result = await runBackup({ dryRun: true });
      assert.ok(result, 'Resultado do backup dry-run não deve ser nulo');
      assert.ok(result.manifest.tablesCount > 0, 'Deve listar tabelas do schema');
      assert.ok(Array.isArray(result.manifest.topologicalOrder), 'Ordem topológica deve ser um array');
      assert.equal(typeof result.manifest.totalRows, 'number');
    });
  });
});
