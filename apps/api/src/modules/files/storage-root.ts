import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

export function resolveApiProjectRoot(workingDirectory = process.cwd()): string {
  const currentDirectory = resolve(workingDirectory);
  const apiFromWorkspaceRoot = join(currentDirectory, 'apps', 'api');
  return existsSync(join(apiFromWorkspaceRoot, 'package.json')) ? apiFromWorkspaceRoot : currentDirectory;
}

export function resolveApiStorageRoot(workingDirectory = process.cwd()): string {
  const projectRoot = resolveApiProjectRoot(workingDirectory);
  const directStorage = join(projectRoot, 'storage');
  if (existsSync(directStorage)) return directStorage;
  const publicStorage = join(projectRoot, 'public', 'storage');
  if (existsSync(publicStorage)) return publicStorage;
  return directStorage;
}
