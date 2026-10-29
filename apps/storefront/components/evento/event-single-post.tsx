'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  User,
  Plus,
  Minus,
  Store,
  Tag,
  Coffee,
  Star,
  CheckCircle2,
  Gift,
  Headphones,
  Map as MapIcon,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import styles from './event-theme.module.css';
import { cn } from '@commerce/ui/web';
import type { ApiEvent } from '@/lib/api';

export type EventSinglePostProps = {
  event: ApiEvent;
  theme?: 'dark' | 'light';
};

// Dados complementares para garantir fidelidade pixel-perfect
const DEFAULT_SCHEDULE = [
  {
    time: '08h00',
    title: 'Recepção e café da manhã',
    description: 'Recepção dos convidados e parceiros.',
  },
  {
    time: '09h00',
    title: 'Abertura oficial',
    description: 'Apresentação do novo espaço e novidades.',
  },
  {
    time: '10h00',
    title: 'Demonstração de produtos',
    description: 'Principais lançamentos e soluções para o seu negócio.',
  },
  {
    time: '12h00',
    title: 'Promoções exclusivas',
    description: 'Condições especiais apenas para o evento.',
  },
  {
    time: '14h00',
    title: 'Encerramento',
    description: 'Agradecimento e sorteios de brindes.',
  },
];

const DEFAULT_HIGHLIGHTS = [
  {
    icon: Store,
    title: 'Novos ambientes',
    description: 'Um espaço mais moderno e completo para você.',
  },
  {
    icon: Tag,
    title: 'Promoções exclusivas',
    description: 'Condições especiais durante o evento.',
  },
  {
    icon: Coffee,
    title: 'Café da manhã',
    description: 'Um momento especial com clientes e parceiros.',
  },
  {
    icon: Star,
    title: 'Especialistas do mercado',
    description: 'Dicas e novidades para o seu negócio.',
  },
];

const DEFAULT_EXPECTATIONS = [
  {
    icon: Store,
    title: 'Loja ampliada',
    description: 'Mais espaço e variedade de produtos.',
  },
  {
    icon: CheckCircle2,
    title: 'Condições exclusivas',
    description: 'Promoções válidas apenas no evento.',
  },
  {
    icon: Gift,
    title: 'Sorteios e brindes',
    description: 'Participe e concorra a prêmios especiais.',
  },
  {
    icon: Headphones,
    title: 'Atendimento especializado',
    description: 'Converse com nossa equipe e tire suas dúvidas.',
  },
];

const GALLERY_PHOTOS = [
  {
    src: '/assets/evento/gallery-foto-1.png',
    alt: 'Fachada e recepção da loja Comercial do Norte',
  },
  {
    src: '/assets/evento/gallery-foto-2.png',
    alt: 'Clientes e corredores repletos de produtos',
  },
  {
    src: '/assets/evento/gallery-foto-3.png',
    alt: 'Decoração especial e grande movimento na loja',
  },
  {
    src: '/assets/evento/gallery-foto-4.png',
    alt: 'Equipe Comercial do Norte prestando consultoria especializada',
  },
];

