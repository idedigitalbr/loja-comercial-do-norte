import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

export interface ProcessedProductMedia {
  dbPath: string;
  widthPx: number | null;
  heightPx: number | null;
  sha256: string;
  reusedExisting: boolean;
}

const IMAGE_VARIANTS = [
  { fileName: '480.webp', maxDim: 480, quality: 82 },
  { fileName: '960.webp', maxDim: 960, quality: 86 },
  { fileName: '1440.webp', maxDim: 1440, quality: 88 },
] as const;

export async function processCatalogImage(options: {
  sourceFileAbs: string;
  storageRootAbs: string;
  folderKey: string;
  force?: boolean;
}): Promise<ProcessedProductMedia> {
  const { sourceFileAbs, storageRootAbs, folderKey, force = false } = options;

  if (!existsSync(sourceFileAbs)) {
    throw new Error(`Imagem de origem não encontrada: ${sourceFileAbs}`);
  }

  const rawBuffer = await readFile(sourceFileAbs);
  const sha256 = createHash('sha256').update(rawBuffer).digest('hex');

  const safeFolder = folderKey.replace(/[^a-z0-9-_]/gi, '-').replace(/^-+|-+$/g, '') || sha256.slice(0, 12);
  const relativeDir = `uploads/cn-cat/${safeFolder}`;
  const targetDirAbs = resolve(storageRootAbs, relativeDir);
  const primaryTargetAbs = resolve(targetDirAbs, '960.webp');
  const dbPath = `${relativeDir}/960.webp`;

  const metadata = await sharp(rawBuffer).metadata();
  const widthPx = metadata.width ?? null;
  const heightPx = metadata.height ?? null;

  const allTargetsExist = IMAGE_VARIANTS.every((spec) => existsSync(resolve(targetDirAbs, spec.fileName)));
  if (!force && allTargetsExist) {
    const fileInfo = await stat(primaryTargetAbs);
    if (fileInfo.size > 0) {
      return { dbPath, widthPx, heightPx, sha256, reusedExisting: true };
    }
  }

  await mkdir(targetDirAbs, { recursive: true });

  await Promise.all(
    IMAGE_VARIANTS.map((spec) =>
      sharp(rawBuffer)
        .rotate()
        .resize({
          width: spec.maxDim,
          height: spec.maxDim,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: spec.quality, effort: 4 })
        .toFile(resolve(targetDirAbs, spec.fileName)),
    ),
  );

  return { dbPath, widthPx, heightPx, sha256, reusedExisting: false };
}
