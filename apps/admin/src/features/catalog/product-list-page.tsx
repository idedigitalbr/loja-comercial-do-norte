import { useEffect, useState } from 'react';
import { ProductDraft, ProductForm } from './product-form';

type Product = ProductDraft & { id: string; status: string };

export function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);

  async function loadProducts() {
    const response = await fetch('/api/v1/admin/catalog/products', { credentials: 'include' });
    if (response.ok) setProducts((await response.json()) as Product[]);
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  async function createProduct(draft: ProductDraft) {
    await fetch('/api/v1/admin/catalog/products', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    await loadProducts();
  }

  return (
    <main>
      <h1>Produtos</h1>
      <ProductForm onSave={createProduct} />
      <ul>
        {products.map((product) => <li key={product.id}>{product.name} — {product.status}</li>)}
      </ul>
    </main>
  );
}