export function EventSinglePost({ event, theme = 'dark' }: EventSinglePostProps) {
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [carouselOffset, setCarouselOffset] = useState<number>(0);

  // Valores canônicos com fallback idêntico à referência visual
  const isPedreira =
    event.slug === 'grande-reinauguracao-loja-pedreira' ||
    event.title.toLowerCase().includes('pedreira');

  const title = event.title || 'Grande Reinauguração Loja Pedreira';
  const subtitle =
    event.subtitle || 'Onde tem Comercial do Norte você vende muito mais';
  const badgeLabel = event.badge || 'REINAUGURAÇÃO';
  const eventDate = event.eventDateText || '03 de Julho de 2026';
  const eventTime = event.eventTime || '08h às 14h';
  const locationName = event.location || 'Loja Pedreira';
  const locationCity = 'Belém/PA';
  const locationAddress =
    event.locationAddress ||
    'Travessa Mauriti, entre Pedro Miranda e Antônio Everdosa\nPedreira, Belém/PA';

  const posterImage =
    event.posterUrl ||
    '/assets/HOME Vitrine/S12-EVENTOS/s12-event-02-reinauguracao.jpg';

  const whatsappPhone = '5591983440880';
  const confirmMsg = encodeURIComponent(
    `Olá! Gostaria de confirmar minha presença no evento "${title}" da Comercial do Norte para ${ticketCount} ${
      ticketCount === 1 ? 'pessoa' : 'pessoas'
    }.`
  );
  const doubtsMsg = encodeURIComponent(
    `Olá! Gostaria de tirar algumas dúvidas sobre o evento "${title}" da Comercial do Norte.`
  );

  const confirmUrl = `https://wa.me/${whatsappPhone}?text=${confirmMsg}`;
  const doubtsUrl = `https://wa.me/${whatsappPhone}?text=${doubtsMsg}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `Comercial do Norte ${locationName} ${locationAddress}`
  )}`;

  const handlePrevPhoto = () => {
    setCarouselOffset((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNextPhoto = () => {
    setCarouselOffset((prev) => (prev < GALLERY_PHOTOS.length - 1 ? prev + 1 : prev));
  };

  return (
    <div
      data-event-theme={theme}
      className={cn(
        theme === 'light' && styles.light,
        'relative w-full bg-[var(--event-page,#060709)] bg-[linear-gradient(to_right,var(--event-grid,#ffffff05)_1px,transparent_1px),linear-gradient(to_bottom,var(--event-grid,#ffffff05)_1px,transparent_1px)] bg-[size:32px_32px] text-[var(--event-foreground,#fff)] selection:bg-[#E2091E] selection:text-white pb-20'
      )}
    >
      {/* Luzes atmosféricas de fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 size-[500px] rounded-full bg-[#E2091E]/12 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-48 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-[#E2091E]/10 blur-[160px]"
      />

      <div className="cn-container relative z-10 pt-6 sm:pt-8">
        {/* Breadcrumb oficial */}
        <nav aria-label="Você está aqui" className="text-xs text-[var(--event-muted,#94a3b8)] mb-8 sm:mb-10">
          <Link className="transition hover:text-[var(--event-foreground,#fff)]" href="/">
            Início
          </Link>
          <span className="mx-2 text-slate-600">/</span>
          <Link className="transition hover:text-[var(--event-foreground,#fff)]" href="/evento">
            Eventos
          </Link>
          <span className="mx-2 text-slate-600">/</span>
          <span className="font-semibold text-[var(--event-foreground,#fff)]">{title}</span>
        </nav>

        {/* HERO SECTION — 3 COLUNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">
          {/* Coluna 1: Informações Principais */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {/* Badges superiores */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center rounded-full bg-[#E2091E] px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md shadow-red-950/40">
                {badgeLabel}
              </span>
              <span className="inline-flex items-center rounded-full border border-[#b38a16]/40 bg-[#422e06]/60 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#fde047]">
                Evento Presencial
              </span>
            </div>

            {/* Título Oficial */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-[var(--event-foreground,#fff)] leading-[1.12]">
              {title}
            </h1>

            {/* Subtítulo / Slogan */}
            {subtitle ? (
              <p className="mt-2.5 text-base sm:text-lg font-medium text-[var(--event-secondary,#cbd5e1)]">
                {subtitle}
              </p>
            ) : null}

            {/* Descrição resumida da chamada */}
            <p className="mt-4 text-xs sm:text-sm text-[var(--event-muted,#94a3b8)] leading-relaxed max-w-lg">
              {isPedreira
                ? 'Venha participar da reinauguração da nossa loja na Pedreira! Um novo espaço, mais variedade, promoções exclusivas e um café da manhã especial para clientes e parceiros.'
                : event.description}
            </p>

            {/* Grid compacto de 3 Metadados com Ícones Vermelhos */}
            <div className="mt-8 flex flex-wrap items-center gap-5 sm:gap-7 border-t border-[var(--event-border,#ffffff10)] pt-6">
              {/* Data */}
              <div className="flex items-center gap-2.5">
                <Calendar className="size-4 shrink-0 text-[#E2091E]" />
                <span className="text-xs sm:text-sm font-semibold text-[var(--event-secondary,#e2e8f0)]">
                  {eventDate}
                </span>
              </div>

              {/* Horário */}
              <div className="flex items-center gap-2.5">
                <Clock className="size-4 shrink-0 text-[#E2091E]" />
                <span className="text-xs sm:text-sm font-semibold text-[var(--event-secondary,#e2e8f0)]">
                  {eventTime}
                </span>
              </div>

              {/* Local */}
              <div className="flex items-center gap-2.5">
                <MapPin className="size-4 shrink-0 text-[#E2091E]" />
                <div className="flex flex-col leading-tight">
                  <span className="text-xs sm:text-sm font-semibold text-[var(--event-secondary,#e2e8f0)]">
                    {locationName}
                  </span>
                  <span className="text-[11px] text-[var(--event-muted,#94a3b8)]">{locationCity}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2: Mockup de Smartphone com Cartaz */}
          <div className="lg:col-span-3 flex justify-center py-2">
            <div className="relative mx-auto w-full max-w-[270px] aspect-[9/18.5] rounded-[44px] p-2 bg-[#12161f] border-[6px] border-[#222834] shadow-[0_25px_60px_-15px_rgba(226,9,30,0.35),0_0_35px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-black rounded-full z-30 flex items-center justify-end pr-2 pointer-events-none">
                <div className="size-1.5 rounded-full bg-[#1c2230]/70" />
              </div>

              {/* Tela do Celular com Cartaz */}
              <div className="relative size-full rounded-[34px] overflow-hidden bg-black">
                <Image
                  alt={title}
                  className="size-full object-cover"
                  fill
                  priority
                  sizes="(max-width: 1024px) 270px, 320px"
                  src={posterImage}
                />
                {/* Reflexo vítreo diagonal */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15" />
              </div>
            </div>
          </div>

          {/* Coluna 3: Card de Inscrição "Garanta seu ingresso" */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <div className="rounded-2xl border border-[var(--event-border,#ffffff10)] bg-[var(--event-surface,#0d121c)] backdrop-blur-md p-6 sm:p-7 shadow-2xl">
              {/* Badge Gratuito */}
              <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--event-success,#34d399)]">
                Evento Gratuito
              </span>

              {/* Título do Card */}
              <h2 className="mt-3.5 text-xl sm:text-2xl font-black text-[var(--event-foreground,#fff)] tracking-tight">
                Garanta seu ingresso
              </h2>
              <p className="mt-1 text-xs text-[var(--event-muted,#94a3b8)] leading-relaxed">
                Escolha a quantidade de pessoas e confirme sua presença. As vagas são limitadas!
              </p>

              {/* Seletor de Quantidade */}
              <div className="mt-6">
                <label
                  className="block text-xs font-semibold text-[var(--event-secondary,#cbd5e1)] mb-2"
                  htmlFor="ticket-stepper"
                >
                  Quantidade de ingressos
                </label>
                <div className="flex items-center justify-between gap-3">
                  {/* Stepper */}
                  <div
                    className="flex items-center bg-[var(--event-surface,#151b26)] border border-[var(--event-border,#ffffff10)] rounded-xl px-2 py-1.5 gap-3 shrink-0"
                    id="ticket-stepper"
                  >
                    <button
                      aria-label="Diminuir quantidade de ingressos"
                      className="size-7 rounded-lg flex items-center justify-center text-[var(--event-muted,#94a3b8)] hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      disabled={ticketCount <= 1}
                      onClick={() => setTicketCount((prev) => Math.max(1, prev - 1))}
                      type="button"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="text-sm font-bold text-[var(--event-foreground,#fff)] min-w-5 text-center">
                      {ticketCount}
                    </span>
                    <button
                      aria-label="Aumentar quantidade de ingressos"
                      className="size-7 rounded-lg flex items-center justify-center text-[var(--event-muted,#94a3b8)] hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      disabled={ticketCount >= 5}
                      onClick={() => setTicketCount((prev) => Math.min(5, prev + 1))}
                      type="button"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  {/* Aviso de Limite */}
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--event-muted,#94a3b8)] leading-tight">
                    <User className="size-4 shrink-0 text-[var(--event-muted,#94a3b8)]" />
                    <span>Máximo de 5 ingressos por cadastro.</span>
                  </div>
                </div>
              </div>

              {/* Botão Primário: Confirmar Presença */}
              <a
                className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-[#E2091E] py-3.5 px-5 text-sm font-black text-white shadow-lg shadow-red-950/60 transition duration-200 hover:bg-[#c40819] hover:scale-[1.02] active:scale-[0.98]"
                href={confirmUrl}
                rel="noreferrer"
                target="_blank"
              >
                <Ticket className="size-4" />
                <span>Confirmar Presença</span>
              </a>

              {/* Botão Secundário: Tirar dúvidas */}
              <a
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[var(--event-border,#ffffff20)] bg-white/5 py-3 px-5 text-xs sm:text-sm font-bold text-white transition duration-200 hover:border-[var(--event-border,#ffffff40)] hover:bg-white/10"
                href={doubtsUrl}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle className="size-4 text-[var(--event-success,#34d399)]" />
                <span>Tirar dúvidas no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* 4 CARDS DE DESTAQUES (HORIZONTAL ROW) */}
        <div className="mt-12 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEFAULT_HIGHLIGHTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                className="flex items-start gap-3.5 rounded-2xl border border-[var(--event-border,#ffffff10)] bg-[var(--event-surface,#0c1017)] p-4 backdrop-blur-xs transition hover:border-[var(--event-border,#ffffff20)]"
                key={idx}
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#E2091E]/25 bg-[#E2091E]/15 text-[#E2091E]">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--event-foreground,#fff)]">{item.title}</h3>
                  <p className="mt-0.5 text-xs text-[var(--event-muted,#94a3b8)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* SEÇÃO PRINCIPAL DE CONTEÚDO (2 COLUNAS) */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* COLUNA ESQUERDA: SOBRE O EVENTO + PROGRAMAÇÃO */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Sobre o Evento */}
            <div>
              <h2 className="text-2xl font-black text-[var(--event-foreground,#fff)] tracking-tight">
                Sobre o Evento
              </h2>
              <div className="mt-4 space-y-4 text-sm sm:text-base text-[var(--event-secondary,#cbd5e1)] leading-relaxed">
                {isPedreira ? (
                  <>
                    <p>
                      A reinauguração da nossa loja na Pedreira marca um novo momento para a
                      Comercial do Norte. Um espaço ainda maior, mais produtos, mais variedade e
                      um atendimento especializado para ajudar o seu negócio a crescer.
                    </p>
                    <p>
                      Além de conhecer as novidades, você poderá aproveitar promoções exclusivas,
                      participar de um café da manhã especial e conversar com a nossa equipe de
                      vendas e parceiros.
                    </p>
                  </>
                ) : (
                  <p className="whitespace-pre-line">{event.description}</p>
                )}
              </div>
            </div>

            {/* Programação */}
            <div className="mt-12">
              <h2 className="text-2xl font-black text-[var(--event-foreground,#fff)] tracking-tight">
                Programação
              </h2>

              <div className="mt-6 relative pl-2">
                {/* Linha vertical conectando os pontos */}
                <div className="absolute left-[34px] top-4 bottom-4 w-0.5 bg-[#E2091E]/30" />

                <div className="space-y-6">
                  {DEFAULT_SCHEDULE.map((item, idx) => (
                    <div className="relative flex items-start gap-5" key={idx}>
                      {/* Badge de Horário em Pill Vermelho */}
                      <div className="relative z-10 flex shrink-0 items-center justify-center rounded-full bg-[#E2091E] px-3 py-1 text-xs font-black text-white shadow-md shadow-red-950/50">
                        {item.time}
                      </div>

                      {/* Descrição do Horário */}
                      <div className="pt-0.5">
                        <h4 className="text-sm font-bold text-[var(--event-foreground,#fff)]">
                          {item.title}
                        </h4>
                        <p className="mt-0.5 text-xs text-[var(--event-muted,#94a3b8)]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: LOCAL DO EVENTO + O QUE TE ESPERA */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Card Local do Evento */}
            <div className="rounded-2xl border border-[var(--event-border,#ffffff10)] bg-[var(--event-surface,#0d121c)] p-5 sm:p-6 shadow-xl backdrop-blur-xs">
              <div className="flex items-start gap-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E2091E] text-white shadow-md">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--event-muted,#94a3b8)]">
                    Local do Evento
                  </span>
                  <h3 className="mt-0.5 text-sm sm:text-base font-bold text-[var(--event-foreground,#fff)]">
                    {locationName} - Comercial do Norte
                  </h3>
                  <p className="mt-1 text-xs text-[var(--event-secondary,#cbd5e1)] leading-relaxed whitespace-pre-line">
                    {locationAddress}
                  </p>
                </div>
              </div>

              {/* Mapa estilizado em tema escuro */}
              <div className="mt-4 relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-[var(--event-border,#ffffff10)] bg-[var(--event-surface,#090d14)]">
                <Image
                  alt="Mapa de localização da Loja Pedreira Comercial do Norte"
                  className="size-full object-cover"
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  src="/assets/evento/map-styled-preview.png"
                />

                {/* Botão de rota: Abrir no Google Maps */}
                <div className="absolute inset-x-0 bottom-3 flex justify-center z-10">
                  <a
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--event-border,#ffffff20)] bg-[var(--event-surface,#0f141d)] px-4 py-2 text-xs font-bold text-[var(--event-foreground,#fff)] shadow-lg backdrop-blur-md transition hover:bg-[var(--event-hover,#1a2232)] hover:border-[var(--event-border,#ffffff40)]"
                    href={googleMapsUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MapIcon className="size-3.5 text-[var(--event-secondary,#cbd5e1)]" />
                    <span>Abrir no Google Maps</span>
                  </a>
                </div>
              </div>
            </div>

            {/* O Que Te Espera */}
            <div>
              <h2 className="text-2xl font-black text-[var(--event-foreground,#fff)] tracking-tight mb-4">
                O que te espera
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DEFAULT_EXPECTATIONS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      className="flex items-start gap-3 rounded-2xl border border-[var(--event-border,#ffffff10)] bg-[var(--event-surface,#0c1017)] p-4 transition hover:border-[var(--event-border,#ffffff20)]"
                      key={idx}
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#E2091E]/30 bg-[#E2091E]/10 text-[#E2091E]">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--event-foreground,#fff)]">
                          {item.title}
                        </h4>
                        <p className="mt-0.5 text-xs text-[var(--event-muted,#94a3b8)] leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* GALERIA: "VEJA COMO FOI NA ÚLTIMA EDIÇÃO" */}
        <div className="mt-16 sm:mt-20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-black text-[var(--event-foreground,#fff)] tracking-tight">
              Veja como foi na última edição
            </h2>

            {/* Controles de Carrossel */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                aria-label="Ver fotos anteriores"
                className="size-8 rounded-full border border-[var(--event-border,#ffffff10)] bg-white/5 flex items-center justify-center text-[var(--event-secondary,#cbd5e1)] hover:text-[var(--event-foreground,#fff)] hover:bg-white/15 transition disabled:opacity-30"
                disabled={carouselOffset === 0}
                onClick={handlePrevPhoto}
                type="button"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                aria-label="Ver próximas fotos"
                className="size-8 rounded-full border border-[var(--event-border,#ffffff10)] bg-white/5 flex items-center justify-center text-[var(--event-secondary,#cbd5e1)] hover:text-[var(--event-foreground,#fff)] hover:bg-white/15 transition disabled:opacity-30"
                disabled={carouselOffset >= GALLERY_PHOTOS.length - 1}
                onClick={handleNextPhoto}
                type="button"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="relative">
            {/* Botão anterior flutuante mobile/desktop */}
            <button
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-black/70 border border-[var(--event-border,#ffffff20)] text-white flex items-center justify-center hover:bg-black transition shadow-lg"
              onClick={handlePrevPhoto}
              type="button"
            >
              <ChevronLeft className="size-4" />
            </button>

            {/* Grid / Carrossel de 4 fotos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-hidden">
              {GALLERY_PHOTOS.map((photo, idx) => (
                <button
                  className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[var(--event-border,#ffffff10)] bg-zinc-900 shadow-lg text-left cursor-zoom-in transition duration-300 hover:border-[var(--event-border,#ffffff30)]"
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  type="button"
                >
                  <Image
                    alt={photo.alt}
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    src={photo.src}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                </button>
              ))}
            </div>

            {/* Botão próximo flutuante */}
            <button
              aria-label="Próxima foto"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-black/70 border border-[var(--event-border,#ffffff20)] text-white flex items-center justify-center hover:bg-black transition shadow-lg"
              onClick={handleNextPhoto}
              type="button"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* BANNER INFERIOR "AINDA TEM DÚVIDAS?" */}
        <div className="mt-14 sm:mt-16 rounded-2xl sm:rounded-3xl border border-[#E2091E]/30 bg-gradient-to-r from-[var(--event-banner,#4d070e)] via-[var(--event-banner,#240407)] to-[var(--event-banner,#0d0203)] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#E2091E]/30 bg-[#E2091E]/20 text-[#E2091E] shadow-inner">
              <MessageCircle className="size-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-[var(--event-foreground,#fff)]">
                Ainda tem dúvidas?
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-[var(--event-secondary,#cbd5e1)]">
                Fale com nossa equipe pelo WhatsApp e tire todas as suas dúvidas sobre o evento.
              </p>
            </div>
          </div>

          <a
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E2091E] px-6 py-3.5 text-xs sm:text-sm font-black text-white shadow-xl transition hover:bg-[#c40819] hover:scale-105 active:scale-95 shrink-0"
            href={doubtsUrl}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle className="size-4" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </div>

      {/* MODAL / LIGHTBOX DE FOTO EM EXPANSÃO */}
      {activePhotoIndex !== null ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          role="dialog"
        >
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <button
              aria-label="Fechar foto ampliada"
              className="absolute -top-12 right-0 size-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              onClick={() => setActivePhotoIndex(null)}
              type="button"
            >
              <X className="size-5" />
            </button>

            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-[var(--event-border,#ffffff20)] shadow-2xl">
              <Image
                alt={GALLERY_PHOTOS[activePhotoIndex].alt}
                className="size-full object-cover"
                fill
                sizes="100vw"
                src={GALLERY_PHOTOS[activePhotoIndex].src}
              />
            </div>

            <p className="mt-4 text-xs sm:text-sm text-[var(--event-secondary,#cbd5e1)] text-center font-medium">
              {GALLERY_PHOTOS[activePhotoIndex].alt}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
