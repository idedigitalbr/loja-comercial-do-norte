import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { LocalFileStorageService } from '../files/local-file-storage.service';
import { AdminCatalogController } from './admin-catalog.controller';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [CatalogController, AdminCatalogController],
  providers: [CatalogService, LocalFileStorageService],
  exports: [CatalogService, LocalFileStorageService],
})
export class CatalogModule {}
