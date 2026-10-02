import { ReactNode, useEffect, useRef } from 'react';
import { Icon } from '@commerce/ui';
import { Link } from 'react-router-dom';
import { AccountAddress, AccountOrderSummary } from './account-client';
import { accountStatusLabel, accountStatusTone, formatAccountCurrency, formatAccountDate, formatAccountDateTime } from './account-presenters';

export function AccountStatusBadge({ status }: { status: string }) {
  return <span className={`account-status account-status--${accountStatusTone(status)}`}>{accountStatusLabel(status)}</span>;
}

export function AccountMetricCard({ icon, label, value, detail }: { icon: 'package' | 'heart' | 'credit-card'; label: string; value: string; detail?: string }) {
  return <article className="account-metric"><span className="account-metric__icon" aria-hidden="true"><Icon name={icon} size={19} strokeWidth={1.8} /></span><div><p>{label}</p><strong>{value}</strong>{detail ? <small>{detail}</small> : null}</div></article>;
}

export function AccountOrderCard({ order }: { order: AccountOrderSummary }) {
  return <article className="account-order-card"><div className="account-order-card__top"><div><span className="account-card__label">Pedido</span><strong>#{order.publicId.slice(-8).toUpperCase()}</strong></div><AccountStatusBadge status={order.status} /></div><div className="account-order-card__bottom"><span>{formatAccountDate(order.createdAt)}</span><strong>{formatAccountCurrency(order.totalCents)}</strong><Link className="account-inline-link" to={`/conta/pedidos/${encodeURIComponent(order.publicId)}`}>Ver detalhes <Icon name="arrow-right" size={15} strokeWidth={2} /></Link></div></article>;
}

export function AccountEmptyState({ icon, title, description, action }: { icon: 'package' | 'heart' | 'map-pin'; title: string; description: string; action?: ReactNode }) {
  return <div className="account-empty-state"><span className="account-empty-state__icon" aria-hidden="true"><Icon name={icon} size={24} strokeWidth={1.7} /></span><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export function AccountAddressCard({ address, onEdit, onDelete, onDefault, busy }: { address: AccountAddress; onEdit: () => void; onDelete: () => void; onDefault: () => void; busy?: boolean }) {
  return <article className={`account-address-card${address.isDefault ? ' is-default' : ''}`}><div className="account-address-card__top"><div><span className="account-card__label">{address.label}</span>{address.isDefault ? <span className="account-default-tag"><Icon name="check" size={12} strokeWidth={2.2} /> Principal</span> : null}</div><button className="account-icon-button" type="button" aria-label={`Editar endereço ${address.label}`} onClick={onEdit} disabled={busy}><Icon name="edit-3" size={17} strokeWidth={1.8} /></button></div><strong>{address.recipientName}</strong><p>{address.street}, {address.number}{address.complement ? `, ${address.complement}` : ''}<br />{address.district} · {address.city} — {address.state}<br />CEP {address.postalCode}</p><div className="account-card-actions">{!address.isDefault ? <button className="account-text-button" type="button" onClick={onDefault} disabled={busy}>Tornar principal</button> : <span />}{!address.isDefault ? <button className="account-text-button account-text-button--danger" type="button" onClick={onDelete} disabled={busy}>Excluir</button> : null}</div></article>;
}

export function AccountOrderTimeline({ history }: { history: Array<{ id: string; fromStatus: string | null; toStatus: string; reason: string | null; createdAt: string }> }) {
  return <ol className="account-timeline">{history.map((event, index) => <li className={index === history.length - 1 ? 'is-current' : ''} key={event.id}><span className="account-timeline__dot" aria-hidden="true"><Icon name={index === history.length - 1 ? 'circle-check' : 'check'} size={13} strokeWidth={2} /></span><div><strong>{accountStatusLabel(event.toStatus)}</strong><span>{formatAccountDateTime(event.createdAt)}</span>{event.reason ? <small>{event.reason}</small> : null}</div></li>)}</ol>;
}

export function ConfirmDialog({ title, description, confirmLabel = 'Confirmar', onConfirm, onClose, busy }: { title: string; description: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void; busy?: boolean }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('keydown', handleKeyDown); previous?.focus(); };
  }, [busy, onClose]);
  return <div className="account-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}><div className="account-dialog" role="dialog" aria-modal="true" aria-labelledby="account-dialog-title" tabIndex={-1} ref={dialogRef}><button className="account-dialog__close" type="button" aria-label="Fechar" onClick={onClose} disabled={busy}><Icon name="x" size={18} strokeWidth={1.8} /></button><span className="account-dialog__icon" aria-hidden="true"><Icon name="trash-2" size={20} strokeWidth={1.8} /></span><h2 id="account-dialog-title">{title}</h2><p>{description}</p><div className="account-dialog__actions"><button className="button button--secondary" type="button" onClick={onClose} disabled={busy}>Cancelar</button><button className="button button--primary" type="button" onClick={onConfirm} disabled={busy}>{busy ? 'Aguarde…' : confirmLabel}</button></div></div></div>;
}

export function AccountFieldError({ message }: { message?: string }) {
  return message ? <span className="account-field-error" role="alert">{message}</span> : null;
}
