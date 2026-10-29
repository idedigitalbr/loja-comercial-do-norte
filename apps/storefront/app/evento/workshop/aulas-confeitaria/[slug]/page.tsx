import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEventBySlug, type ApiEvent } from '@/lib/api';
import { findAnyEventBySlug } from '@/lib/events-data';
import { WorkshopSinglePost } from '@/components/evento/workshop-single-post';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const event = (await getEventBySlug(slug)) || findAnyEventBySlug(slug);

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
  const event = (await getEventBySlug(slug)) || findAnyEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return <WorkshopSinglePost event={event} />;
}
