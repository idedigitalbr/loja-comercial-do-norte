'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  MapPin,
  MessageCircle,
  Share2,
  Sparkles,
  Ticket,
} from 'lucide-react';
import type { EventItem } from '@/lib/events-data';

export type ConfeitariaWorkshopSingleProps = {
  event: EventItem;
  breadcrumbParent?: {
    label: string;
    href: string;
  };
};

export function ConfeitariaWorkshopSingle({
  event,
  breadcrumbParent = {
    label: 'Workshops · Aulas Confeitaria',
    href: '/eventos/workshops/aulas-confeitaria',
  },
}: ConfeitariaWorkshopSingleProps) {
  // 1. Contador Regressivo em Tempo Real (DIAS, HORAS, MINUTOS, SEGUNDOS)
  const [timeLeft, setTimeLeft] = useState({
    days: 29,
    hours: 8,
    minutes: 39,
    seconds: 59,
  });

  useEffect(() => {
    // Calcula diferença para uma data futura
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 29);
    targetDate.setHours(8, 0, 0, 0);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // WhatsApp e URLs
  const whatsappUrl = useMemo(() => {
    const rawNumber = '5591983440880';
    const message = `Olá! Gostaria de garantir minha vaga no workshop "${event.title}".`;
    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`;
  }, [event.title]);

  const whatsappDuvidasUrl = useMemo(() => {
    const rawNumber = '5591983440880';
    const message = `Olá! Tenho algumas dúvidas sobre o workshop "${event.title}".`;
    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`;
  }, [event.title]);

  const mapsUrl = useMemo(() => {
    if (event.locationAddress) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        event.locationAddress
      )}`;
    }
    return 'https://maps.google.com/?q=Comercial+do+Norte+Belem';
  }, [event.locationAddress]);

  const mapEmbedUrl = useMemo(() => {
    const query = encodeURIComponent(
      event.locationAddress || 'Comercial do Norte Belém'
    );
    return `https://www.google.com/maps?q=${query}&output=embed`;
  }, [event.locationAddress]);

  // Imagem principal de destaque (prioriza posterUrl ou heroUrl ou fallback oficial)
  const displayImageUrl =
    event.posterUrl ||
    event.heroUrl ||
    '/assets/confeitaria/01-listagem-eventos/04-card-brigadeiros-gourmet.jpg';

  const fullDateDisplay = `${event.eventDateText || 'Data a confirmar'} às ${
    event.eventTime || '08:00'
  }`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" data-event-theme="light">
      {/* ======================================================== */}
      {/* 1. HERO SUPERIOR VINHO / BORGONHA COM CONTADOR          */}
      {/* ======================================================== */}
      <section className="relative bg-[#3D0C14] text-white pt-8 pb-14 px-4 sm:px-6 overflow-hidden">
        <div className="cn-container max-w-5xl mx-auto">
          {/* Botão ← Voltar estilo pill */}
          <div className="flex items-center">
            <Link
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors shadow-xs"
              href={breadcrumbParent.href}
            >
              <ArrowLeft className="size-3.5" />
              <span>Voltar</span>
            </Link>
          </div>

          {/* Título Principal Centralizado */}
          <h1 className="mt-6 text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold text-white text-center tracking-tight leading-tight max-w-4xl mx-auto">
            {event.title}
          </h1>

          {/* Subtítulo com Ícone de Calendário */}
          <div className="mt-3 flex items-center justify-center gap-2 text-white/90 text-xs sm:text-sm font-medium">
            <Calendar className="size-4 text-rose-300" />
            <span>{fullDateDisplay}</span>
          </div>

          {/* Contador Regressivo em Caixas Pontilhadas (DIAS, HORAS, MINUTOS, SEGUNDOS) */}
          <div className="mt-8 flex items-center justify-center gap-2.5 sm:gap-4 md:gap-6">
            {/* Dias */}
            <div className="flex flex-col items-center justify-center w-16 sm:w-20 md:w-24 py-2 sm:py-3 rounded-xl border border-dashed border-white/40 bg-white/5 backdrop-blur-xs shadow-xs text-white">
              <span className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight tabular-nums">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10.5px] tracking-wider uppercase font-bold text-white/80 mt-0.5">
                Dias
              </span>
            </div>

            {/* Horas */}
            <div className="flex flex-col items-center justify-center w-16 sm:w-20 md:w-24 py-2 sm:py-3 rounded-xl border border-dashed border-white/40 bg-white/5 backdrop-blur-xs shadow-xs text-white">
              <span className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight tabular-nums">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10.5px] tracking-wider uppercase font-bold text-white/80 mt-0.5">
                Horas
              </span>
            </div>

            {/* Minutos */}
            <div className="flex flex-col items-center justify-center w-16 sm:w-20 md:w-24 py-2 sm:py-3 rounded-xl border border-dashed border-white/40 bg-white/5 backdrop-blur-xs shadow-xs text-white">
              <span className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight tabular-nums">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10.5px] tracking-wider uppercase font-bold text-white/80 mt-0.5">
                Minutos
              </span>
            </div>

            {/* Segundos */}
            <div className="flex flex-col items-center justify-center w-16 sm:w-20 md:w-24 py-2 sm:py-3 rounded-xl border border-dashed border-white/40 bg-white/5 backdrop-blur-xs shadow-xs text-white">
              <span className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight tabular-nums text-rose-300">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10.5px] tracking-wider uppercase font-bold text-white/80 mt-0.5">
                Segundos
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. CORPO PRINCIPAL EM 2 COLUNAS (BANNER + TEXTO / SIDEBAR) */}
      {/* ======================================================== */}
      <main className="cn-container max-w-5xl mx-auto py-10 sm:py-14 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ---------------------------------------------------- */}
          {/* COLUNA ESQUERDA: BANNER, TÍTULO E CORPO DO TEXTO     */}
          {/* ---------------------------------------------------- */}
          <div className="lg:col-span-8 space-y-6">
            {/* Banner do Evento (Arredondado com proporção 16:9) */}
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900">
              <Image
                alt={event.title}
                className="size-full object-cover"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 720px"
                src={displayImageUrl}
                unoptimized
              />
            </div>

            {/* Tag e Título */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#E2091E] text-white text-[11px] font-bold uppercase tracking-wider">
                  <Sparkles className="size-3" />
                  {event.badge || 'Workshop Confeitaria'}
                </span>
                {event.instructor && (
                  <span className="text-xs text-slate-500 font-medium">
                    com <strong>{event.instructor}</strong>
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {event.title}
              </h2>

              {event.subtitle && (
                <p className="text-base text-slate-600 font-medium italic">
                  {event.subtitle}
                </p>
              )}
            </div>

            {/* Caixa de Texto / Descrição Completa */}
            <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 pt-2">
              <p>{event.description}</p>

              {/* Tópicos e Destaques do Conteúdo */}
              <div className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4 mt-6">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                  O que você vai aprender nesta aula prática:
                </h3>

                <ul className="space-y-2.5 text-sm text-slate-700">
                  {(
                    event.whatYouWillLearn || [
                      'Técnicas profissionais de preparo, textura e cremosidade ideal',
                      'Finalização estética impecável para bolos, doces finos e sobremesas',
                      'Boas práticas de conservação e transporte para delivery',
                      'Sugestões de embalagens adequadas para valorizar seu produto e aumentar vendas',
                      'Dicas de cálculo de custo e precificação inteligente para lucrar mais',
                    ]
                  ).map((item, idx) => (
                    <li className="flex items-start gap-2.5" key={idx}>
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mt-0.5">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Informações Importantes */}
              <div className="rounded-2xl bg-rose-50/70 p-5 border border-rose-100 text-rose-950 text-xs sm:text-sm space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-rose-900">
                  <Ticket className="size-4 text-rose-600" />
                  Informações Importantes:
                </p>
                <p>
                  • Vagas limitadas por turma para garantir atendimento individualizado e prática de qualidade.
                </p>
                <p>
                  • Todos os insumos utilizados durante a aula são fornecidos pela Comercial do Norte.
                </p>
                <p>
                  • Ao final do curso você recebe o certificado de participação e leva suas produções para casa!
                </p>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* COLUNA DIREITA: SIDEBAR COM DATA, LOCAL, MAPA E AÇÃO */}
          {/* ---------------------------------------------------- */}
          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            <div className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200/90 shadow-md space-y-5">
              {/* Data e Horário */}
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-800">
                  <Calendar className="size-4.5" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Data e Horário
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {event.eventDateText}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    Horário: {event.eventTime}
                  </p>
                </div>
              </div>

              {/* Localização e Endereço */}
              <div className="flex items-start gap-3 border-t border-slate-100 pt-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
                  <MapPin className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Localização
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {event.location || 'Loja Comercial do Norte'}
                  </p>
                  <p className="text-xs text-slate-500 font-medium leading-snug">
                    {event.locationAddress || 'Belém - PA'}
                  </p>

                  <a
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#004CB1] hover:underline"
                    href={mapsUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span>Abrir no Maps</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>

              {/* Mini Mapa Embed do Google Maps */}
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <iframe
                  className="size-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapEmbedUrl}
                  title={`Local do workshop ${event.title}`}
                />
              </div>

              {/* Compartilhar nas Redes */}
              <div className="border-t border-slate-100 pt-4">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Compartilhar
                </span>
                <div className="flex items-center gap-2">
                  <a
                    aria-label="Compartilhar no Facebook"
                    className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-white hover:opacity-90 transition"
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      typeof window !== 'undefined' ? window.location.href : ''
                    )}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="text-xs font-bold">f</span>
                  </a>
                  <a
                    aria-label="Compartilhar no WhatsApp"
                    className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white hover:opacity-90 transition"
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Confira o workshop "${event.title}" na Comercial do Norte!`
                    )}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <MessageCircle className="size-4" />
                  </a>
                  <a
                    aria-label="Compartilhar no LinkedIn"
                    className="flex size-8 items-center justify-center rounded-full bg-sky-700 text-white hover:opacity-90 transition"
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      typeof window !== 'undefined' ? window.location.href : ''
                    )}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="text-xs font-bold">in</span>
                  </a>
                </div>
              </div>

              {/* Botão Precisa de Ajuda? */}
              <div className="pt-2">
                <a
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#004CB1] hover:bg-[#00357B] text-white py-3 text-xs sm:text-sm font-bold transition shadow-sm"
                  href={whatsappDuvidasUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <HelpCircle className="size-4" />
                  <span>Precisa de ajuda?</span>
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* ======================================================== */}
        {/* 3. SEÇÃO INFERIOR DE INSCRIÇÃO / CTA DE CONVERSÃO        */}
        {/* ======================================================== */}
        <section className="mt-14 sm:mt-18 pt-10 sm:pt-14 border-t border-slate-200 text-center space-y-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Garanta já seu ingresso e viva uma experiência única!
          </h2>

          <p className="text-sm font-semibold text-[#004CB1]">
            Faça sua Inscrição
          </p>

          <div className="pt-2 flex justify-center">
            <a
              aria-label={`Obter meu ingresso para o workshop ${event.title}`}
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#004CB1] hover:bg-[#00357B] text-white font-extrabold text-sm sm:text-base px-8 py-3.5 shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider"
              href={whatsappUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Ticket className="size-5" />
              <span>Obter meu ingresso</span>
            </a>
          </div>

          <p className="text-xs text-slate-400 font-medium pt-1">
            {fullDateDisplay}
          </p>
        </section>
      </main>

      {/* Rodapé institucional sutil */}
      <footer className="bg-[#3D0C14] py-4 text-center text-xs text-white/70 border-t border-white/10">
        <p>
          © {new Date().getFullYear()} Comercial do Norte — Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
}
