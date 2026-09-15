import { BadRequestException } from '@nestjs/common';

function isValidSettingsEncryptionKey(value: string): boolean {
  if (!/^[A-Za-z0-9+/_-]+={0,2}$/.test(value)) return false;
  return Buffer.from(value, 'base64').length === 32;
}

export function assertProductionConfiguration(env: NodeJS.ProcessEnv = process.env) {
  const required = ['DATABASE_URL', 'COOKIE_SECRET', 'CRON_SECRET', 'APP_ORIGIN', 'ADMIN_ORIGIN', 'SETTINGS_ENCRYPTION_KEY'];
  const missing = required.filter((key) => !env[key]);
  if (missing.length) throw new BadRequestException(`PRODUCTION_ENV_MISSING:${missing.join(',')}`);
  if (env.NODE_ENV === 'production' && (env.APP_ORIGIN?.includes('localhost') || env.ADMIN_ORIGIN?.includes('localhost'))) throw new BadRequestException('PRODUCTION_ORIGIN_INVALID');
  if (!isValidSettingsEncryptionKey(env.SETTINGS_ENCRYPTION_KEY!)) throw new BadRequestException('SETTINGS_ENCRYPTION_KEY_INVALID');
  return { port: Number(env.PORT ?? 3000), storageRoot: env.STORAGE_ROOT ?? 'storage' };
}
