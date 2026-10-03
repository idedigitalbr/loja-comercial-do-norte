import { describe, expect, it, vi } from 'vitest';
import { defaultHomeBanners, seedDefaultHomeBanners } from './default-home-banners';

describe('default home banners', () => {
  it('contains the current home hero slides with a complete CTA payload', () => {
    expect(defaultHomeBanners).toHaveLength(15);
    expect(defaultHomeBanners[0]).toEqual(expect.objectContaining({
      desktopPath: 'https://jonaselivaldohair.com.br/wp-content/uploads/2025/11/FOTO-288.jpg',
      title: 'Você linda todos os dias',
      description: 'Agende já e venha se sentir ainda mais linda!',
      ctaLabel: 'ASSISTA NOSSO VÍDEO',
      ctaHref: 'https://www.youtube.com/embed/LHVlCGzfb4I?feature=oembed',
      status: 'ACTIVE',
      sortOrder: 0,
    }));
  });

  it('creates missing slides and is idempotent without overwriting existing records', async () => {
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

    expect(firstRun).toBe(14);
    expect(secondRun).toBe(0);
    expect(prisma.siteBanner.create).toHaveBeenCalledTimes(14);
    expect(prisma.siteBanner.create).not.toHaveBeenCalledWith(expect.objectContaining({ data: existing }));
  });
});
