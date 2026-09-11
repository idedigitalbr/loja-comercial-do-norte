import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export async function importImage(sourcePath: string, targetPath: string) {
  const source = resolve(sourcePath);
  const target = resolve(targetPath);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
  return target;
}
