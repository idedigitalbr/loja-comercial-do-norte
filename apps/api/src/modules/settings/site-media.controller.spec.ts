import { describe, expect, it, vi } from 'vitest';
import { SiteMediaController } from './site-media.controller';

describe('SiteMediaController', () => {
  it('stores a banner through the existing image storage service', async () => {
    const storage = {
      storeImage: vi.fn().mockResolvedValue({ path: 'uploads/site/banner/960.webp', variants: [] }),
      storeSquareImage: vi.fn(),
    };
    const settings = { updateSite: vi.fn(), createBanner: vi.fn() };
    const controller = new SiteMediaController(storage as never, settings as never);

    const result = await controller.uploadBanner({ buffer: Buffer.from('jpeg'), mimetype: 'image/jpeg', originalname: 'home.jpg' });

    expect(storage.storeImage).toHaveBeenCalledWith(expect.objectContaining({ originalName: 'home.jpg' }));
    expect(settings.createBanner).not.toHaveBeenCalled();
    expect(result.path).toBe('/storage/uploads/site/banner/960.webp');
  });
});
