import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

export function resolveApiProjectRoot(workingDirectory = process.cwd()): string {
  const currentDirectory = resolve(workingDirectory);
  const apiFromWorkspaceRoot = join(currentDirectory, 'apps', 'api');
  return existsSync(join(apiFromWorkspaceRoot, 'package.json')) ? apiFromWorkspaceRoot : currentDirectory;
}

export function resolveApiStorageRoot(workingDirectory = process.cwd()): string {
  const projectRoot = resolveApiProjectRoot(workingDirectory);
  const candidates = [
    join(projectRoot, 'storage'),
    join(projectRoot, 'public', 'storage'),
    join(projectRoot, 'dist', 'public', 'storage'),
    join(projectRoot, 'dist', 'storage'),
    join(__dirname, '..', '..', 'public', 'storage'),
    join(__dirname, '..', '..', 'storage'),
    join(__dirname, '..', '..', '..', 'public', 'storage'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return join(projectRoot, 'storage');
}
