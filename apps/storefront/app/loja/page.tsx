import Link from 'next/link';
import type { Metadata } from 'next';
import { cn, WebButton, WebEmptyState } from '@commerce/ui/web';
import { ProductCard } from '@/components/product-card';
import { getCategories, getProductsPage, getSegments, getTags } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catálogo | Comercial do Norte',
  description: 'Embalagens, descartáveis, artigos para festa, limpeza e mercearia. Monte sua lista e receba a cotação.',
  alternates: { canonical: '/loja' },
};

type SearchParams = Promise<{ q?: string; categoria?: string; segmento?: string; tag?: string; pagina?: string; ordem?: string }>;

const PAGE_SIZE = 12;

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, categoria, segmento, tag, pagina, ordem } = await searchParams;
  const page = Math.max(1, Number.parseInt(pagina ?? '1', 10) || 1);
  const sort = ordem === 'nome' ? 'name_asc' : 'newest';
  const [result, categories, segments, tags] = await Promise.all([
    getProductsPage({ search: q, category: categoria, segment: segmento, tag, page, pageSize: PAGE_SIZE, sort }),
    getCategories(),
    getSegments(),
    getTags(),
  ]);
  const activeCategory = categories.find((category) => category.slug === categoria);
  const activeSegment = segments.find((seg) => seg.slug === segmento);

  const buildHref = (overrides: { pagina?: number; ordem?: string; q?: string; categoria?: string; segmento?: string; tag?: string }) => {
    const params = new URLSearchParams();
    const nextQ = 'q' in overrides ? overrides.q : q;
    const nextCat = 'categoria' in overrides ? overrides.categoria : categoria;
    const nextSeg = 'segmento' in overrides ? overrides.segmento : segmento;
    const nextTag = 'tag' in overrides ? overrides.tag : tag;
    const nextOrder = 'ordem' in overrides ? overrides.ordem : ordem;
    const nextPage = 'pagina' in overrides ? overrides.pagina : 1;

    if (nextQ) params.set('q', nextQ);
    if (nextCat) params.set('categoria', nextCat);
    if (nextSeg) params.set('segmento', nextSeg);
    if (nextTag) params.set('tag', nextTag);
    if (nextOrder === 'nome') params.set('ordem', 'nome');
    if (nextPage && nextPage > 1) params.set('pagina', String(nextPage));

    const query = params.toString();
    return query ? `/loja?${query}` : '/loja';
  };

  const hasActiveFilters = Boolean(q || categoria || segmento || tag);

  return (
    <div className="cn-container py-8">
      <nav aria-label="Você está aqui" className="text-xs text-muted">
        <Link className="hover:text-brand" href="/">Início</Link>
        <span aria-hidden> / </span>
        <span className="text-ink">Catálogo</span>
        {activeSegment ? <><span aria-hidden> / </span><span className="text-ink">{activeSegment.name}</span></> : activeCategory ? <><span aria-hidden> / </span><span className="text-ink">{activeCategory.name}</span></> : tag ? <><span aria-hidden> / </span><span className="text-ink">#{tag}</span></> : null}
      </nav>

      <header className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">
            {activeSegment ? `Segmento: ${activeSegment.name}` : activeCategory ? activeCategory.name : tag ? `Tag: #${tag}` : 'Catálogo completo'}
          </h1>
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
          {segmento ? <input name="segmento" type="hidden" value={segmento} /> : null}
          {tag ? <input name="tag" type="hidden" value={tag} /> : null}
          <WebButton size="md" type="submit" variant="primary">Buscar</WebButton>
        </form>
      </header>

      {/* Faixa de Filtros Ativos com botão de remoção */}
      {hasActiveFilters ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl text-xs">
          <span className="font-bold text-slate-700">Filtros ativos:</span>
          {q ? (
            <Link
              href={buildHref({ q: undefined })}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-300 px-2.5 py-1 rounded-pill font-medium text-slate-800 hover:border-red-500 hover:text-red-600 transition"
              title="Remover termo de busca"
            >
              Busca: “{q}” <span className="font-bold text-slate-400">×</span>
            </Link>
          ) : null}
          {activeCategory ? (
            <Link
              href={buildHref({ categoria: undefined })}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-300 px-2.5 py-1 rounded-pill font-medium text-slate-800 hover:border-red-500 hover:text-red-600 transition"
              title="Remover filtro de categoria"
            >
              Categoria: {activeCategory.name} <span className="font-bold text-slate-400">×</span>
            </Link>
          ) : null}
          {activeSegment ? (
            <Link
              href={buildHref({ segmento: undefined })}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-300 px-2.5 py-1 rounded-pill font-medium text-slate-800 hover:border-red-500 hover:text-red-600 transition"
              title="Remover filtro de segmento"
            >
              Segmento: {activeSegment.name} <span className="font-bold text-slate-400">×</span>
            </Link>
          ) : null}
          {tag ? (
            <Link
              href={buildHref({ tag: undefined })}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-300 px-2.5 py-1 rounded-pill font-medium text-slate-800 hover:border-red-500 hover:text-red-600 transition"
              title="Remover filtro de tag"
            >
              Tag: #{tag} <span className="font-bold text-slate-400">×</span>
            </Link>
          ) : null}
          <Link href="/loja" className="ml-auto text-xs text-brand font-semibold hover:underline">
            Limpar todos os filtros
          </Link>
        </div>
      ) : null}

      {/* Linha 1: Categorias Principais */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-600 mr-1">Categorias:</span>
        <Link className={cn('rounded-pill border px-3 py-1.5 text-xs font-semibold transition', !activeCategory && !activeSegment && !tag ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-ink hover:border-brand')} href="/loja">
          Todas
        </Link>
        {categories.map((category) => (
          <Link
            className={cn('rounded-pill border px-3 py-1.5 text-xs font-semibold transition', activeCategory?.slug === category.slug ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-ink hover:border-brand')}
            href={`/categoria/${category.slug}`}
            key={category.id}
          >
            {category.name}
          </Link>
        ))}
        <span className="ml-auto flex items-center gap-2 text-xs text-muted">
          Ordenar:
          <Link className={cn('rounded-pill border px-3 py-1.5 font-semibold', sort === 'newest' ? 'border-brand text-brand' : 'border-line text-ink hover:border-brand')} href={buildHref({ ordem: 'novidades' })}>Novidades</Link>
          <Link className={cn('rounded-pill border px-3 py-1.5 font-semibold', sort === 'name_asc' ? 'border-brand text-brand' : 'border-line text-ink hover:border-brand')} href={buildHref({ ordem: 'nome' })}>Nome A–Z</Link>
        </span>
      </div>

      {/* Linha 2: Compre por Segmento */}
      {segments.length ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600 mr-1">Segmentos:</span>
          {segments.map((seg) => (
            <Link
              className={cn(
                'rounded-pill border px-3 py-1 text-xs font-medium transition',
                activeSegment?.slug === seg.slug
                  ? 'border-brand bg-brand text-white font-semibold shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-brand hover:text-brand'
              )}
              href={`/segmento/${seg.slug}`}
              key={seg.id}
            >
              {seg.name}
            </Link>
          ))}
        </div>
      ) : null}

      {/* Linha 3: Tags do Produto */}
      {tags.length ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-600 mr-1">Tags:</span>
          {tags.map((t) => (
            <Link
              className={cn(
                'rounded-pill border px-2.5 py-0.5 text-xs transition',
                tag === t.slug
                  ? 'border-brand bg-brand text-white font-semibold shadow-sm'
                  : 'border-slate-200/80 bg-white text-slate-600 hover:border-brand hover:text-brand'
              )}
              href={`/tag/${t.slug}`}
              key={t.id}
            >
              #{t.name}
            </Link>
          ))}
        </div>
      ) : null}

      {/* Grid de Produtos */}
      {result.items.length ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 items-start">
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
              Ver catálogo completo
            </Link>
          }
          className="mt-8"
          description="Tente outros termos de busca ou explore as categorias acima."
          title="Nenhum produto encontrado."
        />
      )}
    </div>
  );
}
