import dotenv from 'dotenv';
import { resolve } from 'node:path';
import { z } from 'zod';

/**
 * Feature flags de escopo comercial. Desligadas por padrão (fase 1 = catálogo +
 * cotação): só habilitam com o valor exatamente `true`.
 */
const featureFlag = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

export const EnvironmentSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  DATABASE_URL: z.string().min(1),
  APP_ORIGIN: z.string().url().default('http://localhost:3001'),
  ADMIN_ORIGIN: z.string().url().default('http://localhost:5174'),
  COOKIE_SECRET: z.string().min(16),
  CRON_SECRET: z.string().min(16),
  SETTINGS_ENCRYPTION_KEY: z.string().optional(),
  FEATURE_CHECKOUT: featureFlag,
  FEATURE_PAYMENTS: featureFlag,
  FEATURE_TRAININGS: featureFlag,
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export function loadEnvironment(): Environment {
  dotenv.config({ path: resolve(__dirname, '../../../../.env') });
  const environment = EnvironmentSchema.parse(process.env);
  if (process.env.NODE_ENV === 'production' && !environment.SETTINGS_ENCRYPTION_KEY) {
    throw new Error('SETTINGS_ENCRYPTION_KEY_REQUIRED');
  }
  return environment;
}
