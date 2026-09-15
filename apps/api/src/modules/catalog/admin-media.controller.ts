import { BadRequestException, Body, Controller, Inject, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { LocalFileStorageService } from '../files/local-file-storage.service';
import { imageFileFilter, imageUploadErrorCode, publicStoragePath } from '../files/storage-path';

type UploadedImage = { buffer: Buffer; mimetype: string; originalname: string };

@UseGuards(SessionGuard, PermissionGuard)
@RequirePermissions(Permissions.PRODUCTS_WRITE)
@Controller('admin/media')
export class AdminMediaController {
  constructor(@Inject(LocalFileStorageService) private readonly storage: LocalFileStorageService) {}

  @Post('images')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: imageFileFilter,
  }))
  async upload(@UploadedFile() file?: UploadedImage, @Body('altText') altText?: string) {
    if (!file) throw new BadRequestException('IMAGE_REQUIRED');
    let stored;
    try {
      stored = await this.storage.storeImage({
        buffer: file.buffer,
        mimeType: file.mimetype,
        originalName: file.originalname,
      });
    } catch (error) {
      throw new BadRequestException(imageUploadErrorCode(error));
    }
    return this.toResponse(stored, file, altText);
  }

  @Post('brand-images')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: imageFileFilter,
  }))
  async uploadBrandImage(@UploadedFile() file?: UploadedImage, @Body('altText') altText?: string) {
    if (!file) throw new BadRequestException('IMAGE_REQUIRED');
    let stored;
    try {
      stored = await this.storage.storeSquareImage({
        buffer: file.buffer,
        mimeType: file.mimetype,
        originalName: file.originalname,
      });
    } catch (error) {
      throw new BadRequestException(imageUploadErrorCode(error));
    }
    return this.toResponse(stored, file, altText);
  }

  private toResponse(stored: { path: string; variants: string[] }, file: UploadedImage, altText?: string) {
    return {
      path: publicStoragePath(stored.path) ?? '',
      variants: stored.variants.map((path) => publicStoragePath(path) ?? ''),
      altText: altText?.trim().slice(0, 255) || file.originalname.replace(/\.[^.]+$/, ''),
    };
  }
}
