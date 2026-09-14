import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database/database.module';
import { HealthController } from './modules/health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CartsModule } from './modules/carts/carts.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { TrainingsModule } from './modules/trainings/trainings.module';
import { AuditModule } from './modules/audit/audit.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ReportsModule } from './modules/reports/reports.module';
import { PublicShellModule } from './public-shell/public-shell.module';
import { SecurityModule } from './common/security/security.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [DatabaseModule, AuthModule, CatalogModule, CartsModule, InventoryModule, ShippingModule, OrdersModule, PaymentsModule, JobsModule, CheckoutModule, TrainingsModule, AuditModule, CustomersModule, ReportsModule, PromotionsModule, SettingsModule, PublicShellModule, SecurityModule],
  controllers: [HealthController],
})
export class AppModule {}
