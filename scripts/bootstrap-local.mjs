import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

if (!existsSync('.env')) throw new Error('Create .env from the documented local template before bootstrapping.');
const verify = spawnSync(process.platform === 'win32' ? 'node.exe' : 'node', ['scripts/verify-local.mjs'], { stdio: 'inherit' });
if (verify.status !== 0) process.exit(verify.status ?? 1);
for (const args of [['db:repair:migrations'], ['prisma', 'migrate', 'deploy'], ['prisma', 'db', 'seed']]) {
  const result = spawnSync('pnpm', args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log('Local bootstrap completed without destructive database operations.');
