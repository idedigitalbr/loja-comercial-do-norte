import { Module } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { SettingsCryptoService } from '../crypto/settings-crypto.service';

@Module({ providers: [SettingsCryptoService], exports: [SettingsCryptoService] })
export class SecurityModule {}
