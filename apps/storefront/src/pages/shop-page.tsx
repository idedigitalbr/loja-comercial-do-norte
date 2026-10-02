import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductFilters } from '../features/catalog/product-filters';
import { ProductCard, StoreProduct } from '../features/catalog/product-card';
import { BrandRail } from '../features/catalog/brand-rail';
import { normalizeStoreProduct } from '../features/catalog/catalog-adapter';
import { flattenBrandTree } from '../features/catalog/brand-hierarchy';
import type { CatalogScope } from '../features/catalog/product-filters';
import { fallbackBrands, fallbackCategories, CatalogFilterOption } from '../features/catalog/product-filters';
import { StorefrontProductSearch } from '../components/storefront-product-search';

const PRODUCTS_PER_PAGE = 12;
const ORIGINAL_PUBLIC_BRANDS = new Set(['bioma-care', 'grandha', 'haskell', 'knut', 'maxiline', 'meu-tudo', 'oh-my', 'senscience']);
type CatalogSortOrder = 'alphabetical' | 'price-asc' | 'price-desc' | 'recent';

function normalizeOptions(payload: unknown): CatalogFilterOption[] {
  if (!Array.isArray(payload)) return [];
  return payload.flatMap((item) => {
    if (typeof item !== 'object' || item === null) return [];
    const value = item as Record<string, unknown>;
    return typeof value.name === 'string' && typeof value.slug === 'string'
      ? [{
        id: typeof value.id === 'string' ? value.id : undefined,
          label: value.name,
          value: value.slug,
          parentId: typeof value.parentId === 'string' ? value.parentId : null,
          imagePath: typeof value.imagePath === 'string' ? value.imagePath : null,
      }]
      : [];
  });
}

function filterOriginalPublicBrands(options: CatalogFilterOption[]): CatalogFilterOption[] {
  let includeCurrentGroup = false;
  return options.filter((option) => {
    if ((option.depth ?? 0) === 0) includeCurrentGroup = ORIGINAL_PUBLIC_BRANDS.has(option.value);
    return includeCurrentGroup;
  });
}

function paginationItems(totalPages: number, currentPage: number): Array<number | 'ellipsis'> {
  const visiblePages = Array.from(new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]))
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
  const items: Array<number | 'ellipsis'> = [];
  visiblePages.forEach((page, index) => {
    if (index > 0 && page - visiblePages[index - 1] > 1) items.push('ellipsis');
    items.push(page);
  });
  return items;
}

