'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Star,
  X,
  Volume2,
  Maximize2,
  Check,
} from 'lucide-react';
import { VideoArticleCard } from '@/components/storefront/widgets/video-articles-carousel/video-article-card';
import { useQuoteCart } from '@/components/quote-cart-provider';

export type ProductCarouselItem = {
  id: string;
  variantId: string;
  title: string;
  subtitle: string;
  price: string;
  priceCents: number;
  imageUrl: string;
  ratingText: string;
  slug: string;
};

export type ExplicaAiSinglePostProps = {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    content: string;
    coverUrl?: string | null;
    videoUrl?: string | null;
    videoDuration?: string | null;
    authorName?: string | null;
    badges: string[];
    publishedAt: string;
    views: number;
    conceptTag?: string;
    category?: { id: string; name: string; slug: string } | null;
  };
};

const PIZZARIA_PRODUCTS: ProductCarouselItem[] = [
  {
    id: 'prod-1',
    variantId: 'var-pizza-oitavada',
    title: 'Caixa de pizza oitavada',
    subtitle: 'Diversos tamanhos',
    price: 'R$ 7,49',
    priceCents: 749,
    imageUrl: '/assets/explica-ai/prod-1-clean.png',
    ratingText: '4.7 (129)',
    slug: 'caixa-pizza-oitavada',
  },
  {
    id: 'prod-2',
    variantId: 'var-pizza-quadrada',
    title: 'Caixa de pizza quadrada',
    subtitle: 'Diversos tamanhos',
    price: 'R$ 24,90',
    priceCents: 2490,
    imageUrl: '/assets/explica-ai/prod-2-clean.png',
    ratingText: '4.7 (129)',
    slug: 'caixa-pizza-quadrada',
  },
  {
    id: 'prod-3',
    variantId: 'var-pizza-respiros',
    title: 'Caixa com respiros laterais',
    subtitle: 'Mantém a crocância',
    price: 'R$ 7,30',
    priceCents: 730,
    imageUrl: '/assets/explica-ai/prod-3-clean.png',
    ratingText: '4.7 (129)',
    slug: 'caixa-com-respiros-laterais',
  },
  {
    id: 'prod-4',
    variantId: 'var-lacre-seguranca',
    title: 'Lacre de segurança',
    subtitle: 'Mais confiança na entrega',
    price: 'R$ 4,20',
    priceCents: 420,
    imageUrl: '/assets/explica-ai/prod-4-clean.png',
    ratingText: '4.7 (129)',
    slug: 'lacre-de-seguranca',
  },
  {
    id: 'prod-5',
    variantId: 'var-papel-forno-pizza',
    title: 'Papel para forno de pizza',
    subtitle: 'Diversos tamanhos',
    price: 'R$ 15,90',
    priceCents: 1590,
    imageUrl: '/assets/explica-ai/prod-5-papel-forno.png',
    ratingText: '4.7 (129)',
    slug: 'papel-para-forno-de-pizza',
  },
];

const RELATED_VIDEO_ARTICLES = [
  {
    id: 'vid-kraft',
    title: 'Embalagens kraft para o seu delivery',
    tags: ['DELIVERY', 'LINHA KRAFT'],
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
    id: 'vid-copos',
    title: 'Copos e tampas para açaí e café',
    tags: ['AÇAÍ & CAFÉ', 'GUIA PRÁTICO'],
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
    id: 'vid-doces',
    title: 'Embalagens kraft para o seu delivery',
    tags: ['DELIVERY', 'LINHA KRAFT'],
    paragraphs: [
      'Mais praticidade com embalagens kraft.',
      'Combine formato e resistência.',
      'Valorize a apresentação do seu delivery.',
    ],
    ctaLabel: 'Ver Completo',
    ctaUrl: '/post/embalagens-kraft-para-o-seu-delivery',
    imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp',
  },
];

