export const accountStatusLabels: Record<string, string> = {
  DRAFT: 'Rascunho',
  AWAITING_PAYMENT: 'Aguardando pagamento',
  PAID: 'Pagamento aprovado',
  PREPARING: 'Em preparação',
  SHIPPED: 'Enviado',
  READY_FOR_PICKUP: 'Pronto para retirada',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  PARTIALLY_REFUNDED: 'Reembolso parcial',
  REFUNDED: 'Reembolsado',
};

export const paymentStatusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  FAILED: 'Falhou',
  EXPIRED: 'Expirado',
  REFUNDED: 'Reembolsado',
};

export function accountStatusLabel(status: string) {
  return accountStatusLabels[status] ?? status.replaceAll('_', ' ').toLocaleLowerCase('pt-BR');
}

export function paymentStatusLabel(status: string) {
  return paymentStatusLabels[status] ?? status.replaceAll('_', ' ').toLocaleLowerCase('pt-BR');
}

export function formatAccountCurrency(amountCents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amountCents / 100);
}

export function formatAccountDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Belem' }).format(new Date(value)).replace('.', '');
}

export function formatAccountDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Belem' }).format(new Date(value)).replace('.', '');
}

export function formatPostalCode(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export function accountStatusTone(status: string) {
  if (['PAID', 'COMPLETED', 'READY_FOR_PICKUP'].includes(status)) return 'success';
  if (['CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'].includes(status)) return 'danger';
  if (status === 'SHIPPED') return 'info';
  return 'warning';
}
