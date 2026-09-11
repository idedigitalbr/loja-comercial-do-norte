import { BadRequestException } from '@nestjs/common';

export function assertProductionConfiguration(env: NodeJS.ProcessEnv = process.env) {
  const required = ['DATABASE_URL', 'COOKIE_SECRET', 'CRON_SECRET', 'APP_ORIGIN', 'ADMIN_ORIGIN'];
  const missing = required.filter((key) => !env[key]);
  if (missing.length) throw new BadRequestException(`PRODUCTION_ENV_MISSING:${missing.join(',')}`);
  if (env.NODE_ENV === 'production' && (env.APP_ORIGIN?.includes('localhost') || env.ADMIN_ORIGIN?.includes('localhost'))) throw new BadRequestException('PRODUCTION_ORIGIN_INVALID');
  return { port: Number(env.PORT ?? 3000), storageRoot: env.STORAGE_ROOT ?? 'storage' };
}
