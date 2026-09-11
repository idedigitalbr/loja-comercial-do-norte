import { Module } from '@nestjs/common';
import { CatalogModule } from '../modules/catalog/catalog.module';
import { AdminShellController } from './admin-shell.controller';
import { SeoRendererService } from './seo-renderer.service';
import { StorefrontShellController } from './storefront-shell.controller';

@Module({ imports: [CatalogModule], controllers: [StorefrontShellController, AdminShellController], providers: [SeoRendererService] })
export class PublicShellModule {}
