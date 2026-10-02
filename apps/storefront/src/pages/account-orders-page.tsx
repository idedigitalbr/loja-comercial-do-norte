import { useEffect, useState } from 'react';
import { Icon } from '@commerce/ui';
import { Link, useSearchParams } from 'react-router-dom';
import { AccountOrder, accountApi, AccountApiError } from '../features/account/account-client';
import { AccountEmptyState, AccountOrderCard } from '../features/account/account-components';

const orderStatuses = [{ value: '', label: 'Todos os pedidos' }, { value: 'AWAITING_PAYMENT', label: 'Aguardando pagamento' }, { value: 'PREPARING', label: 'Em preparação' }, { value: 'SHIPPED', label: 'Enviados' }, { value: 'COMPLETED', label: 'Concluídos' }, { value: 'CANCELLED', label: 'Cancelados' }];

export function AccountOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const page = Math.max(1, Number(searchParams.get('pagina') ?? 1) || 1);
  const status = searchParams.get('status') ?? '';

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const response = await accountApi.orders({ page, status: status || undefined });
      setOrders(response.items);
      setTotal(response.total);
      setPageCount(response.pageCount);
    } catch (cause) {
      setError(cause instanceof AccountApiError ? cause.message : 'Não foi possível carregar seus pedidos.');
    } finally { setLoading(false); }
  }

  useEffect(() => { void loadOrders(); }, [page, status]);

  function updateFilter(nextStatus: string) {
    const next = new URLSearchParams(searchParams);
    if (nextStatus) next.set('status', nextStatus); else next.delete('status');
    next.delete('pagina');
    setSearchParams(next);
  }

  return <div className="account-page-content"><div className="account-content-heading"><div><p className="eyebrow">Histórico de compras</p><h2>Meus pedidos</h2><p>Consulte o andamento e os detalhes de cada compra.</p></div><label className="account-select-label">Filtrar por status<select aria-label="Filtrar pedidos por status" value={status} onChange={(event) => updateFilter(event.target.value)}>{orderStatuses.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label></div>{loading ? <div className="account-state account-state--inline" role="status"><span className="account-spinner" aria-hidden="true" />Carregando pedidos…</div> : error ? <div className="account-state account-state--error" role="alert"><Icon name="circle-alert" size={21} strokeWidth={1.8} /><div><strong>Não foi possível carregar seus pedidos</strong><p>{error}</p><button className="button button--secondary" type="button" onClick={() => void loadOrders()}>Tentar novamente</button></div></div> : orders.length ? <><div className="account-list-summary"><span>{total} {total === 1 ? 'pedido encontrado' : 'pedidos encontrados'}</span></div><div className="account-orders-list">{orders.map((order) => <AccountOrderCard order={order} key={order.publicId} />)}</div>{pageCount > 1 ? <nav className="account-pagination" aria-label="Paginação de pedidos"><button type="button" aria-label="Página anterior" disabled={page <= 1} onClick={() => setSearchParams((current) => { const next = new URLSearchParams(current); next.set('pagina', String(page - 1)); return next; })}><Icon name="chevron-left" size={17} strokeWidth={2} /></button><span>Página {page} de {pageCount}</span><button type="button" aria-label="Próxima página" disabled={page >= pageCount} onClick={() => setSearchParams((current) => { const next = new URLSearchParams(current); next.set('pagina', String(page + 1)); return next; })}><Icon name="chevron-right" size={17} strokeWidth={2} /></button></nav> : null}</> : <AccountEmptyState icon="package" title="Nenhum pedido por aqui" description="Explore nossa loja e encontre produtos profissionais para a sua rotina." action={<Link className="button button--primary" to="/loja">Ir para a loja</Link>} />}</div>;
}
