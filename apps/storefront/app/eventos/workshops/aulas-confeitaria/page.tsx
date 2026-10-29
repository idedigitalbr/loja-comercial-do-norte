import type { Metadata } from 'next';
import { EventsView } from '@/components/evento/events-view';
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

  // Filtra eventos prioritariamente de Confeitaria / Workshop / Aulas
  const confeitariaEvents = allEvents.filter((ev) => {
    const text = `${ev.title} ${ev.subtitle || ''} ${ev.badge || ''} ${ev.description}`.toLowerCase();
    return (
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
    <EventsView
      initialEvents={displayList}
      theme="light"
      detailBasePath="/evento/workshop/aulas-confeitaria"
      badge="AULAS CONFEITARIA"
      title="Workshops & Aulas Práticas de Confeitaria"
      subtitle="Aprenda técnicas práticas de confeitaria com grandes especialistas no Centro Técnico Comercial do Norte."
      benefits={[
        { title: '100% Prático', subtitle: 'Bancadas equipadas' },
        { title: 'Certificado', subtitle: 'Oficial Comercial do Norte' },
        { title: 'Insumos Inclusos', subtitle: 'Tudo pronto para você' },
      ]}
    />
  );
}
