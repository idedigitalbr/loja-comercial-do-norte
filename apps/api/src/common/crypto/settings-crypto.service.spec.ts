import { describe, expect, it } from 'vitest';
import { SettingsCryptoService } from './settings-crypto.service';

describe('SettingsCryptoService', () => {
  const key = Buffer.alloc(32, 7).toString('base64');

  it('round-trips a secret without returning the original payload', () => {
    const service = new SettingsCryptoService(key);
    const payload = service.encrypt('mp-access-token');

    expect(payload).not.toContain('mp-access-token');
    expect(service.decrypt(payload)).toBe('mp-access-token');
  });

  it('rejects a malformed payload', () => {
    const service = new SettingsCryptoService(key);

    expect(() => service.decrypt('not-a-valid-ciphertext')).toThrow('SETTINGS_SECRET_INVALID');
  });
});
