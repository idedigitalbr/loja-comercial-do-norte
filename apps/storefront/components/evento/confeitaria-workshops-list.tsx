'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Search,
  ChefHat,
  Play,
  Mic,
  Store,
  Tag,
  Coffee,
  Star,
  X,
} from 'lucide-react';
import './confeitaria-tokens.css';
import { VideoArticlesCarouselWidget } from '@/components/storefront/widgets/video-articles-carousel/video-articles-carousel';
import { ScrollRevealBlock, SkeletonBlock } from '@/components/ui/scroll-skeleton-reveal';
import {
  CONFEITARIA_WORKSHOPS,
  mapEventsToConfeitariaCarouselItems,
  type EventItem,
} from '@/lib/events-data';
import type { VideoArticlesCarouselProps } from '@/lib/storefront/widget-types';

const DEFAULT_CONFEITARIA_HERO: Omit<VideoArticlesCarouselProps, 'items'> = {
  variant: 'confeitaria',
  title: 'Workshops & Aulas Práticas de Confeitaria',
  subtitle: 'Faça suas compras e ganhe treinamento gratuitamente.',
  viewAllLabel: 'Ver todos',
  viewAllUrl: '#workshops-lista',
  mascotImageUrl: '/assets/confeitaria/confeiteira-banner-cutout-trimmed.webp',
  bgImageUrl: '/assets/confeitaria/bg-confeitaria-banner.svg',
};

export type ConfeitariaWorkshopsListProps = {
  initialEvents: EventItem[];
  detailBasePath?: string;
  allCategoryLabel?: string;
  heroBannerProps?: Partial<VideoArticlesCarouselProps>;
};

type CategoryFilter = 'todos' | 'workshops' | 'aulas-show' | 'palestras';

