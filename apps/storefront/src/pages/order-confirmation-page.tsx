import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

type OrderSnapshot = {
  publicId: string;
  status: string;
  totalCents: number;
  items: Array<{ name: string; quantity: number; totalCents: number }>;
};

const statusLabels: Record<string, string> = {
  AWAITING_PAYMENT: 'Aguardando pagamento',
  PAID: 'Pagamento aprovado',
  PREPARING: 'Em preparação',
  SHIPPED: 'Enviado',
  READY_FOR_PICKUP: 'Pronto para retirada',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function OrderConfirmationPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const [order, setOrder] = useState<OrderSnapshot | null>(null);

  useEffect(() => {
    if (!publicId) return;
    void fetch(`/api/v1/checkout/${publicId}`, { credentials: 'include' })
      .then(async (response) => (response.ok ? response.json() as Promise<OrderSnapshot> : null))
      .then(setOrder)
      .catch(() => setOrder(null));
  }, [publicId]);

  if (!order) {
    return <main className="page-section"><div className="site-container"><p className="empty-state" role="status">Carregando pedido…</p></div></main>;
  }

  return (
    <main className="page-section">
      <div className="site-container">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Pedido recebido</p>
            <h1>Pedido {order.publicId}</h1>
          </div>
          <p>Confira os itens e acompanhe a atualização do pagamento e da entrega.</p>
        </div>
        <section className="form-panel order-confirmation" aria-label="Resumo do pedido">
          <p className="order-confirmation__status" role="status">{statusLabels[order.status] ?? order.status}</p>
          <ul className="order-confirmation__items">
            {order.items.map((item, index) => <li key={`${item.name}-${index}`}><span>{item.name} × {item.quantity}</span><strong>{money.format(item.totalCents / 100)}</strong></li>)}
          </ul>
          <p className="checkout-total">Total: {money.format(order.totalCents / 100)}</p>
          <a className="button button--primary" href="/loja">Continuar comprando</a>
        </section>
      </div>
    </main>
  );
}
