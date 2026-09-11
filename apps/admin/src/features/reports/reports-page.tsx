import { useState } from 'react';

export function ReportsPage() {
  const [summary, setSummary] = useState<{ grossCents: number; refundedCents: number; netCents: number } | null>(null);
  async function load() {
    const to = new Date();
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    const response = await fetch(`/api/v1/admin/reports/sales-summary?from=${from.toISOString()}&to=${to.toISOString()}`, { credentials: 'include' });
    if (response.ok) setSummary(await response.json());
  }
  return <main><h1>Relatórios</h1><button onClick={() => void load()}>Atualizar vendas</button>{summary ? <p>Bruto: R$ {(summary.grossCents / 100).toFixed(2)} — Reembolsos: R$ {(summary.refundedCents / 100).toFixed(2)} — Líquido: R$ {(summary.netCents / 100).toFixed(2)}</p> : null}</main>;
}
