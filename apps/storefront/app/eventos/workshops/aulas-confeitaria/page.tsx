import type { Metadata } from 'next';
import { ConfeitariaWorkshopsList } from '@/components/evento/confeitaria-workshops-list';
import { getEvents } from '@/lib/api';
import { CONFEITARIA_WORKSHOPS } from '@/lib/events-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Workshops & Aulas de Confeitaria | Comercial do Norte',
  description:
    'Aprenda técnicas práticas de chantininho, bicos, brigadeiros gourmet, doces finos e sobremesas na taça com grandes especialistas no Centro Técnico Comercial do Norte em Belém.',
  alternates: { canonical: '/eventos/workshops/aulas-confeitaria' },
};

export default async function ConfeitariaWorkshopsPage() {
  const allEvents = await getEvents();

  // Filtra estritamente apenas eventos de Workshop / Aulas (sem palestras corporativas ou reinaugurações)
  const confeitariaEvents = allEvents.filter((ev) => {
    const isPalestraOrReinauguracao =
      ev.categoryKey === 'palestras' ||
      ev.categoryKey === 'reinauguracoes' ||
      ev.badge?.toLowerCase().includes('palestra') ||
      ev.badge?.toLowerCase().includes('reinaugura');
    if (isPalestraOrReinauguracao) return false;

    const text = `${ev.title} ${ev.subtitle || ''} ${ev.badge || ''} ${ev.description}`.toLowerCase();
    return (
      ev.categoryKey === 'workshops' ||
      ev.categoryKey === 'aulas-show' ||
      text.includes('confeitaria') ||
      text.includes('workshop') ||
      text.includes('aula') ||
      text.includes('doce') ||
      text.includes('bolo') ||
      text.includes('chantilly')
    );
  });

  const displayList = confeitariaEvents.length > 0 ? confeitariaEvents : CONFEITARIA_WORKSHOPS;

  return (
    <ConfeitariaWorkshopsList
      initialEvents={displayList}
      detailBasePath="/evento/workshop/aulas-confeitaria"
    />
  );
}
