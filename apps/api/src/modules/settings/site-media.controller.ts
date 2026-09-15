import { BadRequestException, Body, Controller, Inject, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { LocalFileStorageService } from '../files/local-file-storage.service';
import { imageFileFilter, imageUploadErrorCode, publicStoragePath } from '../files/storage-path';
import { SettingsService } from './settings.service';

type UploadedImage = { buffer: Buffer; mimetype: string; originalname: string };

@UseGuards(SessionGuard, PermissionGuard)
@RequirePermissions(Permissions.SETTINGS_MANAGE)
@Controller('admin/settings/media')
export class SiteMediaController {
  constructor(
    @Inject(LocalFileStorageService) private readonly storage: LocalFileStorageService,
    @Inject(SettingsService) private readonly settingsService: SettingsService,
  ) {}

  @Post('logo')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: imageFileFilter }))
  async uploadLogo(@UploadedFile() file?: UploadedImage) {
    const stored = await this.store(file, false);
    await this.settingsService.updateSite({ logoPath: stored.path });
    return this.toResponse(stored, file!);
  }

  @Post('favicon')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: imageFileFilter }))
  async uploadFavicon(@UploadedFile() file?: UploadedImage) {
    const stored = await this.store(file, true);
    await this.settingsService.updateSite({ faviconPath: stored.path });
    return this.toResponse(stored, file!);
  }

  @Post('banner')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: imageFileFilter }))
  async uploadBanner(@UploadedFile() file?: UploadedImage, @Body('mobile') _mobile?: string) {
    const stored = await this.store(file, false);
    return this.toResponse(stored, file!);
  }

  private async store(file: UploadedImage | undefined, square: boolean) {
    if (!file) throw new BadRequestException('IMAGE_REQUIRED');
    try {
      return square
        ? await this.storage.storeSquareImage({ buffer: file.buffer, mimeType: file.mimetype, originalName: file.originalname })
        : await this.storage.storeImage({ buffer: file.buffer, mimeType: file.mimetype, originalName: file.originalname });
    } catch (error) {
      throw new BadRequestException(imageUploadErrorCode(error));
    }
  }

  private toResponse(stored: { path: string; variants: string[] }, file: UploadedImage) {
    return {
      path: publicStoragePath(stored.path) ?? '',
      variants: stored.variants.map((path) => publicStoragePath(path) ?? ''),
      altText: file.originalname.replace(/\.[^.]+$/, '').slice(0, 255),
    };
  }
}
