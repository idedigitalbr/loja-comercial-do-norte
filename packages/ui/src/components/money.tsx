export type MoneyProps = {
  amountCents: number;
  currency?: 'BRL';
};

export function formatMoney(amountCents: number, currency: 'BRL' = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(amountCents / 100);
}

export function Money({ amountCents, currency = 'BRL' }: MoneyProps) {
  return <span>{formatMoney(amountCents, currency)}</span>;
}
