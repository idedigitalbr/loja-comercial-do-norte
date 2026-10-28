import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEventBySlug, getEvents, type ApiEvent } from '@/lib/api';
import { WorkshopSinglePost } from '@/components/evento/workshop-single-post';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

const FALLBACK_CROQUETE_EVENT: ApiEvent = {
  id: 'sabado-croquete-de-charque-para-trigo',
  title: 'Croquete de Charque com Maionese de Chicória — Aula-Show Gastronômica',
  slug: 'sabado-croquete-de-charque-para-trigo',
  subtitle: 'Aula prática regional no Stand Comercial do Norte',
  description:
    'Aprenda o passo a passo completo da receita consagrada de croquete de charque com toque regional de maionese de chicória. Aula demonstrativa ministrada pela instrutora Thais Reis com degustação.',
  posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-04-croquete.jpg',
  eventDateText: '03/10 (Sábado)',
  eventTime: '17h',
  location: 'Hangar Centro de Convenções',
  locationAddress: 'Stand Comercial do Norte — Belém/PA',
  instructor: 'Thais Reis',
  badge: 'AULA-SHOW',
  ctaLabel: 'Confirmar Presença',
  ctaUrl:
    'https://wa.me/5591983440880?text=Ol%C3%A1!+Gostaria+de+confirmar+presen%C3%A7a+na+aula-show+Croquete+de+Charque',
  status: 'ACTIVE',
  sortOrder: 4,
};

const FALLBACK_CHANTILLY_EVENT: ApiEvent = {
  id: 'workshop-confeitaria-profissional-chantilly-bicos',
  title: 'Workshop de Confeitaria Profissional: Decoração com Chantilly e Bicos',
  slug: 'workshop-confeitaria-profissional-chantilly-bicos',
  subtitle: 'Aprenda técnicas exclusivas com um especialista em confeitaria',
  description:
    'Treinamento prático voltado para boleiras, confeiteiras e pequenos produtores. Conteúdo aborda: ponto correto do chantilly, técnicas de bicos russos e perlê, trabalho com chantininho, nivelamento de bolos e decorações modernas.',
  posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-03-workshop-confeitaria.jpg',
  eventDateText: 'Em breve',
  eventTime: '14h às 18h',
  location: 'Centro Técnico Comercial do Norte',
  locationAddress: 'Av. Bernardo Sayão, Belém/PA',
  instructor: 'Mestre Doceiro',
  badge: 'WORKSHOP CONFEITARIA',
  ctaLabel: 'Garantir Vaga',
  ctaUrl:
    'https://wa.me/5591983440880?text=Ol%C3%A1!+Gostaria+de+me+inscrever+no+Workshop+de+Confeitaria+com+Chantilly+e+Bicos',
  status: 'ACTIVE',
  sortOrder: 1,
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  let event = await getEventBySlug(slug);

  if (!event) {
    if (slug === FALLBACK_CROQUETE_EVENT.slug || slug.includes('croquete')) event = FALLBACK_CROQUETE_EVENT;
    if (slug === FALLBACK_CHANTILLY_EVENT.slug || slug.includes('chantilly')) event = FALLBACK_CHANTILLY_EVENT;
  }

  if (!event) return { title: 'Workshop não encontrado | Comercial do Norte' };

  return {
    title: `${event.title} | Workshops Comercial do Norte`,
    description: event.subtitle || event.description.slice(0, 160),
    alternates: {
      canonical: `/evento/workshop/aulas-confeitaria/${slug}`,
    },
  };
}

export default async function WorkshopEventPage({ params }: { params: Params }) {
  const { slug } = await params;
  let event = await getEventBySlug(slug);

  if (!event) {
    if (slug === FALLBACK_CROQUETE_EVENT.slug || slug.includes('croquete')) event = FALLBACK_CROQUETE_EVENT;
    if (slug === FALLBACK_CHANTILLY_EVENT.slug || slug.includes('chantilly')) event = FALLBACK_CHANTILLY_EVENT;
  }

  if (!event) {
    notFound();
  }

  const allEvents = await getEvents();
  const related = allEvents
    .filter((e) => e.slug !== event!.slug)
    .slice(0, 3);

  return <WorkshopSinglePost event={event} relatedWorkshops={related} />;
}
