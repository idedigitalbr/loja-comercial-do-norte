import { test as base, expect } from '@playwright/test';
import { isolated, isLoopback } from './environment.mjs';
export const test = base.extend({
  page: async ({ page }, use) => {
    const blockedWrites: string[] = [];
    await page.context().route('**/*', async route => {
      const request = route.request();
      if (!isolated && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
        blockedWrites.push(`${request.method()} ${new URL(request.url()).pathname}`);
        await route.abort(); return;
      }
      if (isolated && !isLoopback(request.url())) { await route.abort(); return; }
      await route.continue();
    });
    await use(page);
    expect(blockedWrites, 'Public smoke must never attempt network writes').toEqual([]);
  },
});
export { expect };
