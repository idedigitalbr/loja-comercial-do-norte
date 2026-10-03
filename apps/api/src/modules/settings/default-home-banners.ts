export type DefaultHomeBanner = {
  desktopPath: string;
  mobilePath: string | null;
  eyebrow: string | null;
  title: string | null;
  description: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
  status: 'ACTIVE';
};

const currentHomeHeroImages = [
  'https://jonaselivaldohair.com.br/wp-content/uploads/2025/11/FOTO-288.jpg',
  'https://jonaselivaldohair.com.br/wp-content/uploads/2025/04/JE-6-scaled.jpg',
  'https://jonaselivaldohair.com.br/wp-content/uploads/2025/04/JE-8-scaled.jpg',
  'https://jonaselivaldohair.com.br/wp-content/uploads/2025/04/JE-4-scaled.jpg',
  'https://jonaselivaldohair.com.br/wp-content/uploads/2025/04/JE-7-scaled.jpg',
  'https://jonaselivaldohair.com.br/wp-content/uploads/2025/04/JE-5-1-scaled.jpg',
  'https://jonaselivaldohair.com.br/wp-content/uploads/2025/11/FOTO-365.jpg',
  'https://jonaselivaldohair.com.br/wp-content/uploads/2025/04/JE-9-1-scaled.jpg',
  'https://jonaselivaldohair.com.br/wp-content/uploads/2025/04/JE-2-1-scaled.jpg',
  'https://jonaselivaldohair.com.br/wp-content/uploads/2025/04/JE-3-scaled.jpg',
  'https://jonaselivaldohair.com.br/wp-content/uploads/2025/04/JE-1-scaled.jpg',
  'https://jonaselivaldohair.com.br/wp-content/uploads/2025/04/produt-3-scaled.jpg',
  'https://jonaselivaldohair.com.br/wp-content/uploads/2025/04/produt-4-scaled.jpg',
  'https://jonaselivaldohair.com.br/wp-content/uploads/2025/04/produt-5-scaled.jpg',
  'https://jonaselivaldohair.com.br/wp-content/uploads/2025/11/FOTO-305.jpg',
] as const;

export const defaultHomeBanners: readonly DefaultHomeBanner[] = currentHomeHeroImages.map((desktopPath, sortOrder) => ({
  desktopPath,
  mobilePath: null,
  eyebrow: null,
  title: 'Você linda todos os dias',
  description: 'Agende já e venha se sentir ainda mais linda!',
  ctaLabel: 'ASSISTA NOSSO VÍDEO',
  ctaHref: 'https://www.youtube.com/embed/LHVlCGzfb4I?feature=oembed',
  sortOrder,
  status: 'ACTIVE' as const,
}));

type BannerSeedClient = {
  siteBanner: {
    findFirst(args: { where: { desktopPath: string } }): Promise<unknown>;
    create(args: { data: DefaultHomeBanner }): Promise<unknown>;
  };
};

/** Adds the current Home slides once, preserving banners configured by an administrator. */
export async function seedDefaultHomeBanners(prisma: BannerSeedClient): Promise<number> {
  let created = 0;

  for (const banner of defaultHomeBanners) {
    const existing = await prisma.siteBanner.findFirst({ where: { desktopPath: banner.desktopPath } });
    if (existing) continue;
    await prisma.siteBanner.create({ data: banner });
    created += 1;
  }

  return created;
}
