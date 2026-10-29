import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEventBySlug, type ApiEvent } from '@/lib/api';
import { CANONICAL_EVENTS, findAnyEventBySlug } from '@/lib/events-data';
import { EventSinglePost } from '@/components/evento/event-single-post';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

const DEFAULT_PEDREIRA_EVENT: ApiEvent = {
  id: 'event-grande-reinauguracao-loja-pedreira',
  title: 'Grande Reinauguração Loja Pedreira',
  slug: 'grande-reinauguracao-loja-pedreira',
  subtitle: 'Onde tem Comercial do Norte você vende muito mais',
  description:
    'Venha participar da reinauguração da nossa loja na Pedreira! Um novo espaço, mais variedade, promoções exclusivas e um café da manhã especial para clientes e parceiros.\n\nA reinauguração da nossa loja na Pedreira marca um novo momento para a Comercial do Norte. Um espaço ainda maior, mais produtos, mais variedade e um atendimento especializado para ajudar o seu negócio a crescer.\n\nAlém de conhecer as novidades, você poderá aproveitar promoções exclusivas, participar de um café da manhã especial e conversar com a nossa equipe de vendas e parceiros.',
  posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-02-reinauguracao.jpg',
  eventDateText: '03 de Julho de 2026',
  eventTime: '08h às 14h',
  location: 'Loja Pedreira',
  locationAddress:
    'Travessa Mauriti, entre Pedro Miranda e Antônio Everdosa\nPedreira, Belém/PA',
  badge: 'REINAUGURAÇÃO',
  ctaLabel: 'Confirmar Presença',
  ctaUrl: 'https://wa.me/5591983440880?text=Olá!+Gostaria+de+garantir+minha+vaga+na+reinauguração+da+Loja+Pedreira',
  status: 'ACTIVE',
  sortOrder: 1,
};

function findFallbackEvent(slug: string): ApiEvent | null {
  if (slug === DEFAULT_PEDREIRA_EVENT.slug || slug.includes('pedreira')) {
    return DEFAULT_PEDREIRA_EVENT;
  }
  return findAnyEventBySlug(slug);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const event = (await getEventBySlug(slug)) || findFallbackEvent(slug);

  if (!event) return { title: 'Evento não encontrado | Comercial do Norte' };

  return {
    title: `${event.title} | Comercial do Norte`,
    description: event.subtitle || event.description.slice(0, 160),
    alternates: { canonical: `/evento/${slug}` },
  };
}

export default async function SingleEventPage({ params }: { params: Params }) {
  const { slug } = await params;
  let event = await getEventBySlug(slug);

  if (!event) {
    event = findFallbackEvent(slug);
  }

  if (!event) {
    notFound();
  }

  return <EventSinglePost event={event} />;
}
