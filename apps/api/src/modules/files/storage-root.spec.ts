import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveApiStorageRoot } from './storage-root';

function findWorkspaceRoot(start = process.cwd()): string {
  let current = resolve(start);
  while (!existsSync(join(current, 'pnpm-workspace.yaml'))) {
    const parent = dirname(current);
    if (parent === current) throw new Error('Workspace root not found');
    current = parent;
  }
  return current;
}

describe('resolveApiStorageRoot', () => {
  it('uses the same storage/uploads directory from the workspace root and API app directory', () => {
    const workspaceRoot = findWorkspaceRoot();
    const fromWorkspaceRoot = resolveApiStorageRoot(workspaceRoot);
    const fromApiAppDir = resolveApiStorageRoot(join(workspaceRoot, 'apps', 'api'));

    expect(fromApiAppDir).toBe(fromWorkspaceRoot);
    expect(existsSync(fromWorkspaceRoot)).toBe(true);
  });
});
