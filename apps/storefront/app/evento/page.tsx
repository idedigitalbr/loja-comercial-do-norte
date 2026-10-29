import type { Metadata } from 'next';
import { getEvents } from '@/lib/api';
import { GENERAL_EVENTS } from '@/lib/events-data';
import { EventsView } from '@/components/evento/events-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Nossos Eventos | Comercial do Norte',
  description:
    'Aprenda, conecte-se e faça seu negócio crescer. Acompanhe a agenda oficial de palestras, inaugurações e encontros no Comercial do Norte.',
  alternates: { canonical: '/evento' },
};

export default async function EventsPage() {
  const apiEvents = await getEvents();

  // Em /eventos, exibimos exclusivamente eventos gerais (palestras, inaugurações, encontros).
  // Workshops e aulas de confeitaria são exclusivos de /eventos/workshops/aulas-confeitaria.
  const baseList = apiEvents.length > 0 ? apiEvents : GENERAL_EVENTS;
  const filtered = baseList.filter((ev) => {
    const isWorkshopOrAula =
      ev.categoryKey === 'workshops' ||
      ev.categoryKey === 'aulas-show' ||
      ev.badge?.toLowerCase().includes('workshop') ||
      ev.badge?.toLowerCase().includes('aula') ||
      ev.title.toLowerCase().includes('workshop') ||
      ev.title.toLowerCase().includes('aula');
    return !isWorkshopOrAula;
  });

  const generalEvents = filtered.length > 0 ? filtered : GENERAL_EVENTS;

  return <EventsView initialEvents={generalEvents} />;
}
