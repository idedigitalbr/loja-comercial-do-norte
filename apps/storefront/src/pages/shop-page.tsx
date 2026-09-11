import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductFilters } from '../features/catalog/product-filters';
import { ProductCard, StoreProduct } from '../features/catalog/product-card';

export function ShopPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = new URLSearchParams(searchParams);
    setLoading(true);
    void fetch(`/api/v1/catalog/products?${query.toString()}`)
      .then(async (response) => (response.ok ? response.json() : []))
      .then((payload: StoreProduct[]) => setProducts(payload))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <main>
      <h1>Loja</h1>
      <ProductFilters />
      {loading ? <p role="status">Carregando produtos…</p> : null}
      {!loading && products.length === 0 ? <p>Nenhum produto encontrado.</p> : null}
      <section aria-label="Produtos">
        {products.map((product) => <ProductCard key={product.publicId} product={product} />)}
      </section>
    </main>
  );
}
