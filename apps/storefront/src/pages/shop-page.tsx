import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductFilters } from '../features/catalog/product-filters';
import { ProductCard, StoreProduct } from '../features/catalog/product-card';
import { BrandRail } from '../features/catalog/brand-rail';
import { normalizeStoreProduct } from '../features/catalog/catalog-adapter';
import { flattenBrandTree } from '../features/catalog/brand-hierarchy';
import { fallbackBrands, fallbackCategories, CatalogFilterOption } from '../features/catalog/product-filters';

const PRODUCTS_PER_PAGE = 16;

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

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [brands, setBrands] = useState<CatalogFilterOption[]>(fallbackBrands);
  const [categories, setCategories] = useState<CatalogFilterOption[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);
  const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));
  const requestedPage = Number(searchParams.get('page'));
  const currentPage = Number.isInteger(requestedPage) && requestedPage > 0
    ? Math.min(requestedPage, totalPages)
    : 1;
  const firstProductIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const visibleProducts = products.slice(firstProductIndex, firstProductIndex + PRODUCTS_PER_PAGE);
  const resultSummary = loading ? 'Carregando catálogo…' : products.length ? `Exibindo ${firstProductIndex + 1}–${Math.min(firstProductIndex + PRODUCTS_PER_PAGE, products.length)} de ${products.length} produtos` : 'Catálogo preparado para importação';

  useEffect(() => {
    const query = new URLSearchParams(searchParams);
    query.delete('page');
    setLoading(true);
    void Promise.all([
      fetch(`/api/v1/catalog/products?${query.toString()}`).then(async (response) => (response.ok ? response.json() : [])),
      fetch('/api/v1/catalog/brands').then(async (response) => (response.ok ? response.json() : [])),
      fetch('/api/v1/catalog/categories').then(async (response) => (response.ok ? response.json() : [])),
    ])
      .then(([productPayload, brandPayload, categoryPayload]) => {
        setProducts(Array.isArray(productPayload) ? productPayload.map(normalizeStoreProduct).filter((product): product is StoreProduct => product !== null) : []);
        const importedBrands = flattenBrandTree(normalizeOptions(brandPayload));
        const importedCategories = normalizeOptions(categoryPayload);
        setBrands(importedBrands.length ? importedBrands : fallbackBrands);
        setCategories(importedCategories.length ? importedCategories : fallbackCategories);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <main className="page-section">
      <div className="site-container">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Jonas & Elivaldo · Loja profissional</p>
            <h1>Loja</h1>
          </div>
          <p className="page-heading__results">{resultSummary}</p>
        </div>

        <div className="catalog-layout">
          <ProductFilters brands={brands} categories={categories} />
          <div className="catalog-content">
            <BrandRail brands={brands.filter((brand) => !brand.parentId)} />
            <div className="catalog-toolbar">
              <p className="catalog-toolbar__title">Produtos profissionais</p>
              <label className="catalog-toolbar__sort">
                <span>Ordenar por</span>
                <select defaultValue="recent">
                  <option value="recent">Mais recentes</option>
                  <option value="price-asc">Menor preço</option>
                  <option value="price-desc">Maior preço</option>
                </select>
              </label>
            </div>

            {loading ? <p className="empty-state" role="status">Carregando produtos…</p> : null}
            {!loading && products.length === 0 ? (
              <div className="empty-state">
                <h2>Seu catálogo será exibido aqui assim que a importação terminar.</h2>
                <p>As categorias, marcas, imagens e preços do WooCommerce entrarão nesta grade sem alterar a experiência de compra.</p>
              </div>
            ) : null}
            <section className="product-grid" aria-label="Produtos">
              {visibleProducts.map((product) => <ProductCard key={product.publicId} product={product} />)}
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
