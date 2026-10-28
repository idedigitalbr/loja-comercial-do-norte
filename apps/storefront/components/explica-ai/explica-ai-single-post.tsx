'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  ChevronDown,
  Clock,
  Eye,
  FileText,
  Maximize2,
  Package,
  Play,
  Share2,
  ShoppingBag,
  Volume2,
  X,
  Youtube,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

export type ChapterItem = {
  id: string;
  timeCode: string;
  seconds: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  fullTranscript?: string;
};

export type CitedProduct = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  tags: string[];
  productUrl: string;
};

export type RelatedVideo = {
  id: string;
  title: string;
  slug: string;
  duration: string;
  imageUrl: string;
  tags: string[];
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

const DEFAULT_CHAPTERS: ChapterItem[] = [
  {
    id: 'cap-1',
    timeCode: '00:00',
    seconds: 0,
    title: 'Introdução: por que a caixa de pizza é tão importante?',
    description:
      'A caixa de pizza não é apenas uma embalagem: é a extensão da qualidade da sua cozinha até a casa do cliente. Entenda como ela protege a massa, mantém o sabor e valoriza a sua marca.',
    thumbnailUrl: '/assets/explica-ai/chapter-1-thumb.png',
    fullTranscript:
      'Quando o cliente recebe uma pizza em casa, o primeiro contato físico com a sua pizzaria é através da caixa. Uma embalagem de baixa qualidade amassa no trajeto, umedece a massa devido à condensação e pode até transferir odores indesejados. Investir em papelão ondulado virgem com certificação alimentícia é o primeiro passo para garantir a fidelização do seu cliente.',
  },
  {
    id: 'cap-2',
    timeCode: '00:32',
    seconds: 32,
    title: 'Formatos: oitavada x quadrada',
    description:
      'As caixas oitavadas evitam que a pizza deslize durante a entrega, enquanto as quadradas oferecem mais estabilidade para empilhamento. Veja qual é a melhor opção para o seu negócio.',
    thumbnailUrl: '/assets/explica-ai/chapter-2-thumb.png',
    fullTranscript:
      'O formato oitavado acompanha a anatomia redonda da pizza, minimizando o espaço livre nas pontas e impedindo que a pizza deslize dentro da embalagem quando o motoboy faz curvas. Já as caixas quadradas têm cantos retos que conferem maior rigidez vertical para empilhamentos altos na bag de entrega, além de facilitar a inclusão de sachês, lacres e recados personalizados.',
  },
  {
    id: 'cap-3',
    timeCode: '01:10',
    seconds: 70,
    title: 'Respiros: ventilação que preserva a massa',
    description:
      'Os respiros de ar garantem a saída controlada do vapor, evitando que a massa fique borrachuda e mantendo a crocância da pizza por mais tempo.',
    thumbnailUrl: '/assets/explica-ai/chapter-3-thumb.png',
    fullTranscript:
      'O vapor liberado pela pizza recém-saída do forno precisa escapar de maneira controlada. Se a caixa for completamente selada sem furos térmicos, o vapor condensa na tampa e goteja de volta sobre o queijo e a borda, tornando a crosta borrachuda e amolecida. Os respiros laterais da Comercial do Norte mantêm o calor enquanto liberam a umidade excessiva.',
  },
  {
    id: 'cap-4',
    timeCode: '01:45',
    seconds: 105,
    title: 'Lacres de segurança e boas práticas',
    description:
      'O lacre inviolável transmite confiança ao cliente final e evita aberturas durante o transporte. Veja dicas de uso e armazenamento.',
    thumbnailUrl: '/assets/explica-ai/chapter-4-thumb.png',
    fullTranscript:
      'O lacre destrutível garante ao cliente que ninguém abriu a embalagem entre o forno e a entrega. Além de atender às exigências sanitárias, cria um diferencial de profissionalismo que gera avaliações 5 estrelas nos aplicativos de delivery.',
  },
];

const DEFAULT_PRODUCTS: CitedProduct[] = [
  {
    id: 'prod-1',
    title: 'Caixa de pizza oitavada',
    subtitle: 'Diversos tamanhos',
    imageUrl: '/assets/explica-ai/prod-1-clean.png',
    tags: ['Embalagens', 'Delivery'],
    productUrl: '/loja?busca=caixa+pizza+oitavada',
  },
  {
    id: 'prod-2',
    title: 'Caixa de pizza quadrada',
    subtitle: 'Diversos tamanhos',
    imageUrl: '/assets/explica-ai/prod-2-clean.png',
    tags: ['Embalagens', 'Delivery'],
    productUrl: '/loja?busca=caixa+pizza+quadrada',
  },
  {
    id: 'prod-3',
    title: 'Caixa com respiros laterais',
    subtitle: 'Mantém a crocância',
    imageUrl: '/assets/explica-ai/prod-3-clean.png',
    tags: ['Embalagens', 'Pizzarias'],
    productUrl: '/loja?busca=caixa+pizza+respiros',
  },
  {
    id: 'prod-4',
    title: 'Lacre de segurança',
    subtitle: 'Mais confiança na entrega',
    imageUrl: '/assets/explica-ai/prod-4-clean.png',
    tags: ['Embalagens', 'Delivery'],
    productUrl: '/loja?busca=lacre+seguranca',
  },
];

const DEFAULT_RELATED_VIDEOS: RelatedVideo[] = [
  {
    id: 'rel-1',
    title: 'Decoração de doces e bolos com chantilly profissional',
    slug: 'decoracao-de-doces-e-bolos-com-chantilly',
    duration: '2:35',
    imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/doces.webp',
    tags: ['Confeitaria', 'Doces & Bolos'],
  },
  {
    id: 'rel-2',
    title: 'Copos e tampas para açaí e café',
    slug: 'copos-e-tampas-para-acai-e-cafe',
    duration: '3:10',
    imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/copos.webp',
    tags: ['Açaí & Café', 'Food Service'],
  },
  {
    id: 'rel-3',
    title: 'Embalagens kraft para o seu delivery',
    slug: 'embalagens-kraft-para-o-seu-delivery',
    duration: '2:48',
    imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp',
    tags: ['Delivery', 'Linha Kraft'],
  },
  {
    id: 'rel-4',
    title: 'Como melhorar a entrega da sua pizzaria',
    slug: 'caixas-de-pizza-formatos-e-respiros',
    duration: '3:05',
    imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/pizza.webp',
    tags: ['Pizzarias', 'Transporte Seguro'],
  },
];

export function ExplicaAiSinglePost({ post }: ExplicaAiSinglePostProps) {
  const [activeVideoModal, setActiveVideoModal] = useState(false);
  const [videoTimestamp, setVideoTimestamp] = useState<number | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

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
  const conceptTag = post.conceptTag || 'Conceito 7';

  const handleOpenVideo = (seconds: number = 0) => {
    setVideoTimestamp(seconds);
    setActiveVideoModal(true);
  };

  const handleToggleChapter = (id: string) => {
    setExpandedChapter((prev) => (prev === id ? null : id));
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

        {/* 2. Hero Banner: Explica Aí Nort (Red Card) */}
        <section
          aria-label="Destaque em Vídeo"
          className="relative overflow-hidden rounded-[26px] sm:rounded-[34px] bg-gradient-to-br from-[#d3121e] via-[#c40817] to-[#aa0010] p-6 sm:p-8 md:p-10 lg:p-12 text-white shadow-xl"
        >
          {/* Imagem de fundo com curvas geométricas suaves oficiais */}
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
            {/* Coluna Esquerda: Tags, Título, Descrição e Metadados (lg:col-span-6) */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              {/* Tags Superior */}
              <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                <span className="inline-flex items-center rounded-full bg-white/20 px-3.5 py-1 text-[11px] sm:text-xs font-semibold text-white backdrop-blur-xs shadow-xs">
                  {conceptTag}
                </span>
                <span className="inline-flex items-center rounded-full bg-white px-3.5 py-1 text-[11px] sm:text-xs font-black text-[#CB001C] tracking-wide uppercase shadow-sm">
                  EXPLICA AÍ NORT!
                </span>
              </div>

              {/* Título Principal Pixel-Perfect */}
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
                    onClick={() => handleOpenVideo(0)}
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
                {/* Seta curva desenhada em SVG pixel-perfect apontando para a esquerda */}
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

        {/* 3. Seção: Transcrição do vídeo em blocos (Accordion Interativo) */}
        <section aria-labelledby="transcricao-heading" className="mt-10 sm:mt-12">
          {/* Header da Transcrição */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-start sm:items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-[#CB001C] shrink-0">
                <FileText className="size-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 id="transcricao-heading" className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Transcrição do vídeo
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-normal">
                  Acompanhe o conteúdo em blocos e explore cada tópico.
                </p>
              </div>
            </div>

            {/* Botão Assistir no YouTube */}
            <button
              onClick={() => handleOpenVideo(0)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:text-[#CB001C] hover:border-red-300 shadow-xs transition cursor-pointer self-start sm:self-auto"
            >
              <div className="flex size-5 items-center justify-center rounded-full bg-[#E30613] text-white">
                <Play className="size-2.5 fill-white ml-0.5" />
              </div>
              <span>Assistir no YouTube</span>
            </button>
          </div>

          {/* Lista de Blocos / Capítulos da Transcrição */}
          <div className="mt-4 flex flex-col gap-3">
            {DEFAULT_CHAPTERS.map((chap) => {
              const isExpanded = expandedChapter === chap.id;
              return (
                <div
                  key={chap.id}
                  className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Botão Play do Bloco */}
                    <button
                      onClick={() => handleOpenVideo(chap.seconds)}
                      title={`Tocar a partir de ${chap.timeCode}`}
                      className="flex size-7 sm:size-8 items-center justify-center rounded-full bg-[#E30613] hover:bg-[#c40510] text-white shadow-xs hover:scale-105 active:scale-95 transition shrink-0 cursor-pointer"
                    >
                      <Play className="size-3 fill-white ml-0.5" />
                    </button>

                    {/* Thumbnail com Badge de Tempo */}
                    <div
                      onClick={() => handleOpenVideo(chap.seconds)}
                      className="relative w-24 sm:w-28 md:w-32 aspect-[16/9] rounded-lg overflow-hidden bg-slate-100 shrink-0 cursor-pointer group"
                    >
                      <Image
                        src={chap.thumbnailUrl}
                        alt={chap.title}
                        fill
                        sizes="130px"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-1 left-1 rounded bg-black/85 px-1.5 py-0.5 text-[9px] font-mono font-bold text-white">
                        {chap.timeCode}
                      </span>
                    </div>

                    {/* Título e Breve Descrição */}
                    <div className="flex-1 min-w-0">
                      <h3
                        onClick={() => handleToggleChapter(chap.id)}
                        className="text-xs sm:text-sm font-bold text-slate-900 leading-snug cursor-pointer hover:text-[#CB001C] transition-colors"
                      >
                        {chap.title}
                      </h3>
                      <p className="mt-1 text-[11px] sm:text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {chap.description}
                      </p>
                    </div>

                    {/* Botão Chevron para expandir transcrição completa */}
                    <button
                      onClick={() => handleToggleChapter(chap.id)}
                      aria-label={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                      className="flex size-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 transition shrink-0 cursor-pointer"
                    >
                      <ChevronDown
                        className={`size-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#CB001C]' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Conteúdo Expandido da Transcrição */}
                  {isExpanded && chap.fullTranscript && (
                    <div className="mt-3.5 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed pl-11 sm:pl-12">
                      <p className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {chap.fullTranscript}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Banner Comercial CTA: Monte sua cotação (Navy Blue Card) */}
        <section
          aria-label="Cotação Comercial do Norte"
          className="mt-10 sm:mt-12 relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#011838] p-6 sm:p-8 md:p-10 text-white shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Texto Promocional (md:col-span-6) */}
            <div className="md:col-span-6 z-10">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FBBF24]">
                PRECISA DESSES ITENS NO SEU NEGÓCIO?
              </span>
              <h2 className="mt-1 text-xl sm:text-2xl md:text-3xl font-black leading-tight text-white">
                Monte sua cotação online na Comercial do Norte
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-md font-normal leading-relaxed">
                Caixas de pizza, embalagens, lacres e muito mais com entrega rápida em Belém e Região Metropolitana.
              </p>
            </div>

            {/* Imagem das caixas de pizza empilhadas (md:col-span-3) */}
            <div className="md:col-span-3 flex justify-center z-10">
              <div className="relative w-48 sm:w-56 h-28 sm:h-32">
                <Image
                  src="/assets/explica-ai/cta-pizza-stack-clean.png"
                  alt="Caixas de pizza empilhadas da Comercial do Norte"
                  fill
                  sizes="240px"
                  className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                />
              </div>
            </div>

            {/* Botão de Cotação (md:col-span-3) */}
            <div className="md:col-span-3 flex md:justify-end z-10">
              <Link
                href="/loja"
                className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 rounded-full bg-[#E30613] hover:bg-[#c40510] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition active:scale-95 whitespace-nowrap"
              >
                <span>Ver Catálogo de Produtos</span>
                <ChevronRight className="size-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Seção: Produtos citados neste vídeo */}
        <section aria-labelledby="produtos-heading" className="mt-12 sm:mt-14">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-red-100 text-[#CB001C] shrink-0">
                <ShoppingBag className="size-4.5 stroke-[2.2]" />
              </div>
              <div>
                <h2 id="produtos-heading" className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Produtos citados neste vídeo
                </h2>
                <p className="text-xs text-slate-500 font-normal">
                  Confira os principais produtos para aplicar as dicas no seu negócio.
                </p>
              </div>
            </div>

            <Link
              href="/loja"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#CB001C] hover:underline"
            >
              <span>Ver todos os produtos</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Grid de 4 Produtos Citados */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEFAULT_PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-[#CB001C]/50 hover:shadow-md transition-all group"
              >
                {/* Imagem do Produto */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center p-2">
                  <Image
                    src={prod.imageUrl}
                    alt={prod.title}
                    fill
                    sizes="250px"
                    className="object-contain p-2 group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Textos */}
                <div className="mt-3">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#CB001C] transition-colors">
                    {prod.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">{prod.subtitle}</p>

                  {/* Badges do Produto */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {prod.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                          tag === 'Embalagens'
                            ? 'bg-sky-50 text-sky-600 border-sky-200/60'
                            : 'bg-rose-50 text-rose-600 border-rose-200/60'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Botão Ver Produto */}
                <Link
                  href={prod.productUrl}
                  className="mt-4 inline-flex items-center justify-center gap-1 w-full rounded-full border border-rose-200 py-1.5 text-xs font-semibold text-[#CB001C] hover:bg-rose-50 hover:border-rose-300 transition"
                >
                  <span>Ver Produto</span>
                  <ChevronRight className="size-3" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Seção: Outras dicas que podem te ajudar */}
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
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Grid de 4 Vídeos Relacionados */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEFAULT_RELATED_VIDEOS.map((vid) => (
              <Link
                key={vid.id}
                href={`/post/${vid.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs hover:border-[#CB001C]/50 hover:shadow-md transition-all"
              >
                {/* Thumbnail com Play Button Central e Duração */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
                  <Image
                    src={vid.imageUrl}
                    alt={vid.title}
                    fill
                    sizes="250px"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

                  {/* Play Button Central */}
                  <div className="absolute inset-0 m-auto size-10 rounded-full bg-[#E30613] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Play className="size-4 fill-white ml-0.5" />
                  </div>

                  {/* Badge de Duração no canto inferior direito */}
                  <span className="absolute bottom-1.5 right-1.5 rounded bg-black/85 px-1.5 py-0.5 text-[9px] font-mono font-bold text-white">
                    {vid.duration}
                  </span>
                </div>

                {/* Título do Vídeo */}
                <div className="mt-3 flex-1 flex flex-col justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-[#CB001C] transition-colors leading-snug">
                    {vid.title}
                  </h3>

                  {/* Tags */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {vid.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-rose-50/80 border border-rose-200/50 px-2 py-0.5 text-[10px] font-medium text-rose-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* 7. Modal de Vídeo Interativo */}
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
                  src={`${post.videoUrl}${post.videoUrl.includes('?') ? '&' : '?'}autoplay=1&start=${videoTimestamp || 0}`}
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
                    Reproduzindo dica prática do Explica Aí Nort a partir de{' '}
                    {videoTimestamp ? `${videoTimestamp} segundos` : '00:00'}.
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
