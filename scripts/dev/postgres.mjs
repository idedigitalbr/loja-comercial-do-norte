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
import { existsSync, mkdirSync, openSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import net from 'node:net';
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
    detached: true,
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

function usesLocalEmbeddedDatabase() {
  if (process.env.CI === 'true') return false;
  let dbUrl = process.env.DATABASE_URL ?? '';
  if (!dbUrl && existsSync(path.join(root, '.env'))) {
    const envContent = readFileSync(path.join(root, '.env'), 'utf8');
    const match = envContent.match(/^DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m);
    if (match) dbUrl = match[1];
  }
  return dbUrl.includes(`127.0.0.1:${port}`) || dbUrl.includes(`localhost:${port}`);
}

function isPortOpen(host, portNumber) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port: Number(portNumber) });
    socket.setTimeout(500);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    const onFail = () => {
      socket.destroy();
      resolve(false);
    };
    socket.once('error', onFail);
    socket.once('timeout', onFail);
  });
}

async function ensure() {
  if (!usesLocalEmbeddedDatabase() || !existsSync(path.join(dataDir, 'PG_VERSION'))) {
    return;
  }
  const readyCheck = async () => {
    const status = spawnSync(binary('pg_ctl'), ['-D', dataDir, 'status'], { stdio: 'ignore', windowsHide: true });
    return status.status === 0 && (await isPortOpen('127.0.0.1', port));
  };
  if (await readyCheck()) return;
  start();
  for (let i = 0; i < 40; i += 1) {
    if (await readyCheck()) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  console.warn(`Aviso: PostgreSQL local ainda iniciando em 127.0.0.1:${port}.`);
}

if (action === 'init') initialize();
else if (action === 'start') start();
else if (action === 'stop') stop();
else if (action === 'ensure') await ensure();
else {
  console.error('Uso: node scripts/dev/postgres.mjs [init|start|stop|ensure]');
  process.exit(1);
}
