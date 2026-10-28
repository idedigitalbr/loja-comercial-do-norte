import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';

// O painel administrativo continua sendo servido pela API NestJS (build Vite).
// As mídias e uploads são espelhados em public/storage para entrega estática na Vercel CDN.
const targets = [
  ['apps/admin/dist', 'apps/api/public/admin'],
  ['apps/api/storage', 'apps/api/public/storage'],
  ['apps/api/storage', 'apps/api/dist/storage'],
  ['apps/api/storage', 'apps/storefront/public/storage'],
];

for (const [source, target] of targets) {
  await rm(target, { recursive: true, force: true });
  if (!existsSync(source)) {
    console.warn(`Build ausente em ${source}; ${target} não foi atualizado.`);
    continue;
  }
  await mkdir(target, { recursive: true });
  await cp(source, target, { recursive: true });
}

console.log('Build do admin e storage copiados para apps/api/public com sucesso.');

