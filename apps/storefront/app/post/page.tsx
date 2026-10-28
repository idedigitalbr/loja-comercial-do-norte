import Link from 'next/link';
import type { Metadata } from 'next';
import { BookOpen, Search } from 'lucide-react';
import { cn } from '@commerce/ui/web';
import { getPostCategories, getPosts } from '@/lib/api';
import { getStorefrontComposition } from '@/lib/storefront/composition-storage';
import {
  VideoArticleCard,
  VideoArticlesCarouselWidget,
} from '@/components/storefront/widgets/video-articles-carousel/video-articles-carousel';
import type { VideoArticleItem } from '@/lib/storefront/widget-types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Explica Aí Nort! — Dicas em vídeos e artigos | Comercial do Norte',
  description:
    'Dicas práticas em vídeos e artigos para empreendedores de food service, confeitarias, pizzarias e distribuidores.',
  alternates: { canonical: '/post' },
};

type SearchParams = Promise<{ q?: string; categoria?: string; pagina?: string }>;

const DEFAULT_BANNER_ITEMS: VideoArticleItem[] = [
  {
    id: 'vid-2',
    tags: ['DELIVERY', 'LINHA KRAFT'],
    title: 'Embalagens kraft para o seu delivery',
    paragraphs: [
      'Mais praticidade com embalagens kraft.',
      'Combine formato e resistência.',
      'Valorize a apresentação do seu delivery.',
    ],
    ctaLabel: 'Ver Completo',
    ctaUrl: '/post/embalagens-kraft-para-o-seu-delivery',
    imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp',
  },
  {
    id: 'vid-3',
    tags: ['AÇAÍ & CAFÉ', 'GUIA PRÁTICO'],
    title: 'Copos e tampas para açaí e café',
    paragraphs: [
      'O copo certo faz a diferença.',
      'Combine a tampa com sua bebida.',
      'Evite vazamentos no transporte.',
    ],
    ctaLabel: 'Ver Completo',
    ctaUrl: '/post/copos-e-tampas-para-acai-e-cafe',
    imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/copos.webp',
  },
  {
    id: 'vid-1',
    tags: ['P/ DELIVERY', 'GUIA PRÁTICO'],
    title: 'Como escolher a caixa de pizza certa',
    paragraphs: [
      'Dicas práticas para proteger melhor o seu delivery.',
      'Escolha o tamanho certo para sua pizza.',
      'Cuide da apresentação até a entrega.',
    ],
    ctaLabel: 'Ver Completo',
    ctaUrl: '/post/caixas-de-pizza-formatos-e-respiros',
    imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/pizza.webp',
  },
  {
    id: 'vid-4',
    tags: ['CONFEITARIA', 'DICAS'],
    title: 'Embalagens para valorizar seus doces',
    paragraphs: [
      'Deixe seus doces em destaque.',
      'Escolha caixas com visor e divisórias.',
      'Proteja cada detalhe na entrega.',
    ],
    ctaLabel: 'Ver Completo',
    ctaUrl: '/post/decoracao-de-doces-e-bolos-com-chantilly',
    imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/doces.webp',
  },
];

function extractParagraphs(excerpt?: string | null): string[] {
  if (!excerpt?.trim()) {
    return [
      'Dicas práticas e soluções para seu negócio.',
      'Combine variedade, economia e qualidade.',
      'Soluções inteligentes na Comercial do Norte.',
    ];
  }
  const sentences = excerpt
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length >= 2) {
    return sentences.slice(0, 3);
  }
  return [
    sentences[0] || excerpt,
    'Confira orientações completas para sua rotina.',
    'Mais qualidade e rendimento no seu negócio.',
  ];
}

