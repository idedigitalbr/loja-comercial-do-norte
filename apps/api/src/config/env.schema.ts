import dotenv from 'dotenv';
import { resolve } from 'node:path';
import { z } from 'zod';

export const EnvironmentSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  DATABASE_URL: z.string().min(1),
  APP_ORIGIN: z.string().url().default('http://localhost:5173'),
  ADMIN_ORIGIN: z.string().url().default('http://localhost:5174'),
  COOKIE_SECRET: z.string().min(16),
  CRON_SECRET: z.string().min(16),
  SETTINGS_ENCRYPTION_KEY: z.string().optional(),
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
