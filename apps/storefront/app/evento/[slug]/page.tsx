import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, MapPin, MessageSquare, Phone, User, CheckCircle2 } from 'lucide-react';
import { getEventBySlug, getEvents } from '@/lib/api';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: 'Evento não encontrado | Comercial do Norte' };

  return {
    title: `${event.title} | Eventos Comercial do Norte`,
    description: event.subtitle || event.description.slice(0, 160),
    alternates: { canonical: `/evento/${slug}` },
  };
}

export default async function SingleEventPage({ params }: { params: Params }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const whatsappMessage = encodeURIComponent(
    `Olá! Gostaria de mais informações e garantir minha vaga no evento "${event.title}" da Comercial do Norte.`
  );
  const whatsappUrl = event.ctaUrl || `https://wa.me/5591983440880?text=${whatsappMessage}`;

  return (
    <div className="w-full bg-[#060709] bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:36px_36px] min-h-screen py-10 sm:py-14 text-white">
      <div className="cn-container">
        {/* Breadcrumb */}
        <nav aria-label="Você está aqui" className="text-xs text-slate-400 mb-6">
          <Link className="hover:text-white" href="/">Início</Link>
          <span aria-hidden> / </span>
          <Link className="hover:text-white" href="/evento">Eventos</Link>
          <span aria-hidden> / </span>
          <span className="font-semibold text-white line-clamp-1">{event.title}</span>
        </nav>

        {/* Layout Principal 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Coluna 1: Cartaz Oficial (aspect 9:16) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-3xl border border-white/15 bg-zinc-900 shadow-2xl">
              {event.posterUrl ? (
                <Image
                  alt={event.title}
                  className="size-full object-cover"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 420px"
                  src={event.posterUrl}
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center p-6 text-center text-slate-500">
                  <Calendar className="size-16 stroke-1 text-[#E2091E]" />
                  <span className="mt-3 text-sm">Cartaz oficial</span>
                </div>
              )}

              {event.badge ? (
                <div className="absolute top-4 left-4 z-10">
                  <span className="rounded-full bg-[#E2091E] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-lg">
                    {event.badge}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="mt-4 text-center">
              <Link
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
                href="/evento"
              >
                <ArrowLeft className="size-3.5" />
                <span>Voltar para todos os eventos</span>
              </Link>
            </div>
          </div>

          {/* Coluna 2: Informações Detalhadas & Inscrição */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                Agenda Oficial Comercial do Norte
              </span>
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {event.title}
            </h1>

            {event.subtitle ? (
              <p className="mt-2 text-base sm:text-lg text-slate-300 leading-relaxed">
                {event.subtitle}
              </p>
            ) : null}

            {/* Grid de Metadados: Data, Horário, Local, Instrutor */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {event.eventDateText ? (
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E2091E]/20 text-[#E2091E]">
                    <Calendar className="size-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase">Data</span>
                    <p className="text-sm font-bold text-white">{event.eventDateText}</p>
                  </div>
                </div>
              ) : null}

              {event.eventTime ? (
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-400">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase">Horário</span>
                    <p className="text-sm font-bold text-white">{event.eventTime}</p>
                  </div>
                </div>
              ) : null}

              {event.location ? (
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/20 text-blue-400">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase">Local</span>
                    <p className="text-sm font-bold text-white">{event.location}</p>
                    {event.locationAddress ? (
                      <p className="text-[11px] text-slate-300 line-clamp-1">{event.locationAddress}</p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {event.instructor ? (
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-400">
                    <User className="size-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase">Palestrante / Instrutor</span>
                    <p className="text-sm font-bold text-white">{event.instructor}</p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Descrição do Evento */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-white">Sobre o Evento</h2>
              <div className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
                {event.description}
              </div>
            </div>

            {/* Card de Ação e Inscrição */}
            <div className="mt-10 rounded-2xl border border-[#E2091E]/30 bg-gradient-to-r from-[#E2091E]/20 via-[#E2091E]/10 to-transparent p-6 sm:p-8 backdrop-blur-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Quer participar ou tirar dúvidas?
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-300">
                    Fale diretamente com nossa equipe de eventos pelo WhatsApp para garantir sua vaga ou solicitar informações sobre inscrições.
                  </p>
                </div>

                <a
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E2091E] px-6 py-3 text-sm font-extrabold text-white shadow-xl transition hover:bg-[#c40819] hover:scale-105 active:scale-95 shrink-0"
                  href={whatsappUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MessageSquare className="size-4" />
                  <span>{event.ctaLabel || 'Garantir Vaga no WhatsApp'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