export default async function PostsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, categoria, pagina } = await searchParams;
  const page = Math.max(1, Number.parseInt(pagina ?? '1', 10) || 1);

  const [postsRes, categories, composition] = await Promise.all([
    getPosts({ search: q, category: categoria, page, pageSize: 12 }),
    getPostCategories(),
    getStorefrontComposition(),
  ]);

  // Recupera as propriedades da seção Explica Aí Nort da home para reutilização 100% fiel
  const homeVideoWidget = composition.widgets.find((w) => w.type === 'video-articles-carousel');
  const bannerProps = homeVideoWidget?.props ?? {
    title: 'Explica Aí Nort',
    subtitle: 'Dicas em vídeos e artigos para você usar no seu negócio.',
    mascotImageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/S14-Boneco3D-explica-ai-nort-trimmed.webp',
    bgImageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/S14-bg-fundo-vermelho-geometrico-abstrato-hd.png',
    items: DEFAULT_BANNER_ITEMS,
  };

  const bannerItems =
    bannerProps.items && bannerProps.items.length > 0 ? bannerProps.items : DEFAULT_BANNER_ITEMS;

  // Monta a lista de cards da vitrine
  const rawPosts = postsRes.items;
  const hasFilter = Boolean(q?.trim() || categoria);

  const displayPosts: VideoArticleItem[] =
    rawPosts.length > 0
      ? rawPosts.map((post) => ({
          id: post.id,
          title: post.title,
          imageUrl: post.coverUrl || '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp',
          tags:
            post.badges && post.badges.length > 0
              ? post.badges
              : [post.category?.name?.toUpperCase() ?? 'DICAS', 'GUIA PRÁTICO'],
          paragraphs: extractParagraphs(post.excerpt),
          ctaLabel: 'Ver Completo',
          ctaUrl: `/post/${post.slug}`,
        }))
      : !hasFilter
        ? bannerItems
        : [];

  return (
    <div className="w-full bg-[#cfe4ec] min-h-screen pb-16">
      {/* 1. Banner Oficial Explica Aí Nort reutilizado da Home (Modo fullWidth e sem link Ver todos) */}
      <VideoArticlesCarouselWidget
        bgImageUrl={bannerProps.bgImageUrl}
        fullWidth={true}
        items={bannerItems}
        mascotImageUrl={bannerProps.mascotImageUrl}
        showViewAll={false}
        subtitle={bannerProps.subtitle}
        title={bannerProps.title}
      />

      {/* 2. Container da Vitrine de Conteúdos */}
      <div className="cn-container pt-8 sm:pt-10">
        {/* Barra de Busca "O que você quer aprender hoje?" */}
        <form
          action="/post"
          className="relative flex w-full max-w-xl mx-auto items-center rounded-full bg-white p-1 pl-4 shadow-sm border border-slate-200/80 transition-all focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100"
          method="GET"
          role="search"
        >
          <div className="flex items-center pr-2 text-[#cb001c] shrink-0 pointer-events-none">
            <Search className="size-4.5 stroke-[2.2]" />
          </div>
          <input
            className="w-full bg-transparent py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            defaultValue={q ?? ''}
            name="q"
            placeholder="O que você quer aprender hoje?"
            type="search"
          />
          {categoria ? <input name="categoria" type="hidden" value={categoria} /> : null}
          <button
            className="rounded-full bg-[#cb001c] hover:bg-[#a80017] px-6 py-2 text-xs font-bold text-white transition-colors cursor-pointer shrink-0 shadow-xs"
            type="submit"
          >
            Buscar
          </button>
        </form>

        {/* Filtro por Temas / Categorias */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          <span className="text-xs font-bold text-slate-700 mr-1 select-none">Temas:</span>
          <Link
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
              !categoria
                ? 'bg-[#cb001c] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 shadow-2xs'
            )}
            href="/post"
          >
            Todos os conteúdos
          </Link>
          {categories.map((cat) => (
            <Link
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                categoria === cat.slug
                  ? 'bg-[#cb001c] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 shadow-2xs'
              )}
              href={`/post?categoria=${cat.slug}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              key={cat.id}
            >
              {cat.name}
              {cat._count?.posts ? ` (${cat._count.posts})` : ''}
            </Link>
          ))}
        </div>

        {/* 3. Grid de Cards Pixel-Perfect Reutilizando o Mesmo Card da Home */}
        {displayPosts.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
            {displayPosts.map((post) => (
              <VideoArticleCard
                className="w-full shadow-sm hover:shadow-md border border-slate-100/60"
                ctaLabel={post.ctaLabel || 'Ver Completo'}
                ctaUrl={post.ctaUrl}
                id={post.id}
                imageUrl={post.imageUrl}
                key={post.id}
                paragraphs={post.paragraphs}
                tags={post.tags}
                title={post.title}
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl bg-white/80 backdrop-blur-xs p-10 text-center shadow-sm border border-slate-200/80 max-w-md mx-auto">
            <BookOpen className="mx-auto size-10 text-slate-400 stroke-1" />
            <h3 className="mt-3 text-base font-bold text-slate-800">Nenhum conteúdo encontrado</h3>
            <p className="mt-1.5 text-xs text-slate-500">
              {q
                ? `Nenhum artigo encontrado para o termo “${q}”. Tente buscar por outras palavras-chave.`
                : 'Novos artigos e vídeos estão sendo preparados pela nossa equipe.'}
            </p>
            <Link
              className="mt-5 inline-block rounded-full bg-[#cb001c] hover:bg-[#a80017] px-5 py-2 text-xs font-bold text-white transition-colors"
              href="/post"
            >
              Ver todos os conteúdos
            </Link>
          </div>
        )}

        {/* Paginação se houver mais de uma página */}
        {postsRes.totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: postsRes.totalPages }).map((_, i) => {
              const pNum = i + 1;
              const isActive = pNum === page;
              return (
                <Link
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full text-xs font-bold transition-colors shadow-2xs',
                    isActive
                      ? 'bg-[#cb001c] text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  )}
                  href={`/post?pagina=${pNum}${categoria ? `&categoria=${categoria}` : ''}${
                    q ? `&q=${encodeURIComponent(q)}` : ''
                  }`}
                  key={pNum}
                >
                  {pNum}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
