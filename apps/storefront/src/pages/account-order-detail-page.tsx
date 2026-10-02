import { useEffect, useState } from 'react';
import { Icon } from '@commerce/ui';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AccountApiError, AccountOrder, accountApi } from '../features/account/account-client';
import { AccountOrderTimeline, AccountStatusBadge } from '../features/account/account-components';
import { formatAccountCurrency, formatAccountDateTime, paymentStatusLabel } from '../features/account/account-presenters';

function addressLine(address: Record<string, string> | null) {
  if (!address) return null;
  return <><strong>{address.recipientName || 'Endereço de entrega'}</strong><p>{address.street || ''}{address.number ? `, ${address.number}` : ''}{address.complement ? `, ${address.complement}` : ''}<br />{address.district || ''}{address.city ? ` · ${address.city}` : ''}{address.state ? ` — ${address.state}` : ''}<br />{address.postalCode ? `CEP ${address.postalCode}` : ''}</p></>;
}

export function AccountOrderDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<AccountOrder | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!publicId) return;
    void accountApi.order(publicId).then(setOrder).catch((cause: unknown) => setError(cause instanceof AccountApiError && cause.status === 404 ? 'Pedido não encontrado.' : 'Não foi possível carregar este pedido.'));
  }, [publicId]);

  if (error) return <div className="account-state account-state--error" role="alert"><Icon name="circle-alert" size={22} strokeWidth={1.8} /><div><strong>Não foi possível abrir o pedido</strong><p>{error}</p><Link className="button button--secondary" to="/conta/pedidos">Voltar aos pedidos</Link></div></div>;
  if (!order) return <div className="account-state account-state--inline" role="status"><span className="account-spinner" aria-hidden="true" />Carregando detalhes…</div>;

  return <div className="account-page-content account-order-detail"><div className="account-detail-back"><button className="account-inline-link" type="button" onClick={() => navigate('/conta/pedidos')}><Icon name="arrow-left" size={15} strokeWidth={2} />Voltar aos pedidos</button><AccountStatusBadge status={order.status} /></div><div className="account-detail-title"><div><p className="eyebrow">Pedido realizado em {formatAccountDateTime(order.createdAt)}</p><h2>Pedido #{order.publicId.slice(-8).toUpperCase()}</h2></div><strong>{formatAccountCurrency(order.totalCents)}</strong></div><div className="account-detail-grid"><section className="account-panel"><div className="account-panel__heading"><div><p className="eyebrow">Resumo da compra</p><h3>Itens do pedido</h3></div></div><ul className="account-order-items">{order.items.map((item) => <li key={item.id}><div className="account-order-item__image"><Icon name="package" size={20} strokeWidth={1.6} /></div><div><strong>{item.name}</strong><span>{item.sku ? `SKU ${item.sku} · ` : ''}{item.quantity} {item.quantity === 1 ? 'unidade' : 'unidades'}</span></div><b>{formatAccountCurrency(item.totalCents)}</b></li>)}</ul><dl className="account-totals"><div><dt>Subtotal</dt><dd>{formatAccountCurrency(order.subtotalCents)}</dd></div>{order.discountCents > 0 ? <div><dt>Desconto</dt><dd className="account-price--success">− {formatAccountCurrency(order.discountCents)}</dd></div> : null}<div><dt>Frete</dt><dd>{order.shippingCents ? formatAccountCurrency(order.shippingCents) : 'Grátis'}</dd></div><div className="account-totals__total"><dt>Total</dt><dd>{formatAccountCurrency(order.totalCents)}</dd></div></dl></section><div className="account-detail-side"><section className="account-panel account-panel--compact"><p className="eyebrow">Acompanhe o pedido</p><h3>Status da compra</h3>{order.statusHistory.length ? <AccountOrderTimeline history={order.statusHistory} /> : <p className="account-muted">Atualizações do pedido aparecerão aqui.</p>}</section><section className="account-panel account-panel--compact"><p className="eyebrow">Entrega</p><h3>{order.shippingMethodCode || 'Endereço informado'}</h3>{addressLine(order.shippingAddressJson) ?? <p className="account-muted">Endereço não informado.</p>}{order.shippingDays ? <span className="account-delivery-note">Prazo estimado: até {order.shippingDays} dias</span> : null}</section><section className="account-panel account-panel--compact"><p className="eyebrow">Pagamento</p><h3>{order.payments[0]?.method === 'PIX' ? 'Pix' : 'Cartão de crédito'}</h3>{order.payments.length ? order.payments.map((payment) => <div className="account-payment-row" key={payment.publicId}><span>{payment.status === 'PAID' ? 'Pagamento aprovado' : paymentStatusLabel(payment.status)}</span><strong>{formatAccountCurrency(payment.amountCents)}</strong></div>) : <p className="account-muted">Pagamento será atualizado após a confirmação.</p>}</section></div></div></div>;
}
