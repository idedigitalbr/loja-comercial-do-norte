import { useEffect, useState } from 'react';

type Order = { id: string; publicId: string; status: string; totalCents: number };

export function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => { void fetch('/api/v1/admin/orders', { credentials: 'include' }).then(async (response) => (response.ok ? response.json() as Promise<Order[]> : [])).then(setOrders); }, []);
  return <main><h1>Pedidos</h1><ul>{orders.map((order) => <li key={order.id}>{order.publicId} — {order.status} — R$ {(order.totalCents / 100).toFixed(2).replace('.', ',')}</li>)}</ul></main>;
}
