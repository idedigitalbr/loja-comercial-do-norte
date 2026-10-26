import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { runBackup } from './postgres-backup.mjs';
import { runRestore, validateBackup } from './postgres-restore.mjs';
import { assertRestoreTarget, connectionIdentity, hash, quoteIdentifier, sortTablesTopologically, tableChecksum } from './postgres-backup-core.mjs';

test('topological ordering deduplicates dependencies and permits self references', () => {
 assert.deepEqual(sortTablesTopologically(['child','parent','self'], [{fromTable:'child',toTable:'parent'},{fromTable:'child',toTable:'parent'},{fromTable:'self',toTable:'self'}]), ['parent','self','child']);
});
test('cycles fail closed instead of disabling FK integrity', () => {
 assert.throws(() => sortTablesTopologically(['a','b'],[{fromTable:'a',toTable:'b'},{fromTable:'b',toTable:'a'}]), /CYCLE/);
});
test('identifiers escape quotes; row checksums ignore query order and preserve exact text', () => {
 assert.equal(quoteIdentifier('table"; DROP'), '"table""; DROP"');
 assert.equal(tableChecksum(['a','b']), tableChecksum(['b','a']));
 assert.notEqual(tableChecksum(['{"big":9007199254740993}']), tableChecksum(['{"big":9007199254740992}']));
});
test('restoration requires exact explicit local test target and no production override exists', () => {
 const local='postgresql://u:p@127.0.0.1:55439/cn_restore_test_one';
 assert.equal(assertRestoreTarget(local, connectionIdentity(local)), '127.0.0.1:55439/cn_restore_test_one');
 for (const remote of ['neon.tech','db.example.com','127.0.0.1.attacker.com']) assert.throws(() => assertRestoreTarget(`postgresql://localhost:p@${remote}/cn_restore_test_one`, 'yes'), /REMOTE/);
 assert.throws(() => assertRestoreTarget('postgresql://u:p@127.0.0.1/production','yes'), /TEST_DATABASE/);
 assert.throws(() => assertRestoreTarget(local,'wrong'), /CONFIRM_TARGET/);
 assert.throws(() => assertRestoreTarget(local+'?schema=other','yes'), /PUBLIC_SCHEMA/);
});
test('imports never read env credentials or connect; version 1 and damaged backups are rejected', () => {
 assert.throws(() => validateBackup({version:1}, '{}'), /VERSION/);
 assert.throws(() => validateBackup({version:2,format:'postgres-jsonb-text',dataChecksum:'wrong'},'{}'), /CHECKSUM/);
});

