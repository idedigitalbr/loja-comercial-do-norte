import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Calendar, Clock, MapPin, User, ChevronRight } from 'lucide-react';
import { WebEmptyState } from '@commerce/ui/web';
import { getEvents } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Nossos Eventos | Comercial do Norte',
  description: 'Tudo que acontece na Comercial do Norte: workshops, palestras de empreendedorismo, reinaugurações e aulas-show de culinária e confeitaria.',
  alternates: { canonical: '/evento' },
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="w-full bg-[#060709] bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:36px_36px] min-h-screen py-10 sm:py-14 text-white">
      <div className="cn-container">
        {/* Breadcrumb */}
        <nav aria-label="Você está aqui" className="text-xs text-slate-400 mb-6">
          <Link className="hover:text-white" href="/">Início</Link>
          <span aria-hidden> / </span>
          <span className="font-semibold text-white">Eventos</span>
        </nav>

        {/* Header Oficial Escuro com Linha Vermelha */}
        <header className="mb-10">
          <p className="text-lg font-medium text-slate-300 sm:text-xl">
            Nossos Eventos
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Tudo que acontece no Comercial do Norte
          </h1>
          <div className="mt-3 h-1 w-28 rounded-full bg-[#E2091E]" />
          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl">
            Acompanhe a agenda oficial de workshops práticos, aulas-show com especialistas, grandes reinaugurações e encontros de capacitação para o seu negócio.
          </p>
        </header>

        {/* Grid de Cartazes Verticais (9:16) */}
        {events.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <article
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl transition duration-300 hover:-translate-y-1 hover:border-white/20"
                key={event.id}
              >
                {/* Cartaz Vertical 9:16 */}
                <Link
                  className="relative block aspect-[9/16] w-full overflow-hidden bg-zinc-950"
                  href={`/evento/${event.slug}`}
                >
                  {event.posterUrl ? (
                    <Image
                      alt={event.title}
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      src={event.posterUrl}
                    />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center p-6 text-center text-slate-500">
                      <Calendar className="size-12 stroke-1 text-[#E2091E]" />
                      <span className="mt-2 text-xs">Cartaz em produção</span>
                    </div>
                  )}

                  {/* Badge do Evento */}
                  {event.badge ? (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="rounded-full bg-[#E2091E] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                        {event.badge}
                      </span>
                    </div>
                  ) : null}

                  {/* Overlay gradiente inferior para legibilidade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                  {/* Informações essenciais ancoradas no fundo do cartaz */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <h2 className="text-base font-extrabold text-white leading-tight line-clamp-2 drop-shadow-md">
                      {event.title}
                    </h2>

                    <div className="mt-2 space-y-1 text-xs text-slate-300">
                      {event.eventDateText ? (
                        <div className="flex items-center gap-1.5 font-bold text-amber-300">
                          <Calendar className="size-3.5 shrink-0" />
                          <span>{event.eventDateText}{event.eventTime ? ` · ${event.eventTime}` : ''}</span>
                        </div>
                      ) : null}

                      {event.location ? (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="size-3.5 shrink-0 text-[#E2091E]" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-2.5">
                      <span className="text-[11px] font-bold text-amber-400 group-hover:text-white transition">
                        {event.ctaLabel || 'Ver Detalhes'}
                      </span>
                      <ChevronRight className="size-4 text-amber-400 group-hover:translate-x-1 group-hover:text-white transition" />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <WebEmptyState
            action={
              <Link className="inline-block rounded-pill bg-[#E2091E] px-5 py-2 text-sm font-semibold text-white hover:bg-[#c40819]" href="/">
                Voltar à página inicial
              </Link>
            }
            className="mt-12 text-slate-300"
            description="Nenhum evento agendado no momento. Fique atento às nossas redes para novidades."
            title="Agenda de eventos em atualização"
          />
        )}
      </div>
    </div>
  );
}
