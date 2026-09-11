import { useEffect, useState } from 'react';
import { CartDrawer } from '../features/cart/cart-drawer';

export function CartPage() {
  const [publicId, setPublicId] = useState<string | null>(null);

  useEffect(() => {
    void fetch('/api/v1/carts', { method: 'POST', credentials: 'include' })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((cart: { publicId?: string } | null) => setPublicId(cart?.publicId ?? null))
      .catch(() => setPublicId(null));
  }, []);

  return <main><h1>Carrinho</h1>{publicId ? <CartDrawer publicId={publicId} /> : <p role="status">Carregando carrinho…</p>}</main>;
}
