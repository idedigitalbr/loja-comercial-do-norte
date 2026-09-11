import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { PrivacyService } from './privacy.service';

@Module({ imports: [DatabaseModule, AuthModule], controllers: [CustomersController], providers: [CustomersService, PrivacyService], exports: [CustomersService, PrivacyService] })
export class CustomersModule {}
