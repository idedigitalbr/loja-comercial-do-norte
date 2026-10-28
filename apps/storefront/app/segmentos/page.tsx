import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowRight, Store } from 'lucide-react';
import { SegmentHeroBanner } from '@/components/segment-hero-banner';
import { getSegments } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Segmentos de Atuação | Comercial do Norte',
  description:
    'Tudo para todos os negócios, para todos os tamanhos. Encontre embalagens e descartáveis sob medida para o seu ramo.',
  alternates: { canonical: '/segmentos' },
};

export default async function SegmentsDirectoryPage() {
  const segments = await getSegments();

  return (
    <div className="flex flex-col bg-[#F4F7FB] min-h-screen">
      {/* Banner Oficial de Topo: Largura total e identidade visual Comercial do Norte */}
      <SegmentHeroBanner
        banner={{
          prefix: 'O COMERCIAL DO',
          highlight: 'SEU NEGÓCIO',
          altText: 'O Comercial do Seu Negócio — Tudo para todos os ramos no Comercial do Norte',
        }}
      />

      <div className="cn-container py-6 sm:py-8">
        <nav aria-label="Você está aqui" className="text-xs text-muted mb-4">
          <Link className="hover:text-brand" href="/">
            Início
          </Link>
          <span aria-hidden> / </span>
          <span className="font-semibold text-ink">Segmentos</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-line/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand">
                <Store className="size-3.5" />
                Compre por Segmento
              </span>
              <span className="text-xs text-muted">
                {segments.length} ramos disponíveis
              </span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              Tudo para todos os negócios
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted">
              Para todos os tamanhos! Soluções completas em embalagens, descartáveis e utilidades personalizadas para cada tipo de empreendimento.
            </p>
          </div>
        </div>

        {segments.length ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {segments.map((segment) => (
              <Link
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
                href={`/segmento/${segment.slug}`}
                key={segment.id}
              >
                {segment.imagePath ? (
                  <div className="relative aspect-[1.15/1] w-full overflow-hidden bg-slate-100">
                    <Image
                      alt={segment.name}
                      className="size-full object-cover transition duration-300 group-hover:scale-105"
                      height={360}
                      src={segment.imagePath}
                      unoptimized
                      width={480}
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-bold text-[#002868] transition group-hover:text-brand">
                    {segment.name}
                  </h2>
                  {segment.description ? (
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {segment.description}
                    </p>
                  ) : null}
                  <div className="mt-auto pt-4 flex items-center justify-between text-xs font-bold text-brand">
                    <span>Ver produtos</span>
                    <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-2xl border border-dashed border-line bg-surface p-6 text-sm text-muted text-center">
            Nenhum segmento disponível no momento.
          </p>
        )}
      </div>
    </div>
  );
}
