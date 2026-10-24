import Link from 'next/link';
import type { Metadata } from 'next';
import { ProductCard } from '@/components/product-card';
import { getCategories, getProducts } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catálogo | Comercial do Norte',
  description: 'Embalagens, descartáveis, artigos para festa, limpeza e mercearia. Monte sua lista e receba a cotação.',
  alternates: { canonical: '/loja' },
};

type SearchParams = Promise<{ q?: string; categoria?: string }>;

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, categoria } = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts({ search: q, category: categoria }),
    getCategories(),
  ]);

  const activeCategory = categories.find((category) => category.slug === categoria);

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
            {products.length} produto(s) publicado(s){q ? ` para “${q}”` : ''}.
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
          <button className="rounded-pill bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover" type="submit">Buscar</button>
        </form>
      </header>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link className={`rounded-pill border px-3 py-1.5 text-xs font-semibold ${!activeCategory ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-ink hover:border-brand'}`} href="/loja">
          Todas
        </Link>
        {categories.map((category) => (
          <Link
            className={`rounded-pill border px-3 py-1.5 text-xs font-semibold ${activeCategory?.slug === category.slug ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-ink hover:border-brand'}`}
            href={`/loja?categoria=${category.slug}`}
            key={category.id}
          >
            {category.name}
          </Link>
        ))}
      </div>

      {products.length ? (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="mt-8 rounded-card border border-dashed border-line bg-surface p-8 text-center">
          <p className="text-sm font-semibold text-ink">Nenhum produto encontrado</p>
          <p className="mt-1 text-sm text-muted">Ajuste a busca ou volte para todas as categorias.</p>
          <Link className="mt-4 inline-block rounded-pill bg-brand px-4 py-2 text-sm font-semibold text-white" href="/loja">Ver tudo</Link>
        </div>
      )}
    </div>
  );
}
