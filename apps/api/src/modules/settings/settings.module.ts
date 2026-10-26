import { Module } from '@nestjs/common';
import { SecurityModule } from '../../common/security/security.module';
import { AuthModule } from '../auth/auth.module';
import { CatalogModule } from '../catalog/catalog.module';
import { DatabaseModule } from '../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PublicSiteConfigController, SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SiteMediaController } from './site-media.controller';
import { MERCADO_PAGO_FETCH, PaymentSettingsService, type MercadoPagoFetcher } from './payment-settings.service';
import { NotificationsController } from '../notifications/notifications.controller';
import { StorefrontCompositionController, PublicStorefrontCompositionController } from './storefront-composition.controller';
import { StorefrontCompositionService } from './storefront-composition.service';

const mercadoPagoFetch: MercadoPagoFetcher = (url, init) => fetch(url, init);

@Module({
  imports: [DatabaseModule, AuthModule, SecurityModule, CatalogModule, NotificationsModule],
  controllers: [SettingsController, PublicSiteConfigController, SiteMediaController, NotificationsController, StorefrontCompositionController, PublicStorefrontCompositionController],
  providers: [
    SettingsService,
    StorefrontCompositionService,
    PaymentSettingsService,
    { provide: MERCADO_PAGO_FETCH, useValue: mercadoPagoFetch },
  ],
  exports: [SettingsService, PaymentSettingsService, MERCADO_PAGO_FETCH],
})
export class SettingsModule {}