export function ShopPage({ scope }: { scope?: CatalogScope } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [brands, setBrands] = useState<CatalogFilterOption[]>(fallbackBrands);
  const [categories, setCategories] = useState<CatalogFilterOption[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<CatalogSortOrder>('alphabetical');
  const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));
  const activeSearch = searchParams.get('search')?.trim() ?? '';
  const requestedPage = Number(searchParams.get('page'));
  const currentPage = Number.isInteger(requestedPage) && requestedPage > 0
    ? Math.min(requestedPage, totalPages)
    : 1;
  const clearSearchParams = new URLSearchParams(searchParams);
  clearSearchParams.delete('search');
  clearSearchParams.delete('page');
  const clearSearchHref = clearSearchParams.toString() ? `/loja?${clearSearchParams.toString()}` : '/loja';
  const firstProductIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const sortedProducts = sortOrder === 'alphabetical'
    ? [...products].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR', { sensitivity: 'base' }))
    : sortOrder === 'price-asc'
      ? [...products].sort((left, right) => left.price.amount - right.price.amount)
      : sortOrder === 'price-desc'
        ? [...products].sort((left, right) => right.price.amount - left.price.amount)
        : products;
  const visibleProducts = sortedProducts.slice(firstProductIndex, firstProductIndex + PRODUCTS_PER_PAGE);
  const resultSummary = loading ? 'Carregando catálogo…' : products.length ? `Exibindo ${firstProductIndex + 1}–${Math.min(firstProductIndex + PRODUCTS_PER_PAGE, products.length)} de ${products.length} resultados` : activeSearch ? `Nenhum produto para “${activeSearch}”` : 'Catálogo preparado para importação';

  useEffect(() => {
    const query = new URLSearchParams(searchParams);
    if (scope && !query.has(scope.key)) query.set(scope.key, scope.value);
    query.delete('page');
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    void Promise.all([
      fetch(`/api/v1/catalog/products?${query.toString()}`, { signal: controller.signal }).then(async (response) => (response.ok ? response.json() : [])),
      fetch('/api/v1/catalog/brands', { signal: controller.signal }).then(async (response) => (response.ok ? response.json() : [])),
      fetch('/api/v1/catalog/categories', { signal: controller.signal }).then(async (response) => (response.ok ? response.json() : [])),
    ])
      .then(([productPayload, brandPayload, categoryPayload]) => {
        if (!active) return;
        setProducts(Array.isArray(productPayload) ? productPayload.map(normalizeStoreProduct).filter((product): product is StoreProduct => product !== null) : []);
        const importedBrands = flattenBrandTree(normalizeOptions(brandPayload));
        const importedCategories = normalizeOptions(categoryPayload);
        const publicBrands = filterOriginalPublicBrands(importedBrands);
        setBrands(publicBrands.length ? publicBrands : fallbackBrands);
        setCategories(importedCategories.length ? importedCategories : fallbackCategories);
      })
      .catch((error: unknown) => {
        if (active && !(error instanceof DOMException && error.name === 'AbortError')) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [scope?.key, scope?.value, searchParams]);

  return (
    <main className="page-section catalog-page">
      <div className="site-container catalog-page__container">
        <h1 className="sr-only">Loja</h1>
        <div className="catalog-layout">
          <ProductFilters brands={brands} categories={categories} scope={scope} />
          <div className="catalog-content">
            <div className="catalog-overview">
              <p className="page-heading__results">{resultSummary}</p>
              <div className="catalog-toolbar">
                <StorefrontProductSearch />
                <label className="catalog-toolbar__sort">
                  <span className="sr-only">Ordenar por</span>
                  <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as CatalogSortOrder)}>
                    <option value="alphabetical">Nome (A–Z)</option>
                    <option value="recent">Mais recentes</option>
                    <option value="price-asc">Menor preço</option>
                    <option value="price-desc">Maior preço</option>
                  </select>
                </label>
              </div>
            </div>
            <BrandRail brands={brands.filter((brand) => !brand.parentId)} />

            {loading ? <p className="empty-state" role="status">Carregando produtos…</p> : null}
            {!loading && products.length === 0 ? (
              <div className="empty-state" role="status" aria-live="polite">
                <h2>{activeSearch ? `Nenhum produto encontrado para “${activeSearch}”.` : 'Seu catálogo será exibido aqui assim que a importação terminar.'}</h2>
                <p>{activeSearch ? 'Tente buscar por outro nome, marca ou categoria.' : 'As categorias, marcas, imagens e preços do WooCommerce entrarão nesta grade sem alterar a experiência de compra.'}</p>
                {activeSearch ? <Link className="button button--secondary" to={clearSearchHref}>Limpar busca</Link> : null}
              </div>
            ) : null}
            <section className="product-grid" aria-label="Produtos">
              {visibleProducts.map((product) => <ProductCard key={product.publicId} product={product} catalogAppearance />)}
            </section>
            {!loading && products.length > PRODUCTS_PER_PAGE ? (
              <nav className="pagination" aria-label="Paginação do catálogo">
                <button
                  className="pagination__arrow"
                  type="button"
                  aria-label="Página anterior"
                  disabled={currentPage === 1}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    if (currentPage <= 2) next.delete('page');
                    else next.set('page', String(currentPage - 1));
                    setSearchParams(next);
                  }}
                >
                  Anterior
                </button>
                {paginationItems(totalPages, currentPage).map((item, index) => item === 'ellipsis' ? (
                  <span className="pagination__ellipsis" key={`ellipsis-${index}`} aria-hidden="true">…</span>
                ) : (
                  <button
                    className="pagination__page"
                    type="button"
                    key={item}
                    aria-label={`Página ${item}`}
                    aria-current={item === currentPage ? 'page' : undefined}
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      if (item === 1) next.delete('page');
                      else next.set('page', String(item));
                      setSearchParams(next);
                    }}
                  >
                    {item}
                  </button>
                ))}
                <button
                  className="pagination__arrow"
                  type="button"
                  aria-label="Próxima página"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set('page', String(currentPage + 1));
                    setSearchParams(next);
                  }}
                >
                  Próxima
                </button>
              </nav>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
