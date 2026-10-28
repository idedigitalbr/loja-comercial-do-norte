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
  Users,
  TrendingUp,
  Share2,
  CalendarDays,
  GraduationCap,
  Sparkles,
  Mic,
  Store,
  ChevronLeft,
  X,
} from 'lucide-react';
import type { EventItem } from '@/lib/events-data';

export type EventsViewProps = {
  initialEvents: EventItem[];
};

type CategoryFilter = 'todos' | 'workshops' | 'aulas-show' | 'palestras' | 'reinauguracoes';

export function EventsView({ initialEvents }: EventsViewProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Categorização inteligente para cada evento
  const getEventCategory = (event: EventItem): CategoryFilter => {
    if (event.categoryKey) return event.categoryKey;
    const text = `${event.badge || ''} ${event.title} ${event.subtitle || ''} ${event.slug}`.toLowerCase();
    if (text.includes('workshop')) return 'workshops';
    if (text.includes('aula') || text.includes('croquete')) return 'aulas-show';
    if (text.includes('palestra') || text.includes('empreendedor') || text.includes('gestao') || text.includes('gestão'))
      return 'palestras';
    if (text.includes('reinaugura') || text.includes('inaugura')) return 'reinauguracoes';
    return 'workshops';
  };

  // Contadores dinâmicos para os botões de filtro
  const categoryCounts = useMemo(() => {
    const counts = {
      todos: initialEvents.length,
      workshops: 0,
      'aulas-show': 0,
      palestras: 0,
      reinauguracoes: 0,
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
      // 1. Filtro de categoria
      if (activeCategory !== 'todos') {
        const cat = getEventCategory(event);
        if (cat !== activeCategory) return false;
      }

      // 2. Filtro de texto de busca
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

  // Paginação (8 itens por página)
  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const displayedEvents = filteredEvents.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const handleCategoryChange = (cat: CategoryFilter) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  return (
    <div className="w-full bg-[#070B14] min-h-screen text-white">
      {/* 1. HERO BANNER CINEMATOGRÁFICO COM FOTOGRAFIA DE ALTA QUALIDADE */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#070B14]">
        {/* Fotografia em alta definição no topo com filtro escuro na esquerda */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <Image
            alt="Eventos e Capacitação Comercial do Norte"
            className="size-full object-cover object-right md:object-[78%_center] opacity-90"
            fill
            priority
            quality={100}
            sizes="100vw"
            src="/assets/evento/hero-eventos.png"
            unoptimized
          />

          {/* Gradiente escuro na esquerda para contraste e legibilidade perfeita */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070B14] via-[#070B14]/95 via-35% md:via-48% lg:via-52% to-transparent" />

          {/* Gradiente vertical para suavizar conexão superior e inferior */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-transparent to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070B14]/80 via-transparent to-transparent" />

          {/* Ambient glow red & blue simulando a iluminação de palco */}
          <div className="absolute -top-24 left-10 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
        </div>

        {/* Conteúdo textual do Hero */}
        <div className="cn-container relative z-10 py-10 sm:py-14 lg:py-16">
          {/* Breadcrumb */}
          <nav aria-label="Você está aqui" className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-6">
            <Link className="hover:text-white transition-colors" href="/">
              Início
            </Link>
            <ChevronRight className="size-3 text-slate-500" />
            <span className="font-semibold text-white">Eventos</span>
          </nav>

          <div className="max-w-2xl">
            {/* Tagline / Eyebrow Oficial */}
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="h-1 w-6 rounded-full bg-[#E2091E]" />
              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E2091E]">Nossos Eventos</span>
            </div>

            {/* Headline Principal */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.12]">
              Aprenda, conecte-se e<br className="hidden sm:inline" /> faça seu negócio crescer
            </h1>

            {/* Subtítulo */}
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Acompanhe nossa agenda de workshops, aulas-show, inaugurações e encontros de capacitação com especialistas do
              mercado.
            </p>

            {/* 3 Pilares com Ícones */}
            <div className="mt-8 flex flex-wrap items-center gap-6 sm:gap-8 pt-5 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300">
                  <Users className="size-5" />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-200 leading-snug">
                  Especialistas<br />
                  <span className="text-slate-400 font-normal">do mercado</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300">
                  <TrendingUp className="size-5" />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-200 leading-snug">
                  Conteúdo<br />
                  <span className="text-slate-400 font-normal">prático e atual</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300">
                  <Share2 className="size-5" />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-200 leading-snug">
                  Networking<br />
                  <span className="text-slate-400 font-normal">e novas oportunidades</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ÁREA DE CONTEÚDO PRINCIPAL (FILTROS + GRID + PAGINAÇÃO) */}
      <section className="cn-container py-8 sm:py-12">
        {/* Barra de Filtros e Busca */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8 sm:mb-10">
          {/* Categorias (Pills) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Todos os eventos */}
            <button
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeCategory === 'todos'
                  ? 'bg-[#E2091E] text-white shadow-lg shadow-red-950/50'
                  : 'bg-[#0E1627] text-slate-300 border border-white/10 hover:border-white/25 hover:text-white hover:bg-[#141E34]'
              }`}
              onClick={() => handleCategoryChange('todos')}
              type="button"
            >
              <CalendarDays className="size-3.5" />
              <span>Todos os eventos</span>
            </button>

            {/* Workshops */}
            <button
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeCategory === 'workshops'
                  ? 'bg-[#E2091E] text-white shadow-lg shadow-red-950/50'
                  : 'bg-[#0E1627] text-slate-300 border border-white/10 hover:border-white/25 hover:text-white hover:bg-[#141E34]'
              }`}
              onClick={() => handleCategoryChange('workshops')}
              type="button"
            >
              <GraduationCap className="size-3.5" />
              <span>Workshops ({categoryCounts.workshops})</span>
            </button>

            {/* Aulas-show */}
            <button
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeCategory === 'aulas-show'
                  ? 'bg-[#E2091E] text-white shadow-lg shadow-red-950/50'
                  : 'bg-[#0E1627] text-slate-300 border border-white/10 hover:border-white/25 hover:text-white hover:bg-[#141E34]'
              }`}
              onClick={() => handleCategoryChange('aulas-show')}
              type="button"
            >
              <Sparkles className="size-3.5" />
              <span>Aulas-show ({categoryCounts['aulas-show']})</span>
            </button>

            {/* Palestras */}
            <button
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeCategory === 'palestras'
                  ? 'bg-[#E2091E] text-white shadow-lg shadow-red-950/50'
                  : 'bg-[#0E1627] text-slate-300 border border-white/10 hover:border-white/25 hover:text-white hover:bg-[#141E34]'
              }`}
              onClick={() => handleCategoryChange('palestras')}
              type="button"
            >
              <Mic className="size-3.5" />
              <span>Palestras ({categoryCounts.palestras})</span>
            </button>

            {/* Reinaugurações */}
            <button
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeCategory === 'reinauguracoes'
                  ? 'bg-[#E2091E] text-white shadow-lg shadow-red-950/50'
                  : 'bg-[#0E1627] text-slate-300 border border-white/10 hover:border-white/25 hover:text-white hover:bg-[#141E34]'
              }`}
              onClick={() => handleCategoryChange('reinauguracoes')}
              type="button"
            >
              <Store className="size-3.5" />
              <span>Reinaugurações ({categoryCounts.reinauguracoes})</span>
            </button>
          </div>

          {/* Campo de Busca de Eventos */}
          <div className="relative w-full lg:w-72">
            <input
              className="w-full rounded-full bg-[#0E1627] border border-white/10 px-4 py-2.5 pr-10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors"
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar evento..."
              type="text"
              value={searchQuery}
            />
            {searchQuery ? (
              <button
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                onClick={() => handleSearchChange('')}
                type="button"
              >
                <X className="size-3.5" />
              </button>
            ) : (
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            )}
          </div>
        </div>

        {/* Grid de 4 Colunas de Cartões de Eventos */}
        {displayedEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedEvents.map((event) => {
              const isBlue = event.buttonVariant === 'blue';
              const detailHref = `/evento/${event.slug}`;

              return (
                <article
                  className="group flex flex-col rounded-2xl bg-[#0C1220]/95 border border-white/10 hover:border-red-500/50 hover:shadow-[0_16px_40px_rgba(226,9,30,0.22)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  key={event.id}
                >
                  {/* Cabeçalho de Imagem */}
                  <Link className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950 block" href={detailHref}>
                    {event.posterUrl ? (
                      <Image
                        alt={event.title}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        src={event.posterUrl}
                        unoptimized
                      />
                    ) : (
                      <div className="flex size-full flex-col items-center justify-center p-6 text-center text-slate-500">
                        <Calendar className="size-10 stroke-1 text-[#E2091E]" />
                        <span className="mt-2 text-xs">Imagem do evento</span>
                      </div>
                    )}

                    {/* Badge Oficial Flutuante */}
                    {event.badge ? (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center rounded-full bg-[#E2091E] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md shadow-black/50">
                          {event.badge}
                        </span>
                      </div>
                    ) : null}

                    {/* Gradiente sutil inferior na foto */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0C1220] via-transparent to-transparent opacity-90 pointer-events-none" />
                  </Link>

                  {/* Corpo do Cartão */}
                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Linha de Data e Horário */}
                      <div className="flex items-center gap-3 text-xs text-slate-300 font-semibold">
                        {event.eventDateText ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-3.5 text-slate-400 shrink-0" />
                            <span>{event.eventDateText}</span>
                          </div>
                        ) : null}

                        {event.eventTime ? (
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3.5 text-slate-400 shrink-0" />
                            <span>{event.eventTime}</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Título do Evento */}
                      <h2 className="mt-2.5 text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                        <Link href={detailHref}>{event.title}</Link>
                      </h2>

                      {/* Subtítulo / Descrição */}
                      <p className="mt-1.5 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {event.subtitle ? (
                          <span className="font-semibold text-slate-300 block mb-0.5">{event.subtitle}</span>
                        ) : null}
                        {event.description}
                      </p>
                    </div>

                    {/* Rodapé do Cartão com Local e Botão de Ação */}
                    <div className="mt-4 pt-3 border-t border-white/10">
                      {/* Localização */}
                      {event.location ? (
                        <div className="flex items-start gap-1.5 text-xs text-slate-300 font-medium">
                          <MapPin className="size-3.5 text-[#E2091E] shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            {event.location}
                            {event.locationAddress && event.locationAddress !== event.location
                              ? ` · ${event.locationAddress}`
                              : ''}
                          </span>
                        </div>
                      ) : null}

                      {/* Botão de Ação */}
                      <Link
                        className={`w-full mt-4 py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 group/btn ${
                          isBlue
                            ? 'border border-blue-500/50 bg-blue-950/20 text-white hover:bg-blue-600 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-950/50'
                            : 'border border-red-500/50 bg-red-950/20 text-white hover:bg-[#E2091E] hover:border-[#E2091E] hover:shadow-lg hover:shadow-red-950/50'
                        }`}
                        href={event.ctaUrl || detailHref}
                        {...(event.ctaUrl && event.ctaUrl.startsWith('http')
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        <span>{event.ctaLabel || 'Ver Detalhes'}</span>
                        <ChevronRight className="size-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Estado Vazio Quando Busca não Encontra Nada */
          <div className="rounded-2xl border border-white/10 bg-[#0C1220] p-12 text-center my-6">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400">
              <Search className="size-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Nenhum evento encontrado</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              Não encontramos nenhum evento com os termos ou filtros selecionados. Experimente buscar por outros termos.
            </p>
            <button
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#E2091E] px-5 py-2 text-xs font-bold text-white hover:bg-[#c40819] transition cursor-pointer"
              onClick={() => {
                setActiveCategory('todos');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              type="button"
            >
              <span>Ver todos os eventos</span>
            </button>
          </div>
        )}

        {/* 3. PAGINAÇÃO OFICIAL */}
        {totalPages > 0 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            {/* Botão Anterior */}
            <button
              aria-label="Página anterior"
              className="flex size-9 items-center justify-center rounded-full bg-[#0E1627] border border-white/10 text-slate-400 hover:border-white/25 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer text-xs"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              type="button"
            >
              <ChevronLeft className="size-4" />
            </button>

            {/* Números de Página */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                aria-label={`Página ${pageNum}`}
                className={`flex size-9 items-center justify-center rounded-full text-xs font-bold transition cursor-pointer ${
                  safePage === pageNum
                    ? 'bg-[#E2091E] text-white shadow-md shadow-red-950/60 scale-105'
                    : 'bg-[#0E1627] border border-white/10 text-slate-400 hover:border-white/25 hover:text-white'
                }`}
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                type="button"
              >
                {pageNum}
              </button>
            ))}

            {/* Botão Próximo */}
            <button
              aria-label="Próxima página"
              className="flex size-9 items-center justify-center rounded-full bg-[#0E1627] border border-white/10 text-slate-400 hover:border-white/25 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer text-xs"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              type="button"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
