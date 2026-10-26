// Provisiona um PostgreSQL real de desenvolvimento/testes sem depender de
// Docker ou de instalacao global (usa os binarios de `embedded-postgres`).
//
//   pnpm db:local:init    # cria o cluster em .postgres-data (uma vez)
//   pnpm db:local:start   # sobe o servidor em 127.0.0.1:55432
//   pnpm db:local:stop    # encerra o servidor iniciado por este script
//
// O cluster fica em .postgres-data (ignorado pelo Git) com autenticacao trust:
// uso exclusivo local. Em CI/producao use um PostgreSQL gerenciado.
import { spawnSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, openSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const root = process.cwd();
const dataDir = path.join(root, '.postgres-data');
const logFile = path.join(dataDir, 'server.log');
const port = process.env.PG_PORT ?? '55432';
const action = process.argv[2] ?? 'start';

const platformPackages = {
  win32: 'windows-x64',
  linux: 'linux-x64',
  darwin: process.arch === 'arm64' ? 'darwin-arm64' : 'darwin-x64',
};

const platformDir = platformPackages[process.platform];
if (!platformDir) {
  console.error(`Plataforma nao suportada por este script: ${process.platform}`);
  process.exit(1);
}

function resolveBinDir() {
  const directPath = path.join(root, 'node_modules', '@embedded-postgres', platformDir, 'native', 'bin');
  if (existsSync(directPath)) return directPath;
  try {
    const reqRoot = createRequire(import.meta.url);
    const embeddedPkg = reqRoot.resolve('embedded-postgres');
    const reqEmbedded = createRequire(embeddedPkg);
    const entry = reqEmbedded.resolve(`@embedded-postgres/${platformDir}`);
    const resolvedPath = path.resolve(path.dirname(entry), '..', 'native', 'bin');
    if (existsSync(resolvedPath)) return resolvedPath;
  } catch {
    // fallback
  }
  return directPath;
}

const binDir = resolveBinDir();
const binary = (name) => path.join(binDir, process.platform === 'win32' ? `${name}.exe` : name);

if (!existsSync(binDir)) {
  console.error('Binarios ausentes. Rode `pnpm install` antes de usar este script.');
  process.exit(1);
}

function run(name, args) {
  const result = spawnSync(binary(name), args, { stdio: 'inherit', windowsHide: true });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function initialize() {
  if (existsSync(path.join(dataDir, 'PG_VERSION'))) {
    console.log(`Cluster existente em ${dataDir}`);
    return;
  }
  mkdirSync(dataDir, { recursive: true });
  run('initdb', ['-D', dataDir, '-U', 'postgres', '--auth=trust', '-E', 'UTF8', '--locale=C']);
  console.log(`Cluster criado em ${dataDir}`);
}

function start() {
  initialize();
  const status = spawnSync(binary('pg_ctl'), ['-D', dataDir, 'status'], { stdio: 'ignore', windowsHide: true });
  if (status.status === 0) {
    console.log(`PostgreSQL ja esta em execucao (${dataDir}).`);
    return;
  }
  // `postgres` roda em foreground; aqui ele vira processo destacado com log em arquivo.
  const log = openSync(logFile, 'a');
  const child = spawn(binary('postgres'), ['-D', dataDir, '-p', port, '-c', 'listen_addresses=127.0.0.1'], {
    detached: process.platform !== 'win32',
    windowsHide: true,
    stdio: ['ignore', log, log],
  });
  child.unref();
  console.log(`PostgreSQL iniciado em 127.0.0.1:${port} (log: ${logFile})`);
}

function stop() {
  const pidFile = path.join(dataDir, 'postmaster.pid');
  if (!existsSync(pidFile)) {
    console.log('Nenhum servidor local em execucao.');
    return;
  }
  run('pg_ctl', ['-D', dataDir, 'stop', '-m', 'fast', '-t', '15']);
}

if (action === 'init') initialize();
else if (action === 'start') start();
else if (action === 'stop') stop();
else {
  console.error('Uso: node scripts/dev/postgres.mjs [init|start|stop]');
  process.exit(1);
}
