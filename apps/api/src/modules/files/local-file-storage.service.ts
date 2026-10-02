import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { resolveApiStorageRoot } from './storage-root';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export type UploadInput = {
  buffer: Uint8Array;
  mimeType: string;
  originalName: string;
};

@Injectable()
export class LocalFileStorageService {
  private readonly rootDirectory = join(resolveApiStorageRoot(), 'uploads');

  async storeImage(input: UploadInput): Promise<{ path: string; variants: string[] }> {
    return this.storeImageVariants(input, false);
  }

  async storeSquareImage(input: UploadInput): Promise<{ path: string; variants: string[] }> {
    return this.storeImageVariants(input, true);
  }

  private async storeImageVariants(input: UploadInput, square: boolean): Promise<{ path: string; variants: string[] }> {
    const extension = MIME_EXTENSIONS[input.mimeType];
    if (!extension) throw new Error('UNSUPPORTED_IMAGE_TYPE');
    if (!input.buffer.byteLength || input.buffer.byteLength > MAX_FILE_SIZE) {
      throw new Error('IMAGE_TOO_LARGE');
    }
    if (!input.originalName.includes('.')) throw new Error('INVALID_IMAGE_NAME');

    const folder = join(this.rootDirectory, randomUUID());
    await mkdir(folder, { recursive: true });
    const source = sharp(input.buffer);
    const variants: string[] = [];
    for (const width of [480, 960, 1440]) {
      const filename = `${width}.webp`;
      await source.clone().resize(square ? { width, height: width, fit: 'cover', position: 'centre' } : { width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(join(folder, filename));
      variants.push(this.relativePath(join(folder, filename)));
    }

    const originalFilename = `original${extension}`;
    await writeFile(join(folder, originalFilename), input.buffer);
    return {
      path: this.relativePath(join(folder, '960.webp')),
      variants,
    };
  }

  private relativePath(filePath: string): string {
    return relative(resolveApiStorageRoot(), filePath).replaceAll('\\', '/');
  }
}
