import { existsSync } from 'node:fs';

const required = [
  'apps/storefront/package.json',
  'apps/admin/package.json',
  'apps/api/package.json',
  'packages/contracts/package.json',
  'packages/ui/package.json',
  'packages/api-client/package.json',
  'packages/config-eslint/index.mjs',
  'packages/config-typescript/tsconfig.base.json',
  'prisma/schema.prisma',
];

const missing = required.filter((file) => !existsSync(file));

if (missing.length > 0) {
  throw new Error(`Missing workspace files: ${missing.join(', ')}`);
}

console.log(`Workspace structure valid: ${required.length} files checked.`);
