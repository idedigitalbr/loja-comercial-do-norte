import Link from 'next/link';
import type { Metadata } from 'next';
import { cn, WebBadge, WebButton, WebEmptyState } from '@commerce/ui/web';
import { ProductCard } from '@/components/product-card';
import { getCategories, getProductsPage } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catálogo | Comercial do Norte',
  description: 'Embalagens, descartáveis, artigos para festa, limpeza e mercearia. Monte sua lista e receba a cotação.',
  alternates: { canonical: '/loja' },
};

type SearchParams = Promise<{ q?: string; categoria?: string; pagina?: string; ordem?: string }>;

const PAGE_SIZE = 12;

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, categoria, pagina, ordem } = await searchParams;
  const page = Math.max(1, Number.parseInt(pagina ?? '1', 10) || 1);
  const sort = ordem === 'nome' ? 'name_asc' : 'newest';
  const [result, categories] = await Promise.all([
    getProductsPage({ search: q, category: categoria, page, pageSize: PAGE_SIZE, sort }),
    getCategories(),
  ]);
  const activeCategory = categories.find((category) => category.slug === categoria);

  const buildHref = (overrides: { pagina?: number; ordem?: string }) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (categoria) params.set('categoria', categoria);
    const nextOrder = overrides.ordem ?? ordem;
    if (nextOrder === 'nome') params.set('ordem', 'nome');
    const nextPage = overrides.pagina ?? 1;
    if (nextPage > 1) params.set('pagina', String(nextPage));
    const query = params.toString();
    return query ? `/loja?${query}` : '/loja';
  };

  return (
    <div className="cn-container py-8">
      <nav aria-label="Você está aqui" className="text-xs text-muted">
        <Link className="hover:text-brand" href="/">Início</Link>
        <span aria-hidden> / </span>
        <span className="text-ink">Catálogo</span>
        {activeCategory ? <><span aria-hidden> / </span><span className="text-ink">{activeCategory.name}</span></> : null}
      </nav>

      <header className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">{activeCategory ? activeCategory.name : 'Catálogo completo'}</h1>
          <p className="text-sm text-muted">
            {result.total} produto(s) publicado(s){q ? ` para “${q}”` : ''} · página {result.page} de {result.totalPages}
          </p>
        </div>
        <form action="/loja" className="flex w-full max-w-md items-center gap-2" role="search">
          <label className="sr-only" htmlFor="catalog-search">Buscar no catálogo</label>
          <input
            className="w-full rounded-pill border border-line bg-surface px-4 py-2 text-sm outline-none focus:border-brand"
            defaultValue={q ?? ''}
            id="catalog-search"
            name="q"
            placeholder="Buscar produto, marca ou SKU"
            type="search"
          />
          {categoria ? <input name="categoria" type="hidden" value={categoria} /> : null}
          <WebButton size="md" type="submit" variant="primary">Buscar</WebButton>
        </form>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link className={cn('rounded-pill border px-3 py-1.5 text-xs font-semibold', !activeCategory ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-ink hover:border-brand')} href={buildHref({})}>
          Todas
        </Link>
        {categories.map((category) => (
          <Link
            className={cn('rounded-pill border px-3 py-1.5 text-xs font-semibold', activeCategory?.slug === category.slug ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-ink hover:border-brand')}
            href={(() => {
              const params = new URLSearchParams();
              if (q) params.set('q', q);
              params.set('categoria', category.slug);
              return `/loja?${params}`;
            })()}
            key={category.id}
          >
            {category.name}
          </Link>
        ))}
        {q ? <WebBadge tone="brand">Filtro: {q}</WebBadge> : null}
        <span className="ml-auto flex items-center gap-2 text-xs text-muted">
          Ordenar:
          <Link className={cn('rounded-pill border px-3 py-1.5 font-semibold', sort === 'newest' ? 'border-brand text-brand' : 'border-line text-ink hover:border-brand')} href={buildHref({ ordem: 'novidades' })}>Novidades</Link>
          <Link className={cn('rounded-pill border px-3 py-1.5 font-semibold', sort === 'name_asc' ? 'border-brand text-brand' : 'border-line text-ink hover:border-brand')} href={buildHref({ ordem: 'nome' })}>Nome A–Z</Link>
        </span>
      </div>

      {result.items.length ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {result.items.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>

          {result.totalPages > 1 ? (
            <nav aria-label="Paginação do catálogo" className="mt-8 flex items-center justify-center gap-2">
              {result.page > 1 ? (
                <Link className="rounded-pill border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-brand" href={buildHref({ pagina: result.page - 1 })}>Anterior</Link>
              ) : null}
              {Array.from({ length: result.totalPages }, (_, index) => index + 1)
                .filter((value) => value === 1 || value === result.totalPages || Math.abs(value - result.page) <= 1)
                .map((value, index, list) => (
                  <span className="flex items-center gap-2" key={value}>
                    {index > 0 && value - list[index - 1] > 1 ? <span className="text-muted">…</span> : null}
                    <Link
                      aria-current={value === result.page ? 'page' : undefined}
                      className={cn('rounded-pill border px-3.5 py-2 text-sm font-semibold', value === result.page ? 'border-brand bg-brand text-white' : 'border-line text-ink hover:border-brand')}
                      href={buildHref({ pagina: value })}
                    >
                      {value}
                    </Link>
                  </span>
                ))}
              {result.page < result.totalPages ? (
                <Link className="rounded-pill border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-brand" href={buildHref({ pagina: result.page + 1 })}>Próxima</Link>
              ) : null}
            </nav>
          ) : null}
        </>
      ) : (
        <WebEmptyState
          action={
            <Link className="inline-block rounded-pill bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover" href="/loja">
              Ver tudo
            </Link>
          }
          className="mt-8"
          description="Ajuste a busca ou volte para todas as categorias."
          title="Nenhum produto encontrado"
        />
      )}
    </div>
  );
}
