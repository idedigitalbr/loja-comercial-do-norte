'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Ticket,
  Plus,
  Minus,
  MessageCircle,
  HelpCircle,
  CheckCircle2,
  UtensilsCrossed,
  Award,
  Sparkles,
  Gift,
  ArrowRight,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import type { ApiEvent } from '@/lib/api';

export type WorkshopSinglePostProps = {
  event: ApiEvent;
  relatedWorkshops?: ApiEvent[];
};

const DEFAULT_WORKSHOP_SCHEDULE = [
  {
    time: 'Etapa 1',
    title: 'Boas-vindas e Ambientação',
    description: 'Recepção dos alunos, entrega das apostilas e introdução aos insumos utilizados.',
  },
  {
    time: 'Etapa 2',
    title: 'Demonstração Técnica e Segredos da Receita',
    description: 'O instrutor demonstra na prática o ponto exato, emulsões, temperaturas e manipulação correta.',
  },
  {
    time: 'Etapa 3',
    title: 'Prática Mão na Massa nas Bancadas',
    description: 'Cada aluno desenvolve as preparações individuais com acompanhamento direto e correção de erros.',
  },
  {
    time: 'Etapa 4',
    title: 'Embalagem, Conservação e Precificação',
    description: 'Dicas de como valorizar o doce com embalagens adequadas e cálculo de margem de lucro.',
  },
  {
    time: 'Etapa 5',
    title: 'Degustação e Entrega dos Certificados',
    description: 'Momento de fotos, degustação das criações e entrega do Certificado Oficial de Conclusão.',
  },
];

