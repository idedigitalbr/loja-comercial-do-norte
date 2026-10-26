#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PrismaClient } from '@prisma/client';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
export function assertLocalTestAdminUrl(value) {
  const url = new URL(value);
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('API test admin must use PostgreSQL on loopback');
  if ((url.searchParams.get('schema') ?? 'public') !== 'public') throw new Error('API tests require public schema');
  return url;
}
export async function withApiTestDatabase(callback, adminUrl = process.env.API_TEST_ADMIN_URL ?? `postgresql://postgres:postgres@127.0.0.1:${process.env.CI ? '5432' : '55432'}/postgres`) {
  const url = assertLocalTestAdminUrl(adminUrl);
  const admin = new PrismaClient({ datasources: { db: { url: url.toString() } } });
  const name = `cn_api_test_${randomUUID().replaceAll('-', '')}`;
  let created = false;
  try {
    const [server] = await admin.$queryRawUnsafe('SELECT host(inet_server_addr()) AS address');
    if (!['127.0.0.1', '::1'].includes(server.address)) throw new Error('API tests require an actual local PostgreSQL server');
    await admin.$executeRawUnsafe(`CREATE DATABASE "${name}"`);
    created = true;
    url.pathname = '/' + name;
    const environment = {
      ...process.env, DATABASE_URL: url.toString(), DATABASE_URL_UNPOOLED: url.toString(),
      NODE_ENV: 'test', VERCEL: '', VERCEL_ENV: '',
      COOKIE_SECRET: randomUUID() + randomUUID(), CRON_SECRET: randomUUID(),
      SETTINGS_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString('base64'),
      DEFAULT_ADMIN_EMAIL: 'admin@isolated.test', DEFAULT_ADMIN_PASSWORD: 'TestAdmin!2026',
      DEFAULT_CUSTOMER_EMAIL: 'customer@isolated.test', DEFAULT_CUSTOMER_PASSWORD: 'TestCustomer!2026',
      APP_ORIGIN: 'http://localhost:3001', ADMIN_ORIGIN: 'http://localhost:5174',
      FEATURE_CHECKOUT: 'false', FEATURE_PAYMENTS: 'false', FEATURE_TRAININGS: 'false',
      COMPOSITION_TEST_DATABASE_URL: adminUrl,
    };
    const run = (script, args, cwd = root) => {
      const result = spawnSync(process.execPath, [script, ...args], { cwd, env: environment, stdio: 'inherit', windowsHide: true });
      if (result.error || result.status !== 0) throw new Error(`Isolated test command failed (${result.status ?? result.error?.code})`);
    };
    run(require.resolve('prisma/build/index.js'), ['migrate', 'deploy', '--schema', join(root, 'prisma/schema.prisma')]);
    run(require.resolve('tsx/cli'), [join(root, 'prisma/seed.ts')]);
    return await callback({ environment, run, name, root });
  } finally {
    try { if (created) await admin.$executeRawUnsafe(`DROP DATABASE "${name}" WITH (FORCE)`); }
    finally { await admin.$disconnect(); }
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  withApiTestDatabase(({ run }) => {
    const vitest = join(dirname(require.resolve('vitest/package.json')), 'vitest.mjs');
    const args = process.argv.slice(2);
    const unit = args.includes('--unit');
    run(vitest, ['run', '--config', unit ? 'vitest.config.ts' : 'vitest.e2e.config.ts', ...args.filter(arg => arg !== '--unit')], join(root, 'apps/api'));
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