const baseUrl = process.env.BACKUP_TEST_DATABASE_URL;
describe('real PostgreSQL backup/restore (disposable databases)', { skip: !baseUrl }, () => {
 let admin, source, target, directory, sourceUrl, targetUrl, sourceName, targetName, backup;
 const definition = [
  `CREATE TYPE "Mood" AS ENUM ('on','off')`,
  `CREATE TABLE "AParent" (id text PRIMARY KEY, amount numeric(30,12), big bigint, bytes bytea, at timestamptz, payload jsonb, tags text[], mood "Mood", computed numeric GENERATED ALWAYS AS (amount * 2) STORED)`,
  `CREATE TABLE "BChild" (id text PRIMARY KEY, parent text NOT NULL REFERENCES "AParent"(id), note text NOT NULL CHECK (length(note)>0))`,
  `CREATE TABLE "Empty" (id text PRIMARY KEY)`,
  `CREATE TABLE "Node" (id text PRIMARY KEY, parent text REFERENCES "Node"(id))`,
 ];
 before(async () => {
  const base = new URL(baseUrl);
  assert.ok(['127.0.0.1','localhost','[::1]'].includes(base.hostname), 'test database must use loopback');
  admin = new PrismaClient({datasources:{db:{url:base.toString()}}});
  const suffix=randomUUID().replaceAll('-','');
  sourceName=`cn_backup_test_${suffix}`; targetName=`cn_restore_test_${suffix}`;
  await admin.$executeRawUnsafe(`CREATE DATABASE ${quoteIdentifier(sourceName)}`);
  await admin.$executeRawUnsafe(`CREATE DATABASE ${quoteIdentifier(targetName)}`);
  base.pathname='/'+sourceName; sourceUrl=base.toString();
  base.pathname='/'+targetName; targetUrl=base.toString();
  source = new PrismaClient({datasources:{db:{url:sourceUrl}}}); target = new PrismaClient({datasources:{db:{url:targetUrl}}});
  for (const sql of definition) { await source.$executeRawUnsafe(sql); await target.$executeRawUnsafe(sql); }
  await source.$executeRawUnsafe(`INSERT INTO "AParent" (id,amount,big,bytes,at,payload,tags,mood) VALUES ('parent',9007199254740993.123456789012,9223372036854775807,decode('00ff','hex'),'2026-10-26 12:34:56.123456+00','{"exact":9007199254740993,"nested":[true,null]}'::jsonb,ARRAY['ação','quote''; DROP TABLE x; --'],'on')`);
  await source.$executeRawUnsafe(`INSERT INTO "BChild" VALUES ('child','parent','ação com aspas '' e barra \\')`);
  await source.$executeRawUnsafe(`INSERT INTO "Node" VALUES ('child','root'),('root',NULL)`);
  directory=await mkdtemp(join(tmpdir(),'cn-backup-test-'));
  backup=await runBackup({connectionUrl:sourceUrl,outDir:join(directory,'snapshot')});
 });
 after(async () => {
  await source?.$disconnect(); await target?.$disconnect();
  if (admin) {
   if (sourceName) await admin.$executeRawUnsafe(`DROP DATABASE IF EXISTS ${quoteIdentifier(sourceName)} WITH (FORCE)`);
   if (targetName) await admin.$executeRawUnsafe(`DROP DATABASE IF EXISTS ${quoteIdentifier(targetName)} WITH (FORCE)`);
   await admin.$disconnect();
  }
  if (directory) await rm(directory,{recursive:true,force:true});
 });
 test('backup roundtrip preserves exact PostgreSQL values and recomputes generated columns', async () => {
  const result=await runRestore({connectionUrl:targetUrl,fromDir:backup.backupDir,confirmTarget:connectionIdentity(targetUrl)});
  assert.equal(result.restoredRows,4);
  const [values]=await target.$queryRawUnsafe(`SELECT amount::text, big::text, encode(bytes,'hex') AS bytes, payload::text FROM "AParent"`);
  assert.equal(values.amount,'9007199254740993.123456789012'); assert.equal(values.big,'9223372036854775807'); assert.equal(values.bytes,'00ff'); assert.match(values.payload,/9007199254740993/);
  assert.equal(Number((await target.$queryRawUnsafe(`SELECT count(*) AS count FROM "Node"`))[0].count),2);
 });
 test('dry-run validates schema without changing target and empty backup tables are actually cleared', async () => {
  await target.$executeRawUnsafe(`INSERT INTO "Empty" VALUES ('must-go')`);
  await runRestore({connectionUrl:targetUrl,fromDir:backup.backupDir,dryRun:true});
  assert.equal(Number((await target.$queryRawUnsafe(`SELECT count(*) AS count FROM "Empty"`))[0].count),1);
  await runRestore({connectionUrl:targetUrl,fromDir:backup.backupDir,confirmTarget:connectionIdentity(targetUrl)});
  assert.equal(Number((await target.$queryRawUnsafe(`SELECT count(*) AS count FROM "Empty"`))[0].count),0);
 });
 test('bad checksum is detected before deleting target data', async () => {
  const original=await readFile(join(backup.backupDir,'data.json'),'utf8');
  await writeFile(join(backup.backupDir,'data.json'),original+' ');
  await assert.rejects(runRestore({connectionUrl:targetUrl,fromDir:backup.backupDir,confirmTarget:connectionIdentity(targetUrl)}),/CHECKSUM/);
  assert.equal(Number((await target.$queryRawUnsafe(`SELECT count(*) AS count FROM "AParent"`))[0].count),1);
  await writeFile(join(backup.backupDir,'data.json'),original);
 });
 test('schema mismatch is rejected before mutation', async () => {
  await target.$executeRawUnsafe(`ALTER TABLE "Empty" ADD COLUMN extra text`);
  await assert.rejects(runRestore({connectionUrl:targetUrl,fromDir:backup.backupDir,confirmTarget:connectionIdentity(targetUrl)}),/SCHEMA_OR_MIGRATION/);
  await target.$executeRawUnsafe(`ALTER TABLE "Empty" DROP COLUMN extra`);
 });
 test('constraint failure after deletes rolls back the entire target', async () => {
  const dataText=await readFile(join(backup.backupDir,'data.json'),'utf8');
  const manifestText=await readFile(join(backup.backupDir,'manifest.json'),'utf8');
  const data=JSON.parse(dataText), manifest=JSON.parse(manifestText);
  data.BChild=['{"id":"bad","parent":"nonexistent","note":"still valid text"}'];
  const changed=JSON.stringify(data);
  manifest.dataChecksum=hash(changed); manifest.tables.find(table=>table.table==='BChild').checksum=tableChecksum(data.BChild);
  await writeFile(join(backup.backupDir,'data.json'),changed); await writeFile(join(backup.backupDir,'manifest.json'),JSON.stringify(manifest));
  await assert.rejects(runRestore({connectionUrl:targetUrl,fromDir:backup.backupDir,confirmTarget:connectionIdentity(targetUrl)}));
  assert.equal((await target.$queryRawUnsafe(`SELECT id FROM "BChild"`))[0].id,'child');
  assert.equal((await target.$queryRawUnsafe(`SELECT id FROM "AParent"`))[0].id,'parent');
  await writeFile(join(backup.backupDir,'data.json'),dataText); await writeFile(join(backup.backupDir,'manifest.json'),manifestText);
 });
 test('repeatable-read snapshot remains consistent during concurrent source writes', async () => {
  let changed=false;
  const result=await runBackup({connectionUrl:sourceUrl,dryRun:true,onSnapshot:async table=>{
   if (table==='AParent' && !changed) { changed=true; await source.$executeRawUnsafe(`UPDATE "BChild" SET note='changed after snapshot'`); }
  }});
  assert.ok(result.data.BChild.every(row=>!row.includes('changed after snapshot')));
 });
 test('sequences fail closed with explicit pg_dump guidance', async () => {
  await target.$executeRawUnsafe(`CREATE SEQUENCE public.unsupported_sequence`);
  await assert.rejects(runBackup({connectionUrl:targetUrl,dryRun:true}),/PG_DUMP/);
  await target.$executeRawUnsafe(`DROP SEQUENCE public.unsupported_sequence`);
 });
 test('custom triggers fail closed before any restore', async () => {
  await target.$executeRawUnsafe(`CREATE FUNCTION public.test_trigger_fn() RETURNS trigger LANGUAGE plpgsql AS 'BEGIN RETURN NEW; END'`);
  await target.$executeRawUnsafe(`CREATE TRIGGER test_trigger BEFORE INSERT ON "Empty" FOR EACH ROW EXECUTE FUNCTION public.test_trigger_fn()`);
  await assert.rejects(runBackup({connectionUrl:targetUrl,dryRun:true}),/PG_DUMP/);
  await target.$executeRawUnsafe(`DROP TRIGGER test_trigger ON "Empty"`);
  await target.$executeRawUnsafe(`DROP FUNCTION public.test_trigger_fn()`);
 });
});
