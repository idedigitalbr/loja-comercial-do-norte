import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('seed account password configuration', () => {
  it('requires both account passwords before connecting to the database', () => {
    const result = spawnSync(process.execPath, ['--import', 'tsx', resolve(process.cwd(), 'prisma/seed.ts')], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        DATABASE_URL: 'invalid-database-url',
        DEFAULT_ADMIN_PASSWORD: '',
        DEFAULT_CUSTOMER_PASSWORD: '',
      },
    });
    const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(output).toContain('DEFAULT_ADMIN_PASSWORD');
    expect(output).toContain('DEFAULT_CUSTOMER_PASSWORD');
    expect(output).not.toMatch(/PrismaClientInitializationError|P1001|P1013/);
  });
});
