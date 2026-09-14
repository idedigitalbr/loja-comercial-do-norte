import { describe, expect, it, vi } from 'vitest';
import { PublicSiteConfigController } from './settings.controller';

describe('SettingsController', () => {
  it('exposes the sanitized public configuration', async () => {
    const service = { getPublicConfig: vi.fn().mockResolvedValue({ site: {}, banners: [] }) };
    const controller = new PublicSiteConfigController(service as never);

    await expect(controller.publicConfig()).resolves.toEqual({ site: {}, banners: [] });
    expect(service.getPublicConfig).toHaveBeenCalledOnce();
  });
});
