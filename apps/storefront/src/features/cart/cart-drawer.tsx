import { useEffect, useState } from 'react';

type CartItem = { id: string; quantity: number; unitPriceCents: number; variant: { product: { name: string } } };

export function CartDrawer({ publicId }: { publicId: string }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    void fetch(`/api/v1/carts/${publicId}`)
      .then(async (response) => (response.ok ? response.json() : null))
      .then((cart: { items?: CartItem[] } | null) => setItems(cart?.items ?? []))
      .catch(() => setItems([]));
  }, [publicId]);

  return <aside aria-label="Carrinho"><h2>Seu carrinho</h2><ul>{items.map((item) => <li key={item.id}>{item.variant.product.name} × {item.quantity}</li>)}</ul></aside>;
}
