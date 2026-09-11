import { useEffect, useState } from 'react';

type Order = { publicId: string; status: string; totalCents: number; createdAt: string };

export function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => { void fetch('/api/v1/orders', { credentials: 'include' }).then(async (response) => (response.ok ? response.json() as Promise<Order[]> : [])).then(setOrders); }, []);
  return <main><h1>Meus pedidos</h1><ul>{orders.map((order) => <li key={order.publicId}><a href={`/pedido/${order.publicId}`}>{order.publicId}</a> — {order.status} — R$ {(order.totalCents / 100).toFixed(2).replace('.', ',')}</li>)}</ul></main>;
}
