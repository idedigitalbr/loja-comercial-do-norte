import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';

// O painel administrativo continua sendo servido pela API NestJS (build Vite).
// A loja pública roda em Next.js como serviço separado: não é copiada para cá.
const targets = [['apps/admin/dist', 'apps/api/public/admin']];

for (const [source, target] of targets) {
  await rm(target, { recursive: true, force: true });
  if (!existsSync(source)) {
    console.warn(`Build ausente em ${source}; ${target} não foi atualizado.`);
    continue;
  }
  await mkdir(target, { recursive: true });
  await cp(source, target, { recursive: true });
}

console.log('Build do admin copiado para apps/api/public sem tocar em storage/uploads.');
