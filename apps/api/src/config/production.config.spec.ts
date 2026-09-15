import { describe, expect, it } from 'vitest';
import { assertProductionConfiguration } from './production.config';

const validKey = Buffer.alloc(32, 7).toString('base64');

describe('production configuration', () => {
  it('requires a base64 key that decodes to exactly 32 bytes', () => {
    expect(() => assertProductionConfiguration({
      NODE_ENV: 'production',
      DATABASE_URL: 'mysql://localhost/store',
      COOKIE_SECRET: 'cookie-secret-long',
      CRON_SECRET: 'cron-secret-long',
      APP_ORIGIN: 'https://loja.example.com',
      ADMIN_ORIGIN: 'https://admin.example.com',
      SETTINGS_ENCRYPTION_KEY: validKey,
    })).not.toThrow();

    expect(() => assertProductionConfiguration({
      NODE_ENV: 'production',
      DATABASE_URL: 'mysql://localhost/store',
      COOKIE_SECRET: 'cookie-secret-long',
      CRON_SECRET: 'cron-secret-long',
      APP_ORIGIN: 'https://loja.example.com',
      ADMIN_ORIGIN: 'https://admin.example.com',
      SETTINGS_ENCRYPTION_KEY: 'not-a-32-byte-key',
    })).toThrow('SETTINGS_ENCRYPTION_KEY_INVALID');
  });
});
