import type { Metadata } from 'next';
import { ConfeitariaWorkshopsList } from '@/components/evento/confeitaria-workshops-list';
import { getEvents } from '@/lib/api';
import { filterConfeitariaEvents } from '@/lib/events-data';
import { getStorefrontComposition } from '@/lib/storefront/composition-storage';
import type { VideoArticlesCarouselProps } from '@/lib/storefront/widget-types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Workshops & Aulas de Confeitaria | Comercial do Norte',
  description:
    'Aprenda técnicas práticas de chantininho, bicos, brigadeiros gourmet, doces finos e sobremesas na taça com grandes especialistas no Centro Técnico Comercial do Norte em Belém.',
  alternates: { canonical: '/eventos/workshops/aulas-confeitaria' },
};

export default async function ConfeitariaWorkshopsPage() {
  const [allEvents, composition] = await Promise.all([
    getEvents(),
    getStorefrontComposition(),
  ]);

  const homeConfeitariaWidget = composition.widgets.find(
    (w) =>
      w.id === 's15b-workshops-confeitaria' ||
      (w.type === 'video-articles-carousel' &&
        ((w.props as { variant?: string })?.variant === 'confeitaria' ||
          (w.props as { title?: string })?.title?.toLowerCase().includes('confeitaria')))
  );
  const heroBannerProps = homeConfeitariaWidget?.props as
    | Partial<VideoArticlesCarouselProps>
    | undefined;

  // Filtra estritamente apenas eventos de Workshop / Aulas (sem palestras corporativas ou reinaugurações)
  const displayList = filterConfeitariaEvents(allEvents);

  return (
    <ConfeitariaWorkshopsList
      detailBasePath="/evento/workshop/aulas-confeitaria"
      heroBannerProps={heroBannerProps}
      initialEvents={displayList}
    />
  );
}
