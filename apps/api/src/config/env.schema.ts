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
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export function loadEnvironment(): Environment {
  dotenv.config({ path: resolve(__dirname, '../../../../.env') });
  return EnvironmentSchema.parse(process.env);
}
