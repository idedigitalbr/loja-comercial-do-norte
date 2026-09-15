import { useEffect, useState } from 'react';

type CartItem = { id: string; quantity: number; unitPriceCents: number; variant: { id: string; product: { name: string } } };
type CartSnapshot = { items: CartItem[]; subtotalCents: number };

function normalizeCart(payload: Partial<CartSnapshot> | null): CartSnapshot {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  return {
    items,
    subtotalCents: typeof payload?.subtotalCents === 'number'
      ? payload.subtotalCents
      : items.reduce((total, item) => total + item.quantity * item.unitPriceCents, 0),
  };
}

export function CartDrawer({ publicId }: { publicId: string }) {
  const [cart, setCart] = useState<CartSnapshot>({ items: [], subtotalCents: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    void fetch(`/api/v1/carts/${publicId}`, { credentials: 'include' })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((payload: CartSnapshot | null) => setCart(normalizeCart(payload)))
      .catch(() => setCart({ items: [], subtotalCents: 0 }));
  }, [publicId]);

  async function updateQuantity(item: CartItem, quantity: number) {
    setError('');
    const response = quantity < 1
      ? await fetch(`/api/v1/carts/${publicId}/items/${item.variant.id}`, { method: 'DELETE', credentials: 'include' })
      : await fetch(`/api/v1/carts/${publicId}/items/${item.variant.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
    if (!response.ok) {
      setError('Não foi possível atualizar o carrinho.');
      return;
    }
    setCart(normalizeCart(await response.json() as CartSnapshot));
  }

  return (
    <aside className="cart-panel" aria-label="Carrinho">
      <h2>Seu carrinho</h2>
      {cart.items.length ? (
        <ul className="cart-panel__items">
          {cart.items.map((item) => (
            <li key={item.id} className="cart-panel__item">
              <div>
                <span>{item.variant.product.name}</span>
                <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPriceCents / 100)}</strong>
              </div>
              <div className="cart-panel__quantity" aria-label={`Quantidade de ${item.variant.product.name}`}>
                <button type="button" aria-label={`Diminuir quantidade de ${item.variant.product.name}`} onClick={() => void updateQuantity(item, item.quantity - 1)}>−</button>
                <span aria-live="polite">{item.quantity}</span>
                <button type="button" aria-label={`Aumentar quantidade de ${item.variant.product.name}`} onClick={() => void updateQuantity(item, item.quantity + 1)}>+</button>
              </div>
              <button className="cart-panel__remove" type="button" onClick={() => void updateQuantity(item, 0)}>Remover</button>
            </li>
          ))}
        </ul>
      ) : <p className="cart-panel__empty">Seu carrinho ainda está vazio.</p>}
      {cart.items.length ? <p className="cart-panel__subtotal">Subtotal <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cart.subtotalCents / 100)}</strong></p> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </aside>
  );
}
