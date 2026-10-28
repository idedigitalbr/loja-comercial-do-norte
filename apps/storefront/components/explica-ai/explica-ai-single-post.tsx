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
  X,
  Volume2,
  Maximize2,
} from 'lucide-react';
import { VideoArticleCard } from '@/components/storefront/widgets/video-articles-carousel/video-article-card';
import { ProductCard } from '@/components/product-card';
import type { ApiProduct } from '@/lib/types';

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
  products?: ApiProduct[];
};

const FALLBACK_PRODUCTS: ApiProduct[] = [
  {
    id: 'prod-leite-condensado',
    publicId: 'prod-leite-condensado',
    name: 'Leite Condensado 395 g',
    slug: 'leite-condensado-395g',
    description: 'Lata de 395 g. Produto de demonstração do catálogo.',
    status: 'ACTIVE',
    brand: { id: 'b-itambe', name: 'Itambé', slug: 'itambe' },
    categories: [{ category: { id: 'c-confeitaria', name: 'Confeitaria', slug: 'confeitaria' } }],
    images: [{ id: 'img-leite', path: '/assets/PRODUTOS/produtos-imgs/leite-condensado-395g.jpg', altText: 'Leite Condensado 395 g', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'var-leite', publicId: 'var-leite', sku: 'LEITE-395G', priceCents: 749, compareAtPriceCents: 959, weightGrams: 395, widthMm: 80, heightMm: 90, lengthMm: 80, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'prod-detergente-neutro',
    publicId: 'prod-detergente-neutro',
    name: 'Detergente Neutro 5 L',
    slug: 'detergente-neutro-5l',
    description: 'Galão de 5 litros. Produto de demonstração do catálogo.',
    status: 'ACTIVE',
    brand: { id: 'b-ype', name: 'Ypê', slug: 'ype' },
    categories: [{ category: { id: 'c-limpeza', name: 'Limpeza', slug: 'limpeza' } }],
    images: [{ id: 'img-detergente', path: '/assets/PRODUTOS/produtos-imgs/detergente-neutro-5l.jpg', altText: 'Detergente Neutro 5 L', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'var-detergente', publicId: 'var-detergente', sku: 'DET-5L', priceCents: 2490, compareAtPriceCents: 2790, weightGrams: 5000, widthMm: 150, heightMm: 300, lengthMm: 150, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'prod-forminha-docinho',
    publicId: 'prod-forminha-docinho',
    name: 'Forminha de Docinho nº 5',
    slug: 'forminha-docinho-n5',
    description: 'Pacote com 100 forminhas. Produto de demonstração do catálogo.',
    status: 'ACTIVE',
    brand: { id: 'b-bwb', name: 'BWB Embalagens', slug: 'bwb' },
    categories: [{ category: { id: 'c-confeitaria', name: 'Confeitaria', slug: 'confeitaria' } }],
    images: [{ id: 'img-forminha', path: '/assets/PRODUTOS/produtos-imgs/forminha-docinho-n5.jpg', altText: 'Forminha de Docinho nº 5', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'var-forminha', publicId: 'var-forminha', sku: 'FORM-N5', priceCents: 730, compareAtPriceCents: 934, weightGrams: 50, widthMm: 30, heightMm: 20, lengthMm: 30, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'prod-velas-aniversario',
    publicId: 'prod-velas-aniversario',
    name: 'Velas de Aniversário Coloridas',
    slug: 'velas-aniversario-coloridas',
    description: 'Cartela com 12 velas. Produto de demonstração do catálogo.',
    status: 'ACTIVE',
    brand: { id: 'b-silver-festas', name: 'Silver Festas', slug: 'silver-festas' },
    categories: [{ category: { id: 'c-festas', name: 'Artigos para Festa', slug: 'artigos-para-festa' } }],
    images: [{ id: 'img-velas', path: '/assets/PRODUTOS/produtos-imgs/velas-aniversario-coloridas.jpg', altText: 'Velas de Aniversário Coloridas', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'var-velas', publicId: 'var-velas', sku: 'VELAS-COL', priceCents: 420, compareAtPriceCents: 538, weightGrams: 30, widthMm: 60, heightMm: 100, lengthMm: 10, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'prod-sacola-reforcada',
    publicId: 'prod-sacola-reforcada',
    name: 'Sacola Plástica Reforçada 40 x 50 cm',
    slug: 'sacola-plastica-40x50',
    description: 'Fardo com 1 kg de sacolas. Produto de demonstração do catálogo.',
    status: 'ACTIVE',
    brand: { id: 'b-norteplast', name: 'NortePlast', slug: 'norteplast' },
    categories: [{ category: { id: 'c-sacolas', name: 'Sacos & Sacolas', slug: 'sacos-e-sacolas' } }],
    images: [{ id: 'img-sacola', path: '/assets/PRODUTOS/produtos-imgs/sacola-50x60.jpg', altText: 'Sacola Plástica Reforçada 40 x 50 cm', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'var-sacola', publicId: 'var-sacola', sku: 'SAC-40X50', priceCents: 1590, compareAtPriceCents: 2035, weightGrams: 1000, widthMm: 400, heightMm: 50, lengthMm: 500, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
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
    id: 'vid-kraft-2',
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

export function ExplicaAiSinglePost({ post, products }: ExplicaAiSinglePostProps) {
  const [activeVideoModal, setActiveVideoModal] = useState(false);
  const carouselTrackRef = useRef<HTMLDivElement>(null);

  const catalogProducts = products && products.length > 0 ? products : FALLBACK_PRODUCTS;

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
    const scrollAmount = 260 * direction;
    carouselTrackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-[#f8fafc] pb-16">
      <div className="cn-container pt-3 sm:pt-4">
        {/* 1. Breadcrumb Pixel-Perfect */}
        <nav
          aria-label="Você está aqui"
          className="text-[11px] sm:text-xs text-slate-500 mb-3 sm:mb-4 font-normal flex flex-wrap items-center gap-1.5"
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

        {/* 2. Hero Banner: Explica Aí Nort (Card Vermelho Compacto & Pixel-Perfect) */}
        <section
          aria-label="Destaque em Vídeo"
          className="relative rounded-[22px] sm:rounded-[26px] bg-gradient-to-r from-[#d3121e] via-[#c40817] to-[#aa0010] px-4 sm:px-6 md:px-8 text-white shadow-lg h-[200px] sm:h-[215px] md:h-[225px] flex items-center overflow-visible my-4 sm:my-6"
        >
          {/* Fundo com curvas abstratas oficiais */}
          <div className="absolute inset-0 pointer-events-none select-none opacity-25 mix-blend-overlay rounded-[22px] sm:rounded-[26px] overflow-hidden">
            <Image
              src="/assets/HOME Vitrine/S14-POSTS-ExplicaAi/S14-bg-fundo-vermelho-geometrico-abstrato-hd.png"
              alt=""
              fill
              priority
              className="object-cover object-center"
            />
          </div>

          {/* Coluna Esquerda: Badge, Título, Descrição e Metadados */}
          <div className="relative z-10 w-[62%] sm:w-[55%] md:w-[44%] lg:w-[42%] flex flex-col justify-center h-full py-2 pr-2">
            {/* Badge Oficial */}
            <div className="mb-1.5 sm:mb-2">
              <span className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-[9.5px] sm:text-[10.5px] font-black text-[#CB001C] tracking-wider uppercase shadow-xs">
                EXPLICA AÍ NORT!
              </span>
            </div>

            {/* Título Principal Compacto */}
            <h1 className="text-sm sm:text-base md:text-[18px] lg:text-[20px] font-black leading-[1.15] tracking-tight text-white line-clamp-2 md:line-clamp-3">
              {post.title}
            </h1>

            {/* Subtítulo / Descrição Compacta */}
            <p className="mt-1 sm:mt-1.5 text-[10px] sm:text-[11px] md:text-[11.5px] leading-snug text-white/90 line-clamp-2 md:line-clamp-3 max-w-md font-normal">
              {post.excerpt ||
                'Tudo sobre caixas oitavadas e quadradas, respiros térmicos e lacres invioláveis para sua pizzaria. Dicas práticas para manter a qualidade da pizza do forno até o cliente.'}
            </p>

            {/* Metadados: visualizações, data e duração */}
            <div className="mt-2 sm:mt-2.5 flex items-center gap-2 sm:gap-3 text-[9.5px] sm:text-[10.5px] font-medium text-white/90">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="flex size-3.5 sm:size-4 items-center justify-center rounded-full bg-white text-[#CB001C] shadow-xs shrink-0">
                  <Play className="size-2 fill-[#CB001C] text-[#CB001C] ml-0.5" />
                </span>
                <span>{formattedViews} visualizações</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="size-3 sm:size-3.5 opacity-90 shrink-0" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="size-3 sm:size-3.5 opacity-90 shrink-0" />
                <span>{post.videoDuration || '5 min'}</span>
              </div>
            </div>
          </div>

          {/* Coluna Central: Smartphone Mockup Protrudindo Verticalmente (Pixel-Perfect 1:1) */}
          <div className="absolute right-3 sm:right-6 md:right-auto md:left-[47%] md:-translate-x-1/2 top-1/2 -translate-y-1/2 z-20 flex justify-center">
            <div className="relative w-[95px] sm:w-[110px] md:w-[126px] lg:w-[132px] h-[190px] sm:h-[220px] md:h-[255px] lg:h-[265px] rounded-[22px] sm:rounded-[26px] bg-[#0c0c0e] p-1 sm:p-1.5 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.6)] border-[2px] sm:border-[2.5px] border-zinc-700/60 select-none shrink-0 group">
              {/* Dynamic Island no topo do iPhone */}
              <div className="absolute top-1 sm:top-1.5 left-1/2 -translate-x-1/2 w-8 sm:w-10 md:w-12 h-2.5 sm:h-3 bg-black rounded-full z-30 flex items-center justify-end pr-1 sm:pr-1.5 pointer-events-none">
                <div className="size-1 rounded-full bg-zinc-800" />
              </div>

              {/* Status Bar */}
              <div className="absolute top-1 sm:top-1.5 inset-x-2.5 sm:inset-x-3 flex items-center justify-between z-20 text-[6.5px] sm:text-[7px] font-semibold text-white pointer-events-none">
                <span>9:41</span>
                <div className="flex items-center gap-0.5">
                  <div className="flex gap-0.5 items-end h-1.5">
                    <div className="w-0.5 h-1 bg-white rounded-2xs" />
                    <div className="w-0.5 h-1.5 bg-white rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* Tela do Vídeo */}
              <div className="relative w-full h-full rounded-[18px] sm:rounded-[22px] overflow-hidden bg-zinc-950">
                <Image
                  src="/assets/explica-ai/video-screen-girl.png"
                  alt="Vídeo explicativo na prática"
                  fill
                  priority
                  sizes="(max-width: 768px) 110px, 140px"
                  className="object-cover"
                />

                {/* Gradiente escuro para legibilidade */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/25 pointer-events-none" />

                {/* Botão de Play Central Vermelho */}
                <button
                  onClick={handleOpenVideo}
                  aria-label="Assistir ao vídeo agora"
                  className="absolute inset-0 m-auto size-8 sm:size-9 md:size-10 rounded-full bg-[#E30613] hover:bg-[#c40510] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer z-20"
                >
                  <Play className="size-3.5 sm:size-4 md:size-4.5 fill-white ml-0.5" />
                </button>

                {/* Barra de Controle Inferior do Vídeo */}
                <div className="absolute bottom-1 sm:bottom-1.5 inset-x-1.5 sm:inset-x-2 z-20 flex flex-col gap-0.5 pointer-events-none">
                  <div className="h-0.5 w-full bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-[#E30613]" />
                  </div>
                  <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-mono text-white/90">
                    <span>0:00 / 2:18</span>
                    <div className="flex items-center gap-1">
                      <Volume2 className="size-2 sm:size-2.5 text-white" />
                      <Maximize2 className="size-2 sm:size-2.5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Callout com Seta Curva e Mascote Oficial (md:flex) */}
          <div className="hidden md:flex absolute inset-y-0 right-0 left-[54%] items-center justify-between pointer-events-none z-10">
            {/* Callout Texto + Seta Curva Apontando para o Telefone */}
            <div className="flex items-center gap-2 self-start mt-4 lg:mt-5 ml-1 bg-black/15 border border-white/10 rounded-2xl px-2.5 py-1.5 backdrop-blur-2xs">
              <svg
                width="28"
                height="22"
                viewBox="0 0 36 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white shrink-0"
              >
                <path
                  d="M32 22 C 30 6, 16 3, 5 12"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 6 L 4 12 L 10 18"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <div className="text-[10.5px] lg:text-[11.5px] font-bold leading-[1.18] text-white tracking-tight">
                <p>Assista ao vídeo</p>
                <p>e veja as dicas na prática!</p>
              </div>
            </div>

            {/* Mascote Nort Oficial Sem Chapéu Apontando para o Telefone */}
            <div className="relative w-[140px] md:w-[155px] lg:w-[175px] h-[140px] md:h-[155px] lg:h-[175px] shrink-0 self-end -mr-1 lg:mr-2">
              <Image
                src="/assets/explica-ai/mascote-nort-apontando.webp"
                alt="Mascote Nort apontando para o smartphone"
                fill
                priority
                sizes="(max-width: 1024px) 155px, 175px"
                className="object-contain object-bottom drop-shadow-[0_8px_18px_rgba(0,0,0,0.3)]"
              />
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
          className="mt-10 sm:mt-12 relative rounded-2xl sm:rounded-3xl bg-[#011838] p-5 sm:p-7 md:p-9 text-white shadow-xl"
        >
          {/* Header do Banner (sem imagem da caixa) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 z-10">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FBBF24]">
                PRODUTOS RELACIONADOS
              </span>
              <h2 className="mt-1 text-xl sm:text-2xl md:text-3xl font-black leading-tight text-white">
                Tudo para a sua pizzaria
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
                Caixas de pizza, lacres, forminhas e muito mais com entrega rápida em Belém e Região Metropolitana.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                href="/loja"
                className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-1.5 rounded-full bg-[#E30613] hover:bg-[#c40510] px-5 py-2.5 text-xs sm:text-[13px] font-bold text-white shadow-lg transition active:scale-95 whitespace-nowrap"
              >
                <span>Ver todos os produtos</span>
                <ChevronRight className="size-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>

          {/* Carrossel de Produtos 1:1 com o componente oficial ProductCard da home */}
          <div className="relative z-10">
            {/* Botão Esquerdo do Carrossel */}
            <button
              onClick={() => handleScrollCarousel(-1)}
              aria-label="Ver produtos anteriores"
              className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 size-9 sm:size-10 rounded-full bg-white shadow-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#CB001C] z-30 transition cursor-pointer hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="size-5 stroke-[2.5]" />
            </button>

            {/* Track de Produtos com ProductCard oficial da loja */}
            <div
              ref={carouselTrackRef}
              className="flex items-start gap-3.5 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth px-1 pt-1 pb-16 sm:pb-20"
            >
              {catalogProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className="shrink-0 w-[200px] sm:w-[220px] md:w-[230px]"
                >
                  <ProductCard
                    product={product}
                    flashBadge={idx % 2 === 0}
                  />
                </div>
              ))}
            </div>

            {/* Botão Direito do Carrossel */}
            <button
              onClick={() => handleScrollCarousel(1)}
              aria-label="Ver próximos produtos"
              className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 size-9 sm:size-10 rounded-full bg-white shadow-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#CB001C] z-30 transition cursor-pointer hover:scale-105 active:scale-95"
            >
              <ChevronRight className="size-5 stroke-[2.5]" />
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