export function ConfeitariaWorkshopsList({
  initialEvents,
  detailBasePath = '/evento/workshop/aulas-confeitaria',
  allCategoryLabel = 'Todos os workshops',
  heroBannerProps,
}: ConfeitariaWorkshopsListProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Categorização inteligente para cada evento
  const getEventCategory = (event: EventItem): CategoryFilter => {
    const key = event.categoryKey;
    if (key === 'workshops' || key === 'aulas-show' || key === 'palestras') {
      return key as CategoryFilter;
    }
    const text = `${event.badge || ''} ${event.title} ${event.subtitle || ''} ${event.slug}`.toLowerCase();
    if (text.includes('palestra')) return 'palestras';
    if (text.includes('aula') || text.includes('show')) return 'aulas-show';
    return 'workshops';
  };

  // Contadores dinâmicos para os botões de filtro
  const categoryCounts = useMemo(() => {
    const counts = {
      todos: initialEvents.length,
      workshops: 0,
      'aulas-show': 0,
      palestras: 0,
    };

    initialEvents.forEach((ev) => {
      const cat = getEventCategory(ev);
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    });

    return counts;
  }, [initialEvents]);

  // Filtragem combinada (categoria + busca)
  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      if (activeCategory !== 'todos') {
        const cat = getEventCategory(event);
        if (cat !== activeCategory) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const haystack = `${event.title} ${event.subtitle || ''} ${event.description} ${event.location || ''} ${
          event.instructor || ''
        } ${event.badge || ''}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [initialEvents, activeCategory, searchQuery]);

  const resolvedHero = useMemo(() => {
    const sourceEvents = initialEvents.length > 0 ? initialEvents : CONFEITARIA_WORKSHOPS;
    const items = mapEventsToConfeitariaCarouselItems(sourceEvents, detailBasePath);
    const rawViewAllUrl = heroBannerProps?.viewAllUrl;
    return {
      title: heroBannerProps?.title || DEFAULT_CONFEITARIA_HERO.title,
      subtitle: heroBannerProps?.subtitle || DEFAULT_CONFEITARIA_HERO.subtitle,
      viewAllLabel: heroBannerProps?.viewAllLabel || DEFAULT_CONFEITARIA_HERO.viewAllLabel,
      viewAllUrl:
        !rawViewAllUrl || rawViewAllUrl === '/eventos/workshops/aulas-confeitaria'
          ? '#workshops-lista'
          : rawViewAllUrl,
      mascotImageUrl:
        heroBannerProps?.mascotImageUrl || DEFAULT_CONFEITARIA_HERO.mascotImageUrl,
      bgImageUrl: heroBannerProps?.bgImageUrl || DEFAULT_CONFEITARIA_HERO.bgImageUrl,
      items,
    };
  }, [heroBannerProps, initialEvents, detailBasePath]);

  return (
    <div
      data-event-theme="light"
      className="confeitaria-theme w-full min-h-screen bg-[#FAF6F0] text-[#4B290D] selection:bg-[#E0BCBC] selection:text-[#4B290D]"
    >
      {/* =========================================================================
          1. HERO PRINCIPAL: IDÊNTICO À SEÇÃO WORKSHOPS & AULAS DE CONFEITARIA DA HOME
          ========================================================================= */}
      <VideoArticlesCarouselWidget
        bgImageUrl={resolvedHero.bgImageUrl}
        fullWidth={false}
        headingAs="h1"
        items={resolvedHero.items}
        mascotImageUrl={resolvedHero.mascotImageUrl}
        showViewAll={true}
        subtitle={resolvedHero.subtitle}
        title={resolvedHero.title}
        variant="confeitaria"
        viewAllLabel={resolvedHero.viewAllLabel}
        viewAllUrl={resolvedHero.viewAllUrl}
      />

      {/* =========================================================================
          2. BARRA DE FILTROS + BUSCA + GRID DE WORKSHOPS
          ========================================================================= */}
      <section id="workshops-lista" className="cn-container pt-3 pb-10 sm:pt-4 sm:pb-14">
        {/* Breadcrumb refinado */}
        <nav aria-label="Você está aqui" className="flex items-center gap-2 text-xs font-medium text-[#73594C] mb-5">
          <Link className="hover:text-[#4B290D] transition-colors" href="/">
            Início
          </Link>
          <ChevronRight className="size-3 text-[#A8968B]" />
          <Link className="hover:text-[#4B290D] transition-colors" href="/eventos">
            Eventos
          </Link>
          <ChevronRight className="size-3 text-[#A8968B]" />
          <span className="font-semibold text-[#B75675]">Aulas Confeitaria</span>
        </nav>
        {/* Barra de Filtros e Busca */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8 sm:mb-10 pb-6 border-b border-[#EFE4DC]">
          {/* Categorias (Pills) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Todos os eventos / workshops */}
            <button
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs ${
                activeCategory === 'todos'
                  ? 'bg-[#4B290D] text-white shadow-md shadow-[#4B290D]/20 scale-[1.02]'
                  : 'bg-white text-[#4B290D] border border-[#EFE4DC] hover:border-[#4B290D]/30 hover:bg-[#FAF6F0]'
              }`}
              onClick={() => setActiveCategory('todos')}
              type="button"
            >
              <Calendar className="size-3.5" />
              <span>{allCategoryLabel}</span>
            </button>

            {/* Workshops */}
            {categoryCounts.workshops > 0 ? (
              <button
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs ${
                  activeCategory === 'workshops'
                    ? 'bg-[#4B290D] text-white shadow-md shadow-[#4B290D]/20 scale-[1.02]'
                    : 'bg-white text-[#4B290D] border border-[#EFE4DC] hover:border-[#4B290D]/30 hover:bg-[#FAF6F0]'
                }`}
                onClick={() => setActiveCategory('workshops')}
                type="button"
              >
                <ChefHat className="size-3.5" />
                <span>Workshops ({categoryCounts.workshops})</span>
              </button>
            ) : null}

            {/* Aulas-show */}
            {categoryCounts['aulas-show'] > 0 ? (
              <button
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs ${
                  activeCategory === 'aulas-show'
                    ? 'bg-[#4B290D] text-white shadow-md shadow-[#4B290D]/20 scale-[1.02]'
                    : 'bg-white text-[#4B290D] border border-[#EFE4DC] hover:border-[#4B290D]/30 hover:bg-[#FAF6F0]'
                }`}
                onClick={() => setActiveCategory('aulas-show')}
                type="button"
              >
                <Play className="size-3.5" />
                <span>Aulas-show ({categoryCounts['aulas-show']})</span>
              </button>
            ) : null}

            {/* Palestras */}
            {categoryCounts.palestras > 0 ? (
              <button
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs ${
                  activeCategory === 'palestras'
                    ? 'bg-[#4B290D] text-white shadow-md shadow-[#4B290D]/20 scale-[1.02]'
                    : 'bg-white text-[#4B290D] border border-[#EFE4DC] hover:border-[#4B290D]/30 hover:bg-[#FAF6F0]'
                }`}
                onClick={() => setActiveCategory('palestras')}
                type="button"
              >
                <Mic className="size-3.5" />
                <span>Palestras ({categoryCounts.palestras})</span>
              </button>
            ) : null}
          </div>

          {/* Campo de Busca de Eventos */}
          <div className="relative w-full lg:w-72">
            <input
              className="w-full rounded-full border border-[#EFE4DC] bg-white px-4 py-2.5 pr-10 text-xs text-[#4B290D] placeholder-[#A8968B] shadow-xs focus:outline-none focus:border-[#4B290D] focus:ring-2 focus:ring-[#4B290D]/10 transition-colors"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar evento..."
              type="text"
              value={searchQuery}
            />
            {searchQuery ? (
              <button
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#73594C] hover:text-[#4B290D] p-1 cursor-pointer"
                onClick={() => setSearchQuery('')}
                type="button"
              >
                <X className="size-3.5" />
              </button>
            ) : (
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-[#A8968B] pointer-events-none" />
            )}
          </div>
        </div>

        {/* Grid de 4 Colunas com os Cards de Workshops */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
            {filteredEvents.map((event, idx) => {
              const detailHref = `${detailBasePath}/${event.slug}`;
              const isFirstFeatured = idx === 0;

              return (
                <ScrollRevealBlock
                  className="h-full"
                  delayMs={(idx % 4) * 65}
                  key={event.id}
                  skeleton={
                    idx >= 4 ? (
                      <SkeletonBlock className="h-[410px] w-full rounded-3xl" />
                    ) : undefined
                  }
                  skeletonDurationMs={260}
                >
                  <article
                    className="group flex h-full flex-col rounded-3xl bg-white border border-[#EFE4DC] transition-all duration-300 overflow-hidden confeitaria-card-shadow hover:confeitaria-card-shadow-hover hover:-translate-y-1.5"
                  >
                  {/* Foto do Card com Tag Flutuante */}
                  <Link className="relative aspect-[16/10] w-full overflow-hidden block bg-[#FAF6F0]" href={detailHref}>
                    {event.posterUrl ? (
                      <Image
                        alt={event.title}
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        src={event.posterUrl}
                      />
                    ) : (
                      <div className="flex size-full flex-col items-center justify-center p-6 text-center text-[#73594C]">
                        <ChefHat className="size-10 stroke-1 text-[#B75675]" />
                        <span className="mt-2 text-xs">Workshop Confeitaria</span>
                      </div>
                    )}

                    {/* Tag Flutuante em Tom Framboesa/Rosa */}
                    {event.badge ? (
                      <div className="absolute top-3.5 left-3.5 z-10">
                        <span className="inline-flex items-center rounded-full bg-[#B75675] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md shadow-black/20">
                          {event.badge}
                        </span>
                      </div>
                    ) : null}
                  </Link>

                  {/* Conteúdo do Card */}
                  <div className="flex flex-1 flex-col p-5 sm:p-6 justify-between">
                    <div>
                      {/* Metadados: Data e Horário */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#73594C] mb-3 font-medium">
                        {event.eventDateText ? (
                          <div className="flex items-center gap-1.5 text-[#B75675] font-semibold">
                            <Calendar className="size-3.5 text-[#B75675]" />
                            <span>{event.eventDateText}</span>
                          </div>
                        ) : null}
                        {event.eventTime ? (
                          <div className="flex items-center gap-1.5 text-[#73594C]">
                            <Clock className="size-3.5 text-[#A8968B]" />
                            <span>{event.eventTime}</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Título do Workshop */}
                      <h2 className="confeitaria-serif text-lg font-bold text-[#4B290D] leading-snug line-clamp-2 group-hover:text-[#5D3310] transition-colors">
                        <Link href={detailHref}>{event.title}</Link>
                      </h2>

                      {/* Descrição Curta */}
                      <p className="mt-2.5 text-xs text-[#73594C] leading-relaxed line-clamp-2">
                        {event.subtitle || event.description}
                      </p>

                      {/* Localização */}
                      {event.location ? (
                        <div className="mt-4 flex items-start gap-1.5 text-xs text-[#73594C]">
                          <MapPin className="size-3.5 text-[#B75675] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Botão de Ação CTA */}
                    <div className="mt-6 pt-4 border-t border-[#F5EAE0]">
                      <Link
                        className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-2.5 px-4 text-xs font-bold transition-all duration-200 cursor-pointer ${
                          isFirstFeatured
                            ? 'bg-[#4B290D] text-white hover:bg-[#381E09] shadow-sm hover:shadow-md'
                            : 'bg-[#FDF2ED] text-[#4B290D] hover:bg-[#4B290D] hover:text-white'
                        }`}
                        href={detailHref}
                      >
                        <span>{event.ctaLabel || 'Garantir Vaga'}</span>
                        <ChevronRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                  </article>
                </ScrollRevealBlock>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-[#EFE4DC] bg-white p-12 text-center confeitaria-card-shadow">
            <ChefHat className="mx-auto size-12 text-[#E0BCBC]" />
            <h3 className="mt-4 text-lg font-bold text-[#4B290D]">Nenhum evento encontrado</h3>
            <p className="mt-1 text-sm text-[#73594C]">Tente ajustar a sua busca ou selecione outra categoria.</p>
            <button
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#4B290D] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#381E09] transition-colors"
              onClick={() => {
                setActiveCategory('todos');
                setSearchQuery('');
              }}
              type="button"
            >
              Ver todos os eventos
            </button>
          </div>
        )}

        {/* =========================================================================
            3. BANNER INTERMEDIÁRIO: "APRENDA COM ESPECIALISTAS"
            ========================================================================= */}
        <div className="mt-14 sm:mt-18 rounded-3xl overflow-hidden relative shadow-xl border border-[#EFE4DC]">
          <div className="relative min-h-[320px] sm:min-h-[380px] w-full flex items-center">
            {/* Imagem de Fundo com Bolo de Chocolate e Degradê Suave */}
            <Image
              alt="Bolo decorado com morangos e granulados finos Comercial do Norte"
              className="size-full object-cover object-right md:object-center"
              fill
              priority={false}
              sizes="100vw"
              src="/assets/confeitaria/01-listagem-eventos/09-banner-chocolate-degrade-pronto.png"
            />

            {/* Conteúdo Sobreposto */}
            <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#B75675] mb-2.5">
                <span className="w-5 h-0.5 bg-[#B75675]" />
                CONFEITARIA QUE TRANSFORMA
              </div>

              <h2 className="confeitaria-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#4B290D] leading-tight">
                Aprenda com especialistas <br />
                <span className="text-[#B75675]">e evolua na sua confeitaria</span>
              </h2>

              <p className="mt-3.5 text-xs sm:text-sm text-[#73594C] leading-relaxed max-w-md">
                Workshops, aulas práticas e experiências exclusivas com profissionais renomados. Mais técnica, mais
                sabor e mais oportunidades para o seu negócio.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  className="inline-flex items-center gap-2 rounded-full bg-[#4B290D] px-6 py-3 text-xs font-bold text-white hover:bg-[#381E09] transition-all shadow-md shadow-[#4B290D]/20 cursor-pointer"
                  onClick={() => {
                    setActiveCategory('todos');
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  type="button"
                >
                  <span>Ver todos os eventos</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Mensagem Cursiva no Canto */}
            <div className="hidden lg:block absolute right-12 bottom-8 text-right pointer-events-none select-none">
              <div className="italic font-serif text-[#B75675] text-lg leading-snug">
                Mais conhecimento <br />
                <span className="text-sm">para um futuro mais doce ♡</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. BLOCO DE 4 DESTAQUES DE INFRAESTRUTURA & BENEFÍCIOS
            ========================================================================= */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="rounded-2xl bg-white border border-[#EFE4DC] p-5 flex items-center gap-4 confeitaria-card-shadow">
            <div className="size-12 rounded-xl bg-[#FDF2ED] flex items-center justify-center text-[#B75675] shrink-0 border border-[#E0BCBC]/50">
              <Store className="size-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#4B290D]">Novos ambientes</div>
              <div className="text-xs text-[#73594C] mt-0.5">Um espaço mais moderno e completo para você.</div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#EFE4DC] p-5 flex items-center gap-4 confeitaria-card-shadow">
            <div className="size-12 rounded-xl bg-[#FDF2ED] flex items-center justify-center text-[#B75675] shrink-0 border border-[#E0BCBC]/50">
              <Tag className="size-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#4B290D]">Promoções exclusivas</div>
              <div className="text-xs text-[#73594C] mt-0.5">Condições especiais durante o evento.</div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#EFE4DC] p-5 flex items-center gap-4 confeitaria-card-shadow">
            <div className="size-12 rounded-xl bg-[#FDF2ED] flex items-center justify-center text-[#B75675] shrink-0 border border-[#E0BCBC]/50">
              <Coffee className="size-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#4B290D]">Café da manhã</div>
              <div className="text-xs text-[#73594C] mt-0.5">Um momento especial com clientes e parceiros.</div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#EFE4DC] p-5 flex items-center gap-4 confeitaria-card-shadow">
            <div className="size-12 rounded-xl bg-[#FDF2ED] flex items-center justify-center text-[#B75675] shrink-0 border border-[#E0BCBC]/50">
              <Star className="size-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#4B290D]">Especialistas do mercado</div>
              <div className="text-xs text-[#73594C] mt-0.5">Dicas e novidades para o seu negócio.</div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            5. RODAPÉ DECORATIVO INSTITUCIONAL (SEM TOCAR NO FOOTER GLOBAL)
            ========================================================================= */}
        <div className="mt-14 sm:mt-18 pt-8 border-t border-[#EFE4DC] text-center">
          <div className="inline-flex items-center justify-center size-10 rounded-full bg-[#FDF2ED] border border-[#E0BCBC]/60 text-[#B75675] mb-3">
            <ChefHat className="size-5" />
          </div>
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#A8968B]">
            CONHECIMENTO · TÉCNICA · SABOR · GRANDES RESULTADOS
          </p>
        </div>
      </section>
    </div>
  );
}
