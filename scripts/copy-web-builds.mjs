import { cp, mkdir, rm } from 'node:fs/promises';

const targets = [
  ['apps/storefront/dist', 'apps/api/public/storefront'],
  ['apps/admin/dist', 'apps/api/public/admin'],
];

for (const [source, target] of targets) {
  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
  await cp(source, target, { recursive: true });
}

console.log('Vite builds copied to apps/api/public without touching storage/uploads.');