export function ExplicaAiSinglePost({ post }: ExplicaAiSinglePostProps) {
  const [activeVideoModal, setActiveVideoModal] = useState(false);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const { add } = useQuoteCart();

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedViews =
    post.views > 1000
      ? `${(post.views / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`
      : '12,5 mil';

  const categoryName = post.category?.name || 'Embalagens & Delivery';
  const categorySlug = post.category?.slug || 'embalagens-delivery';

  const handleOpenVideo = () => {
    setActiveVideoModal(true);
  };

  const handleScrollCarousel = (direction: number) => {
    if (!carouselTrackRef.current) return;
    const scrollAmount = 240 * direction;
    carouselTrackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleAddToCart = (item: ProductCarouselItem) => {
    add({
      variantId: item.variantId,
      productSlug: item.slug,
      name: item.title,
      sku: item.id,
      imagePath: item.imageUrl,
      unitPriceCents: item.priceCents,
      quantity: 1,
    });

    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 1800);
  };

  return (
    <div className="w-full bg-[#f8fafc] pb-16">
      <div className="cn-container pt-4 sm:pt-6">
        {/* 1. Breadcrumb Pixel-Perfect */}
        <nav
          aria-label="Você está aqui"
          className="text-[11px] sm:text-xs text-slate-500 mb-4 sm:mb-6 font-normal flex flex-wrap items-center gap-1.5"
        >
          <Link className="hover:text-[#CB001C] transition-colors" href="/">
            Início
          </Link>
          <span className="text-slate-400" aria-hidden>
            /
          </span>
          <Link className="hover:text-[#CB001C] transition-colors font-medium text-slate-600" href="/post">
            Explica Aí Nort!
          </Link>
          <span className="text-slate-400" aria-hidden>
            /
          </span>
          <Link
            className="hover:text-[#CB001C] transition-colors font-medium text-slate-600"
            href={`/post?categoria=${categorySlug}`}
          >
            {categoryName}
          </Link>
          <span className="text-slate-400" aria-hidden>
            /
          </span>
          <span className="font-semibold text-slate-800 line-clamp-1">{post.title}</span>
        </nav>

        {/* 2. Hero Banner: Explica Aí Nort (Red Card Oficial) */}
        <section
          aria-label="Destaque em Vídeo"
          className="relative overflow-hidden rounded-[26px] sm:rounded-[34px] bg-gradient-to-br from-[#d3121e] via-[#c40817] to-[#aa0010] p-6 sm:p-8 md:p-10 lg:p-12 text-white shadow-xl"
        >
          {/* Fundo com curvas abstratas oficiais */}
          <div className="absolute inset-0 pointer-events-none select-none opacity-40 mix-blend-overlay">
            <Image
              src="/assets/HOME Vitrine/S14-POSTS-ExplicaAi/S14-bg-fundo-vermelho-geometrico-abstrato-hd.png"
              alt=""
              fill
              priority
              className="object-cover object-center"
            />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            {/* Coluna Esquerda: Badge, Título, Descrição e Metadados (lg:col-span-6) */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              {/* Badge Oficial */}
              <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                <span className="inline-flex items-center rounded-full bg-white px-3.5 py-1 text-[11px] sm:text-xs font-black text-[#CB001C] tracking-wide uppercase shadow-sm">
                  EXPLICA AÍ NORT!
                </span>
              </div>

              {/* Título Principal */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black leading-[1.08] tracking-tight text-white">
                {post.title}
              </h1>

              {/* Subtítulo / Descrição */}
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-[15px] leading-relaxed text-white/95 max-w-xl font-normal">
                {post.excerpt ||
                  'Tudo sobre caixas oitavadas e quadradas, respiros térmicos e lacres invioláveis para sua pizzaria. Dicas práticas para manter a qualidade da pizza do forno até o cliente.'}
              </p>

              {/* Metadados: visualizações, data e duração */}
              <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-[13px] font-medium text-white/90">
                <div className="flex items-center gap-1.5">
                  <span className="flex size-4.5 items-center justify-center rounded-full border border-white/60 bg-white/15">
                    <Play className="size-2.5 fill-white ml-0.5" />
                  </span>
                  <span>{formattedViews} visualizações</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4 opacity-90" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="size-4 opacity-90" />
                  <span>{post.videoDuration || '5 min'}</span>
                </div>
              </div>
            </div>

            {/* Coluna Central: Smartphone Mockup com Vídeo (lg:col-span-3) */}
            <div className="lg:col-span-3 flex justify-center">
              <div className="relative w-[190px] sm:w-[210px] md:w-[225px] aspect-[9/18.2] rounded-[38px] md:rounded-[44px] bg-[#0c0c0e] p-2 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border-2 border-zinc-700/60 select-none shrink-0 group">
                {/* Dynamic Island no topo do iPhone */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 md:w-20 h-4.5 bg-black rounded-full z-30 flex items-center justify-end pr-2 pointer-events-none">
                  <div className="size-2 rounded-full bg-zinc-900 border border-zinc-800" />
                </div>

                {/* Status Bar */}
                <div className="absolute top-2.5 inset-x-5 flex items-center justify-between z-20 text-[9px] font-semibold text-white pointer-events-none">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="flex gap-0.5 items-end h-2">
                      <div className="w-0.5 h-1 bg-white rounded-xs" />
                      <div className="w-0.5 h-1.5 bg-white rounded-xs" />
                      <div className="w-0.5 h-2 bg-white rounded-xs" />
                    </div>
                    <div className="w-3.5 h-2 rounded-xs border border-white flex items-center p-0.5">
                      <div className="w-full h-full bg-white rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* Tela do Vídeo */}
                <div className="relative w-full h-full rounded-[30px] md:rounded-[36px] overflow-hidden bg-zinc-950">
                  <Image
                    src="/assets/explica-ai/video-screen-girl.png"
                    alt="Vídeo explicativo na prática"
                    fill
                    priority
                    sizes="250px"
                    className="object-cover"
                  />

                  {/* Gradiente escuro para legibilidade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

                  {/* Botão de Play Central Gigante Vermelho */}
                  <button
                    onClick={handleOpenVideo}
                    aria-label="Assistir ao vídeo agora"
                    className="absolute inset-0 m-auto size-13 md:size-15 rounded-full bg-[#E30613] hover:bg-[#c40510] text-white flex items-center justify-center shadow-[0_10px_25px_rgba(227,6,19,0.6)] hover:scale-110 active:scale-95 transition-all cursor-pointer z-20"
                  >
                    <Play className="size-6 md:size-7 fill-white ml-1" />
                  </button>

                  {/* Barra de Controle Inferior do Vídeo */}
                  <div className="absolute bottom-2.5 inset-x-3 z-20 flex flex-col gap-1.5 pointer-events-none">
                    <div className="h-0.5 w-full bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-[#E30613]" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-white/90">
                      <span>0:00 / 2:18</span>
                      <div className="flex items-center gap-1.5">
                        <Volume2 className="size-3 text-white" />
                        <Maximize2 className="size-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Callout com Seta Curva e Mascote Nort 3D (lg:col-span-3) */}
            <div className="lg:col-span-3 relative flex flex-col items-center lg:items-start justify-end h-full pt-4 lg:pt-0">
              {/* Callout Texto + Seta Curva Apontando para o Telefone */}
              <div className="flex items-center gap-2 mb-2 lg:mb-4 lg:-ml-6 z-20">
                <svg
                  width="44"
                  height="32"
                  viewBox="0 0 44 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white shrink-0 -scale-y-100 rotate-12"
                >
                  <path
                    d="M38 28 C 36 6, 16 3, 5 15"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 8 L 4 15 L 12 21"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <div className="text-sm sm:text-base md:text-lg font-bold leading-tight text-white tracking-tight">
                  <p>Assista</p>
                  <p>ao vídeo</p>
                  <p>e veja as dicas</p>
                  <p>na prática!</p>
                </div>
              </div>

              {/* Mascote Nort 3D Oficial Apontando para o Telefone */}
              <div className="relative w-[180px] sm:w-[210px] md:w-[240px] h-[155px] sm:h-[180px] md:h-[200px] shrink-0 pointer-events-none select-none z-10">
                <Image
                  src="/assets/HOME Vitrine/S14-POSTS-ExplicaAi/S14-Boneco3D-explica-ai-nort-trimmed.webp"
                  alt="Mascote Nort apontando para o smartphone"
                  fill
                  priority
                  sizes="(max-width: 768px) 210px, 240px"
                  className="object-contain object-bottom drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Seção: Descrição do post e Principais pontos (Card Branco Central) */}
        <article className="mt-8 sm:mt-10 rounded-3xl bg-white p-6 sm:p-10 md:p-12 shadow-sm border border-slate-100 max-w-5xl mx-auto">
          {/* Título Centralizado "Descrição do post" */}
          <h2 className="text-center text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Descrição do post
          </h2>

          {/* Parágrafos Explicativos */}
          <div className="mt-5 max-w-3xl mx-auto space-y-4 text-slate-700 text-sm sm:text-[15.5px] leading-relaxed text-justify sm:text-left font-normal">
            <p>
              A embalagem certa faz toda a diferença para manter a qualidade da pizza até o cliente.
              Escolher o formato ideal, utilizar os respiros adequados e reforçar o fechamento com lacres
              invioláveis ajuda a preservar o sabor, evitar que a massa fique borrachuda e garante uma
              entrega mais segura.
            </p>
            <p>
              Neste conteúdo, você vai entender quais são os principais formatos de caixas de pizza, como
              funcionam os respiros térmicos e quais cuidados adotar para manter a pizza sempre no ponto,
              desde o forno até o cliente.
            </p>
          </div>

          {/* Imagem Central: Foto da Pizza com Caixas Empilhadas */}
          <div className="my-8 relative aspect-[21/9] sm:aspect-[24/9] w-full max-w-3xl mx-auto overflow-hidden rounded-2xl border border-slate-100 shadow-md">
            <Image
              src="/assets/explica-ai/pizza-boxes-article.png"
              alt="Pizza no forno com caixas de entrega ao lado"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover object-center"
            />
          </div>

          {/* Seção "Principais pontos do vídeo" */}
          <div className="max-w-3xl mx-auto">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-4">
              Principais pontos do vídeo
            </h3>

            {/* Container dos 4 Pontos com Círculos Vermelhos */}
            <div className="rounded-2xl bg-[#f8fafc] border border-slate-200/80 p-4 sm:p-6 flex flex-col gap-3.5">
              <div className="flex items-center gap-3">
                <span className="flex size-7 sm:size-8 items-center justify-center rounded-full bg-[#E30613] text-white font-bold text-xs sm:text-sm shrink-0 shadow-xs">
                  1
                </span>
                <span className="text-xs sm:text-sm md:text-[14.5px] font-semibold text-slate-800">
                  Formatos: diferenças entre caixa oitavada e quadrada.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex size-7 sm:size-8 items-center justify-center rounded-full bg-[#E30613] text-white font-bold text-xs sm:text-sm shrink-0 shadow-xs">
                  2
                </span>
                <span className="text-xs sm:text-sm md:text-[14.5px] font-semibold text-slate-800">
                  Respiros: como a ventilação evita que a massa fique borrachuda.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex size-7 sm:size-8 items-center justify-center rounded-full bg-[#E30613] text-white font-bold text-xs sm:text-sm shrink-0 shadow-xs">
                  3
                </span>
                <span className="text-xs sm:text-sm md:text-[14.5px] font-semibold text-slate-800">
                  Lacres de segurança: mais confiança na entrega.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex size-7 sm:size-8 items-center justify-center rounded-full bg-[#E30613] text-white font-bold text-xs sm:text-sm shrink-0 shadow-xs">
                  4
                </span>
                <span className="text-xs sm:text-sm md:text-[14.5px] font-semibold text-slate-800">
                  Dicas práticas de uso e armazenamento.
                </span>
              </div>
            </div>
          </div>
        </article>

        {/* 4. Banner Comercial CTA & Carrossel de Produtos Relacionados (Blue Banner Oficial) */}
        <section
          aria-label="Produtos Relacionados para Pizzaria"
          className="mt-10 sm:mt-12 relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#011838] p-5 sm:p-7 md:p-9 text-white shadow-xl"
        >
          {/* Header do Banner */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Texto Promocional */}
            <div className="md:col-span-6 z-10">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FBBF24]">
                PRODUTOS RELACIONADOS
              </span>
              <h2 className="mt-1 text-xl sm:text-2xl md:text-3xl font-black leading-tight text-white">
                Tudo para a sua pizzaria
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-md font-normal leading-relaxed">
                Caixas de pizza, lacres, forminhas e muito mais com entrega rápida em Belém e Região Metropolitana.
              </p>
            </div>

            {/* Imagem das caixas de pizza empilhadas */}
            <div className="hidden md:flex md:col-span-3 justify-center z-10">
              <div className="relative w-44 h-24">
                <Image
                  src="/assets/explica-ai/cta-pizza-stack-clean.png"
                  alt="Caixas de pizza empilhadas"
                  fill
                  sizes="200px"
                  className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                />
              </div>
            </div>

            {/* Botão Ver todos os produtos */}
            <div className="md:col-span-3 flex md:justify-end z-10">
              <Link
                href="/loja"
                className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-1.5 rounded-full bg-[#E30613] hover:bg-[#c40510] px-5 py-2.5 text-xs sm:text-[13px] font-bold text-white shadow-lg transition active:scale-95 whitespace-nowrap"
              >
                <span>Ver todos os produtos</span>
                <ChevronRight className="size-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>

          {/* Carrossel de Produtos 1:1 dentro do Card Azul */}
          <div className="relative mt-6 z-10">
            {/* Botão Esquerdo do Carrossel */}
            <button
              onClick={() => handleScrollCarousel(-1)}
              aria-label="Ver produtos anteriores"
              className="absolute -left-2.5 sm:-left-3.5 top-1/2 -translate-y-1/2 size-8 sm:size-9 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#CB001C] z-30 transition cursor-pointer"
            >
              <ChevronLeft className="size-4.5 stroke-[2.5]" />
            </button>

            {/* Track de Produtos */}
            <div
              ref={carouselTrackRef}
              className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth px-1 py-1"
            >
              {PIZZARIA_PRODUCTS.map((item) => {
                const isAdded = Boolean(addedItems[item.id]);
                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-2xl bg-white p-3.5 shadow-sm border border-slate-100 shrink-0 w-[170px] sm:w-[190px] md:w-[210px] text-slate-800 transition-all hover:shadow-md"
                  >
                    {/* Imagem do Produto */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center p-1.5">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="180px"
                        className="object-contain p-1"
                      />
                    </div>

                    {/* Textos: Título e Subtítulo */}
                    <div className="mt-2.5">
                      <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[10.5px] text-slate-500 font-normal mt-0.5 line-clamp-1">
                        {item.subtitle}
                      </p>

                      {/* 5 Estrelas + Avaliação 4.7 (129) */}
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-600">
                        <div className="flex items-center text-amber-400">
                          {[0, 1, 2, 3, 4].map((s) => (
                            <Star key={s} className="size-2.5 sm:size-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="font-semibold">{item.ratingText}</span>
                      </div>

                      {/* Preço em Destaque */}
                      <div className="mt-1.5">
                        <strong className="text-base sm:text-lg font-black text-slate-950">
                          {item.price}
                        </strong>
                      </div>
                    </div>

                    {/* Botão Adicionar à Cotação */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      type="button"
                      className={`mt-3 inline-flex items-center justify-center gap-1 w-full rounded-full border py-1.5 px-2 text-[11px] font-bold transition cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-rose-300 text-[#CB001C] hover:bg-rose-50 hover:border-rose-400'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="size-3.5 stroke-[2.5]" />
                          <span>Adicionado!</span>
                        </>
                      ) : (
                        <span>Adicionar à Cotação</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Botão Direito do Carrossel */}
            <button
              onClick={() => handleScrollCarousel(1)}
              aria-label="Ver próximos produtos"
              className="absolute -right-2.5 sm:-right-3.5 top-1/2 -translate-y-1/2 size-8 sm:size-9 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#CB001C] z-30 transition cursor-pointer"
            >
              <ChevronRight className="size-4.5 stroke-[2.5]" />
            </button>
          </div>
        </section>

        {/* 5. Seção: Outras dicas que podem te ajudar (Componentes VideoArticleCard oficiais de /posts) */}
        <section aria-labelledby="outras-dicas-heading" className="mt-12 sm:mt-14">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-red-100 text-[#CB001C] shrink-0">
                <Play className="size-4 fill-[#CB001C] text-[#CB001C]" />
              </div>
              <div>
                <h2 id="outras-dicas-heading" className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Outras dicas que podem te ajudar
                </h2>
                <p className="text-xs text-slate-500 font-normal">
                  Mais conteúdos em vídeo para o seu negócio.
                </p>
              </div>
            </div>

            <Link
              href="/post"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#CB001C] hover:underline"
            >
              <span>Ver todos os conteúdos</span>
              <ChevronRight className="size-3.5 stroke-[2.5]" />
            </Link>
          </div>

          {/* Grid com VideoArticleCard oficial de /posts */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {RELATED_VIDEO_ARTICLES.map((vid, idx) => (
              <VideoArticleCard
                key={`${vid.id}-${idx}`}
                title={vid.title}
                tags={vid.tags}
                paragraphs={vid.paragraphs}
                ctaLabel={vid.ctaLabel}
                ctaUrl={vid.ctaUrl}
                imageUrl={vid.imageUrl}
              />
            ))}
          </div>
        </section>
      </div>

      {/* 6. Modal de Vídeo Interativo */}
      {activeVideoModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setActiveVideoModal(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl border border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal com Botão Fechar */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-900 border-b border-zinc-800 text-white">
              <span className="text-xs sm:text-sm font-bold line-clamp-1">{post.title}</span>
              <button
                onClick={() => setActiveVideoModal(false)}
                className="flex size-7 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
                aria-label="Fechar vídeo"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Player de Vídeo Responsivo */}
            <div className="relative aspect-[16/9] w-full bg-black flex items-center justify-center">
              {post.videoUrl && post.videoUrl.includes('youtube') ? (
                <iframe
                  className="size-full"
                  src={`${post.videoUrl}${post.videoUrl.includes('?') ? '&' : '?'}autoplay=1`}
                  title={post.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 text-white">
                  <div className="size-16 rounded-full bg-[#E30613] flex items-center justify-center shadow-lg mb-3">
                    <Play className="size-8 fill-white ml-1" />
                  </div>
                  <h4 className="text-base font-bold">{post.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-md">
                    Vídeo explicativo oficial da Comercial do Norte — Explica Aí Nort!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
