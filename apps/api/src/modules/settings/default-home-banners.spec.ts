import { describe, expect, it, vi } from 'vitest';
import { defaultHomeBanners, seedDefaultHomeBanners } from './default-home-banners';

describe('default home banners', () => {
  it('aponta apenas para a storage local, sem hotlink externo', () => {
    expect(defaultHomeBanners).toHaveLength(3);
    for (const banner of defaultHomeBanners) {
      expect(banner.desktopPath).toMatch(/^uploads\/seed-banner-[a-z-]+\/\d+\.webp$/);
      expect(banner.mobilePath).toMatch(/^uploads\/seed-banner-[a-z-]+\/\d+\.webp$/);
      expect(banner.title).toBeTruthy();
      expect(banner.ctaHref?.startsWith('/')).toBe(true);
      expect(JSON.stringify(banner)).not.toMatch(/jonas|elivaldo/i);
    }
  });

  it('cria os banners ausentes e é idempotente sem sobrescrever os existentes', async () => {
    const existing = { id: 'existing', desktopPath: defaultHomeBanners[0].desktopPath };
    const created = new Map<string, { id: string; desktopPath: string }>();
    const prisma = {
      siteBanner: {
        findFirst: vi.fn(async ({ where }: { where: { desktopPath: string } }) => where.desktopPath === existing.desktopPath ? existing : created.get(where.desktopPath) ?? null),
        create: vi.fn(async ({ data }: { data: typeof defaultHomeBanners[number] }) => {
          const record = { id: `created-${data.sortOrder}`, desktopPath: data.desktopPath };
          created.set(data.desktopPath, record);
          return { ...record, ...data };
        }),
      },
    };

    const firstRun = await seedDefaultHomeBanners(prisma as never);
    const secondRun = await seedDefaultHomeBanners(prisma as never);

    expect(firstRun).toBe(2);
    expect(secondRun).toBe(0);
    expect(prisma.siteBanner.create).toHaveBeenCalledTimes(2);
    expect(prisma.siteBanner.create).not.toHaveBeenCalledWith(expect.objectContaining({ data: existing }));
  });
});
