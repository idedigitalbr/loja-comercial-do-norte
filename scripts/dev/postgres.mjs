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

const binDir = path.join(root, 'node_modules', '@embedded-postgres', platformDir, 'native', 'bin');
const binary = (name) => path.join(binDir, process.platform === 'win32' ? `${name}.exe` : name);

if (!existsSync(binDir)) {
  console.error('Binarios ausentes. Rode `pnpm install` antes de usar este script.');
  process.exit(1);
}

function run(name, args) {
  const result = spawnSync(binary(name), args, { stdio: 'inherit' });
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
  // `postgres` roda em foreground; aqui ele vira processo destacado com log em arquivo.
  const log = openSync(logFile, 'a');
  const child = spawn(binary('postgres'), ['-D', dataDir, '-p', port, '-c', 'listen_addresses=127.0.0.1'], {
    detached: true,
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
  const pid = Number(readFileSync(pidFile, 'utf8').split('\n')[0]);
  if (!Number.isInteger(pid)) {
    console.error('postmaster.pid invalido.');
    process.exit(1);
  }
  try {
    process.kill(pid);
    console.log(`Servidor ${pid} encerrado.`);
  } catch (error) {
    console.error(`Nao foi possivel encerrar o servidor ${pid}: ${error.message}`);
    process.exit(1);
  }
}

if (action === 'init') initialize();
else if (action === 'start') start();
else if (action === 'stop') stop();
else {
  console.error('Uso: node scripts/dev/postgres.mjs [init|start|stop]');
  process.exit(1);
}
