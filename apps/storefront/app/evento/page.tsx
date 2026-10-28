import type { Metadata } from 'next';
import { getEvents } from '@/lib/api';
import { CANONICAL_EVENTS } from '@/lib/events-data';
import { EventsView } from '@/components/evento/events-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Nossos Eventos | Comercial do Norte',
  description:
    'Aprenda, conecte-se e faça seu negócio crescer. Acompanhe a agenda oficial de workshops práticos, aulas-show, inaugurações e capacitações no Comercial do Norte.',
  alternates: { canonical: '/evento' },
};

export default async function EventsPage() {
  const apiEvents = await getEvents();

  // Se a API retornar eventos cadastrados, combinamos com os canônicos garantindo integridade visual
  const events = apiEvents.length > 0 ? apiEvents : CANONICAL_EVENTS;

  return <EventsView initialEvents={events} />;
}
