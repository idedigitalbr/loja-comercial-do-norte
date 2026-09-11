import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const envFile = join(process.cwd(), '.env');
const fileEnv = existsSync(envFile)
  ? Object.fromEntries(readFileSync(envFile, 'utf8').split(/\r?\n/).filter((line) => line && !line.trimStart().startsWith('#')).map((line) => { const index = line.indexOf('='); return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')]; }).filter(([key]) => key))
  : {};
const get = (key) => process.env[key] ?? fileEnv[key];
const required = ['DATABASE_URL', 'COOKIE_SECRET', 'CRON_SECRET'];
const missing = required.filter((key) => !get(key));
if (missing.length) throw new Error(`Missing environment keys: ${missing.join(', ')}`);
if (!/^22\./.test(process.versions.node)) throw new Error(`Node.js 22 is required; found ${process.versions.node}`);
for (const file of ['pnpm-workspace.yaml', 'prisma/schema.prisma', 'apps/api/package.json']) if (!existsSync(join(process.cwd(), file))) throw new Error(`Missing workspace file: ${file}`);
console.log('Local environment configuration is valid. Secrets were not printed.');
