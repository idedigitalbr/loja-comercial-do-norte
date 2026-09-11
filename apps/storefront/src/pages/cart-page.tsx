import { useEffect, useState } from 'react';
import { CartDrawer } from '../features/cart/cart-drawer';

export function CartPage() {
  const [publicId, setPublicId] = useState<string | null>(null);

  useEffect(() => {
    void fetch('/api/v1/carts', { method: 'POST', credentials: 'include' })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((cart: { publicId?: string } | null) => {
        const nextPublicId = cart?.publicId ?? null;
        if (nextPublicId) window.localStorage.setItem('je_cart_public_id', nextPublicId);
        setPublicId(nextPublicId);
      })
      .catch(() => setPublicId(null));
  }, []);

  return <main><h1>Carrinho</h1>{publicId ? <><CartDrawer publicId={publicId} /><a href="/checkout">Finalizar compra</a></> : <p role="status">Carregando carrinho…</p>}</main>;
}
