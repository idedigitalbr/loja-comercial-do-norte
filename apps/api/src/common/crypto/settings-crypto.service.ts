import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { Inject, Injectable, Optional } from '@nestjs/common';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function developmentKey(): string {
  return createHash('sha256')
    .update(process.env.COOKIE_SECRET ?? 'development-cookie-secret')
    .digest('base64');
}

@Injectable()
export class SettingsCryptoService {
  private readonly key: Buffer;

  constructor(@Optional() @Inject('SETTINGS_ENCRYPTION_KEY') encodedKey?: string) {
    encodedKey ??= process.env.SETTINGS_ENCRYPTION_KEY ?? developmentKey();
    const decoded = Buffer.from(encodedKey, 'base64');
    if (decoded.length !== 32) throw new Error('SETTINGS_ENCRYPTION_KEY_INVALID');
    this.key = decoded;
  }

  encrypt(value: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [iv, tag, encrypted].map((part) => part.toString('base64url')).join('.');
  }

  decrypt(payload: string): string {
    try {
      const parts = payload.split('.').map((part) => Buffer.from(part, 'base64url'));
      if (parts.length !== 3 || parts[0].length !== IV_LENGTH || parts[1].length !== TAG_LENGTH) {
        throw new Error('invalid payload');
      }
      const decipher = createDecipheriv(ALGORITHM, this.key, parts[0]);
      decipher.setAuthTag(parts[1]);
      return Buffer.concat([decipher.update(parts[2]), decipher.final()]).toString('utf8');
    } catch {
      throw new Error('SETTINGS_SECRET_INVALID');
    }
  }
}
