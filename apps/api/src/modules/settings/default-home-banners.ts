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

/**
 * Banners de demonstração da home da Comercial do Norte.
 *
 * Regras (docs/memory-ai.md §3, roadmap E5):
 * - nenhuma mídia externa/hotlink: os caminhos apontam para a storage local;
 * - copy explicitamente demonstrativa, sem marca, preço ou depoimento real;
 * - as imagens são geradas localmente pelo seed (`prisma/seed-catalog.ts`).
 */
export const defaultHomeBanners: readonly DefaultHomeBanner[] = [
  {
    desktopPath: 'uploads/seed-banner-ofertas/1440.webp',
    mobilePath: 'uploads/seed-banner-ofertas/960.webp',
    eyebrow: 'Ofertas da semana (demonstração)',
    title: 'Preço de atacado para o seu negócio',
    description: 'Embalagens, descartáveis e utilidades para pizzarias, lanchonetes, padarias e revendas.',
    ctaLabel: 'Ver ofertas',
    ctaHref: '/ofertas',
    sortOrder: 0,
    status: 'ACTIVE',
  },
  {
    desktopPath: 'uploads/seed-banner-cotacao/1440.webp',
    mobilePath: 'uploads/seed-banner-cotacao/960.webp',
    eyebrow: 'Cotação rápida (demonstração)',
    title: 'Monte sua lista e receba a cotação',
    description: 'Adicione produtos, envie seus dados e a equipe comercial responde com a proposta.',
    ctaLabel: 'Como funciona',
    ctaHref: '/cotacao',
    sortOrder: 1,
    status: 'ACTIVE',
  },
  {
    desktopPath: 'uploads/seed-banner-festa/1440.webp',
    mobilePath: 'uploads/seed-banner-festa/960.webp',
    eyebrow: 'Tudo em um só lugar (demonstração)',
    title: 'Sua festa completa em um só pedido',
    description: 'Artigos para festa, doces e descartáveis reunidos na mesma cotação.',
    ctaLabel: 'Explorar catálogo',
    ctaHref: '/loja',
    sortOrder: 2,
    status: 'ACTIVE',
  },
] as const;

type BannerSeedClient = {
  siteBanner: {
    findFirst(args: { where: { desktopPath: string } }): Promise<unknown>;
    create(args: { data: DefaultHomeBanner }): Promise<unknown>;
  };
};

/** Cria os banners de demonstração ausentes, preservando os configurados pelo admin. */
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
