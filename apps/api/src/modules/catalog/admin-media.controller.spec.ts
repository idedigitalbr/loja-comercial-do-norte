import { describe, expect, it, vi } from 'vitest';
import { AdminMediaController } from './admin-media.controller';

describe('AdminMediaController', () => {
  it('returns generated media paths after an image upload', async () => {
    const storage = {
      storeImage: vi.fn().mockResolvedValue({
        path: 'uploads/media-1/960.webp',
        variants: ['uploads/media-1/480.webp', 'uploads/media-1/960.webp'],
      }),
    };
    const controller = new AdminMediaController(storage as never);

    const result = await controller.upload({
      buffer: Buffer.from('image'),
      mimetype: 'image/png',
      originalname: 'produto.png',
    }, 'Frente do produto');

    expect(result).toEqual({
      path: '/storage/uploads/media-1/960.webp',
      variants: ['/storage/uploads/media-1/480.webp', '/storage/uploads/media-1/960.webp'],
      altText: 'Frente do produto',
    });
  });

  it('uses square media processing for brand images', async () => {
    const storage = {
      storeSquareImage: vi.fn().mockResolvedValue({
        path: 'uploads/brand-1/960.webp',
        variants: ['uploads/brand-1/480.webp', 'uploads/brand-1/960.webp'],
      }),
    };
    const controller = new AdminMediaController(storage as never);

    const result = await controller.uploadBrandImage({
      buffer: Buffer.from('image'),
      mimetype: 'image/png',
      originalname: 'grandha.png',
    });

    expect(storage.storeSquareImage).toHaveBeenCalledWith(expect.objectContaining({ originalName: 'grandha.png' }));
    expect(result.path).toBe('/storage/uploads/brand-1/960.webp');
  });
});
