import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cn, WebEmptyState } from '@commerce/ui/web';
import { ProductCard } from '@/components/product-card';
import { getProducts, getSegments } from '@/lib/api';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const segments = await getSegments();
  const segment = segments.find((item) => item.slug === slug);
  return {
    title: `${segment?.name ?? 'Segmento'} | Comercial do Norte`,
    description: segment?.description ?? `Produtos e embalagens para ${segment?.name ?? 'seu segmento'} na Comercial do Norte.`,
    alternates: { canonical: `/segmento/${slug}` },
  };
}

export default async function SegmentPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [segments, products] = await Promise.all([
    getSegments(),
    getProducts({ segment: slug }),
  ]);
  const segment = segments.find((item) => item.slug === slug);
  if (!segment) notFound();

  return (
    <div className="cn-container py-8">
      <nav aria-label="Você está aqui" className="text-xs text-muted">
        <Link className="hover:text-brand" href="/">Início</Link>
        <span aria-hidden> / </span>
        <Link className="hover:text-brand" href="/loja">Catálogo</Link>
        <span aria-hidden> / </span>
        <span className="text-muted">Segmentos</span>
        <span aria-hidden> / </span>
        <span className="font-semibold text-ink">{segment.name}</span>
      </nav>

      <header className="mt-4 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-900 to-[#002B66] p-6 sm:p-8 text-white shadow-sm">
        <span className="inline-block rounded-pill bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
          Compre por Segmento
        </span>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
          {segment.name}
        </h1>
        {segment.description ? (
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-200">
            {segment.description}
          </p>
        ) : null}
        <p className="mt-3 text-xs text-slate-300">
          {products.length} produto(s) especializado(s) para {segment.name}.
        </p>
      </header>

      {/* Navegação Rápida entre outros Segmentos */}
      {segments.length > 1 ? (
        <nav aria-label="Outros segmentos" className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted mr-1">Outros ramos:</span>
          {segments.map((item) => (
            <Link
              className={cn(
                'rounded-pill border px-3 py-1.5 text-xs font-semibold transition',
                item.slug === slug
                  ? 'border-brand bg-brand text-white shadow-sm'
                  : 'border-line bg-surface text-ink hover:border-brand hover:text-brand'
              )}
              href={`/segmento/${item.slug}`}
              key={item.id}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      ) : null}

      {/* Grid de Produtos */}
      {products.length ? (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 items-start">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <WebEmptyState
          action={
            <Link className="inline-block rounded-pill bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover" href="/loja">
              Ver catálogo completo
            </Link>
          }
          className="mt-8"
          description={`Novos itens para ${segment.name} estão sendo adicionados ao catálogo diariamente.`}
          title={`Ainda não há produtos cadastrados para ${segment.name}.`}
        />
      )}
    </div>
  );
}
