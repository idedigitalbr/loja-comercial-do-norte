import { useEffect, useState } from 'react';
import { CartDrawer } from '../features/cart/cart-drawer';
import { getOrCreateCart } from '../features/cart/cart-client';

export function CartPage() {
  const [publicId, setPublicId] = useState<string | null>(null);

  useEffect(() => {
    void getOrCreateCart()
      .then(setPublicId)
      .catch(() => setPublicId(null));
  }, []);

  return (
    <main className="page-section">
      <div className="site-container">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Sua seleção</p>
            <h1>Carrinho</h1>
          </div>
          <p>Revise seus produtos e siga para uma finalização segura com atendimento pelo WhatsApp.</p>
        </div>
        {publicId ? (
          <div className="cart-layout">
            <CartDrawer publicId={publicId} />
            <aside className="cart-summary" aria-label="Resumo do pedido">
              <p className="eyebrow">Próximo passo</p>
              <h2>Finalize sua compra</h2>
              <p>Escolha entrega ou retirada no checkout.</p>
              <a className="button button--primary" href="/checkout">Finalizar compra</a>
            </aside>
          </div>
        ) : <p className="empty-state" role="status">Carregando carrinho…</p>}
      </div>
    </main>
  );
}
