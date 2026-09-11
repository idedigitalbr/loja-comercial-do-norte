import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { StoreProduct } from '../features/catalog/product-card';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<StoreProduct | null>(null);

  useEffect(() => {
    if (!slug) return;
    void fetch(`/api/v1/catalog/products/${slug}`)
      .then(async (response) => (response.ok ? response.json() : null))
      .then((payload: StoreProduct | null) => setProduct(payload))
      .catch(() => setProduct(null));
  }, [slug]);

  if (!product) return <main><p role="status">Carregando produto…</p></main>;
  return <main><p>{product.brandName}</p><h1>{product.name}</h1><p>SKU e detalhes do produto disponíveis no checkout.</p></main>;
}