export function WorkshopSinglePost({ event, relatedWorkshops = [] }: WorkshopSinglePostProps) {
  const [tickets, setTickets] = useState(1);

  const title = event.title;
  const subtitle = event.subtitle || 'Treinamento Prático Especial no Centro Técnico Comercial do Norte';
  const eventDate = event.eventDateText || 'Consulte próximas turmas';
  const eventTime = event.eventTime || '14h às 18h';
  const locationName = event.location || 'Centro Técnico Comercial do Norte';
  const locationAddress =
    event.locationAddress || 'Av. Bernardo Sayão — Belém/PA (Espaço Gastronômico Climatizado)';
  const instructor = event.instructor || 'Especialista Convidado';
  const badgeLabel = event.badge || 'WORKSHOP CONFEITARIA';

  const whatsappMessage = encodeURIComponent(
    `Olá! Gostaria de garantir ${tickets} vaga(s) no workshop "${title}" no Centro Técnico Comercial do Norte.`
  );
  const whatsappUrl = `https://wa.me/5591983440880?text=${whatsappMessage}`;

  const doubtsMessage = encodeURIComponent(
    `Olá! Tenho dúvidas sobre o workshop "${title}" do Centro Técnico Comercial do Norte.`
  );
  const doubtsUrl = `https://wa.me/5591983440880?text=${doubtsMessage}`;

  return (
    <div className="w-full bg-[#FFFDF9] min-h-screen text-slate-900 pb-20">
      {/* Luz e textura sutil gourmet */}
      <div className="absolute inset-0 bg-[radial-gradient(#b4530910_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="cn-container relative z-10 pt-6 sm:pt-8">
        {/* 1. BREADCRUMB ORGANIZADO ESTILO WORDPRESS */}
        <nav aria-label="Você está aqui" className="text-xs text-amber-900/70 mb-6 flex items-center flex-wrap gap-1.5">
          <Link className="hover:text-amber-800 transition" href="/">
            Início
          </Link>
          <span aria-hidden>/</span>
          <Link className="hover:text-amber-800 transition" href="/eventos">
            Eventos
          </Link>
          <span aria-hidden>/</span>
          <Link className="hover:text-amber-800 transition" href="/eventos/workshops/aulas-confeitaria">
            Workshops · Aulas Confeitaria
          </Link>
          <span aria-hidden>/</span>
          <span className="font-semibold text-amber-950 truncate max-w-[260px] sm:max-w-md">
            {title}
          </span>
        </nav>

        {/* 2. HERO SECTION — 3 COLUNAS NO WHITE MODE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
          {/* Coluna 1: Informações Principais (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {/* Badges superiores */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center rounded-full bg-[#B45309] px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-sm">
                {badgeLabel}
              </span>
              <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-900">
                Aula Prática Presencial
              </span>
            </div>

            {/* Título Oficial */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {title}
            </h1>

            {/* Subtítulo */}
            <p className="mt-2.5 text-base sm:text-lg font-medium text-amber-900/90 leading-snug">
              {subtitle}
            </p>

            {/* Descrição Completa */}
            <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>

            {/* Metadados Essenciais com Ícones em Âmbar/Caramelo */}
            <div className="mt-6 flex flex-col gap-3 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4">
              <div className="flex items-center gap-2.5">
                <Calendar className="size-4 shrink-0 text-[#B45309]" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  Data: <strong className="text-slate-950 font-bold">{eventDate}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="size-4 shrink-0 text-[#B45309]" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  Horário: <strong className="text-slate-950 font-bold">{eventTime}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <User className="size-4 shrink-0 text-[#B45309]" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  Instrutor: <strong className="text-slate-950 font-bold">{instructor}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <MapPin className="size-4 shrink-0 text-[#E2091E]" />
                <div className="flex flex-col text-xs sm:text-sm">
                  <span className="font-semibold text-slate-800">
                    Local: <strong className="text-slate-950 font-bold">{locationName}</strong>
                  </span>
                  <span className="text-[11px] text-slate-500">{locationAddress}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2: Cartaz Vertical 9:16 Oficial (3 cols) */}
          <div className="lg:col-span-3 flex justify-center">
            <div className="relative aspect-[9/16] w-full max-w-[280px] sm:max-w-[320px] lg:max-w-none overflow-hidden rounded-2xl border-2 border-amber-300 shadow-2xl bg-amber-100">
              {event.posterUrl ? (
                <Image
                  alt={title}
                  className="size-full object-cover"
                  fill
                  priority
                  sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 25vw"
                  src={event.posterUrl}
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center p-6 text-center text-amber-800">
                  <Calendar className="size-16 stroke-1 text-[#B45309]" />
                  <span className="mt-3 text-xs font-semibold">Cartaz oficial do workshop</span>
                </div>
              )}
            </div>
          </div>

          {/* Coluna 3: Card de Inscrição / Vagas no WhatsApp (4 cols) */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl border-2 border-amber-300 bg-white p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-2 w-full bg-gradient-to-r from-[#B45309] to-[#F59E0B]" />

              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                <Ticket className="size-3.5 text-[#B45309]" />
                Inscrições Abertas
              </span>

              <h2 className="mt-3 text-xl font-extrabold text-slate-900">
                Garantir Vaga na Turma
              </h2>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                As turmas do Centro Técnico possuem número reduzido de bancadas para atendimento individual.
              </p>

              {/* Seletor de Vagas */}
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Quantidade de Vagas:</span>
                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Diminuir vagas"
                      className="flex size-7 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
                      disabled={tickets <= 1}
                      onClick={() => setTickets((prev) => Math.max(1, prev - 1))}
                      type="button"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-sm text-slate-900">
                      {tickets}
                    </span>
                    <button
                      aria-label="Aumentar vagas"
                      className="flex size-7 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
                      disabled={tickets >= 5}
                      onClick={() => setTickets((prev) => Math.min(5, prev + 1))}
                      type="button"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Botão de Inscrição Direta WhatsApp */}
              <div className="mt-5 space-y-2.5">
                <a
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition active:scale-98"
                  href={whatsappUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MessageCircle className="size-5" />
                  <span>Garantir Vaga no WhatsApp</span>
                </a>

                <a
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  href={doubtsUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <HelpCircle className="size-4 text-[#B45309]" />
                  <span>Tirar dúvidas sobre a turma</span>
                </a>
              </div>

              {/* Selos de Benefícios Inclusos */}
              <div className="mt-6 border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Todos os insumos e utensílios inclusos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Certificado oficial Comercial do Norte</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Desconto em compras de confeitaria na loja</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. PROGRAMAÇÃO DO WORKSHOP (LINHA DO TEMPO) */}
        <section className="mt-16 rounded-2xl border border-amber-200/80 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-amber-100 pb-4 mb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#B45309]">
                Cronograma da Aula
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                O que você vai aprender na prática
              </h2>
            </div>
            <UtensilsCrossed className="size-6 text-[#B45309] hidden sm:block" />
          </div>

          <div className="space-y-4">
            {DEFAULT_WORKSHOP_SCHEDULE.map((item, index) => (
              <div
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 rounded-xl border border-slate-100 bg-amber-50/30 p-4 transition hover:bg-amber-50/60"
                key={index}
              >
                <span className="inline-flex items-center justify-center rounded-lg bg-[#B45309] px-3 py-1 text-xs font-black text-white shrink-0 sm:w-24">
                  {item.time}
                </span>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. OUTROS WORKSHOPS DA TRILHA DE CONFEITARIA */}
        {relatedWorkshops.length > 0 ? (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#B45309]">
                  Continue se capacitando
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                  Outras Aulas no Centro Técnico
                </h2>
              </div>

              <Link
                className="flex items-center gap-1 text-xs font-bold text-[#B45309] hover:underline"
                href="/eventos/workshops/aulas-confeitaria"
              >
                <span>Ver todas as aulas</span>
                <ChevronRight className="size-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedWorkshops.map((w) => (
                <Link
                  className="group flex gap-4 rounded-xl border border-amber-200/80 bg-white p-4 shadow-xs transition hover:border-amber-400 hover:shadow-md"
                  href={`/evento/workshop/aulas-confeitaria/${w.slug}`}
                  key={w.id}
                >
                  <div className="relative aspect-[9/16] w-20 shrink-0 overflow-hidden rounded-lg bg-amber-100">
                    {w.posterUrl ? (
                      <Image
                        alt={w.title}
                        className="size-full object-cover group-hover:scale-105 transition"
                        fill
                        sizes="80px"
                        src={w.posterUrl}
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-col justify-center min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase text-[#B45309]">
                      {w.eventDateText || 'Workshop'}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 mt-0.5 group-hover:text-[#B45309] transition">
                      {w.title}
                    </h3>
                    <span className="mt-2 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <span>Ver detalhes</span>
                      <ArrowRight className="size-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
