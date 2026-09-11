import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database/database.module';
import { HealthController } from './modules/health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CartsModule } from './modules/carts/carts.module';

@Module({
  imports: [DatabaseModule, AuthModule, CatalogModule, CartsModule],
  controllers: [HealthController],
})
export class AppModule {}
