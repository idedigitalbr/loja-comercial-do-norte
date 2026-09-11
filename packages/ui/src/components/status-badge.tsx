const statusLabels: Record<string, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  PENDING: 'Pendente',
  PAID: 'Pago',
  CANCELLED: 'Cancelado',
  DRAFT: 'Rascunho',
};

export type StatusBadgeProps = {
  status: string;
  label?: string;
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <span className={`commerce-status-badge commerce-status-badge--${normalizedStatus}`}>
      {label ?? statusLabels[status] ?? status}
    </span>
  );
}
