import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatQuoteMoney, formatQuotePhone, nextQuoteStatuses, QUOTE_STATUS_LABELS, quoteStatusLabel, type QuoteStatus } from './quotes-utils';

type QuoteItem = {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
};

type Quote = {
  id: string;
  publicId: string;
  status: QuoteStatus;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  companyName: string | null;
  notes: string | null;
  itemsCount: number;
  subtotalCents: number;
  createdAt: string;
  answeredAt: string | null;
  items: QuoteItem[];
};

type QuoteListResponse = {
  items: Quote[];
  total: number;
  page: number;
  pageSize: number;
  counts: Record<string, number>;
};

const PAGE_SIZE = 20;

/** Fila de cotações: o comercial visualiza, acompanha e muda o estágio. */
export function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'ALL' | QuoteStatus>('ALL');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selected, setSelected] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (status !== 'ALL') params.set('status', status);
    if (appliedSearch.trim()) params.set('search', appliedSearch.trim());
    try {
      const response = await fetch(`/api/v1/admin/quotes?${params}`, { credentials: 'include' });
      if (!response.ok) {
        setError('Não foi possível carregar as cotações.');
        return;
      }
      const payload = await response.json() as QuoteListResponse;
      setQuotes(payload.items);
      setTotal(payload.total);
      setCounts(payload.counts ?? {});
      setError('');
    } catch {
      setError('Falha de conexão ao carregar as cotações.');
    } finally {
      setLoading(false);
    }
  }, [page, status, appliedSearch]);

  useEffect(() => { void load(); }, [load]);

  const open = counts.REQUESTED ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function changeStatus(quote: Quote, nextStatus: QuoteStatus) {
    if (nextStatus === quote.status) return;
    const response = await fetch(`/api/v1/admin/quotes/${quote.id}/status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus, reason: 'Atualização no painel administrativo' }),
    });
    if (!response.ok) {
      setError('Transição não permitida para esta cotação.');
      return;
    }
    setMessage(`Cotação ${quote.publicId} atualizada para ${quoteStatusLabel(nextStatus)}.`);
    setError('');
    setSelected(null);
    await load();
  }

  const resultsLabel = useMemo(() => `${total} cotação(ões) · ${open} aguardando atendimento`, [total, open]);

  return (
    <section className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Comercial</p>
          <h2>Cotações</h2>
        </div>
        <p>Solicitações enviadas pela loja. Nenhuma cobrança ou reserva de estoque acontece aqui.</p>
      </div>

      {message ? <p className="admin-success" role="status">{message}</p> : null}
      {error ? <p className="admin-error" role="alert">{error}</p> : null}

      <div className="admin-card admin-toolbar admin-toolbar--filters">
        <form
          className="admin-search"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setAppliedSearch(search);
          }}
        >
          <span>Buscar cotação</span>
          <input
            aria-label="Buscar por protocolo, nome, telefone ou empresa"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Protocolo, nome, telefone ou empresa"
            value={search}
          />
        </form>
        <label>
          Status
          <select
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value as 'ALL' | QuoteStatus);
            }}
            value={status}
          >
            <option value="ALL">Todos os status</option>
            {Object.entries(QUOTE_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <button className="admin-button admin-button--compact" type="button" onClick={() => void load()}>Atualizar</button>
      </div>

      <p className="admin-eyebrow">{resultsLabel}</p>

      <div className="admin-card admin-table-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Protocolo</th>
                <th>Solicitante</th>
                <th>Itens</th>
                <th>Referência</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => {
                const options = nextQuoteStatuses(quote.status);
                return (
                  <tr key={quote.id}>
                    <td>
                      <strong>{quote.publicId.slice(-8)}</strong>
                      <small className="admin-table__subline">{new Date(quote.createdAt).toLocaleString('pt-BR')}</small>
                    </td>
                    <td>
                      {quote.customerName}
                      <small className="admin-table__subline">{formatQuotePhone(quote.customerPhone)}{quote.companyName ? ` · ${quote.companyName}` : ''}</small>
                    </td>
                    <td>{quote.itemsCount}</td>
                    <td><strong>{formatQuoteMoney(quote.subtotalCents)}</strong></td>
                    <td><span className={`admin-status admin-status--${quote.status.toLowerCase()}`}>{quoteStatusLabel(quote.status)}</span></td>
                    <td>
                      <div className="admin-inline-actions">
                        <button className="admin-button admin-button--compact" type="button" onClick={() => setSelected(quote)}>Ver</button>
                        {options.length ? (
                          <select
                            aria-label={`Alterar status da cotação ${quote.publicId}`}
                            className="admin-inline-select"
                            onChange={(event) => void changeStatus(quote, event.target.value as QuoteStatus)}
                            value={quote.status}
                          >
                            <option value={quote.status}>{quoteStatusLabel(quote.status)}</option>
                            {options.map((option) => <option key={option} value={option}>{quoteStatusLabel(option)}</option>)}
                          </select>
                        ) : <span className="admin-table__subline">Encerrada</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && !quotes.length ? <p className="admin-empty">Nenhuma cotação encontrada com os filtros atuais.</p> : null}
          {loading ? <p className="admin-empty">Carregando cotações…</p> : null}
        </div>
      </div>

      <div className="admin-pagination">
        <button className="admin-button admin-button--compact" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">Anterior</button>
        <span>Página {page} de {lastPage}</span>
        <button className="admin-button admin-button--compact" disabled={page >= lastPage} onClick={() => setPage((current) => current + 1)} type="button">Próxima</button>
      </div>

      {selected ? (
        <div className="admin-modal-backdrop" role="dialog" aria-label={`Cotação ${selected.publicId}`} aria-modal="true">
          <div className="admin-modal">
            <header className="admin-modal__header">
              <div>
                <p className="admin-eyebrow">Cotação {selected.publicId}</p>
                <h3>{selected.customerName}</h3>
              </div>
              <button className="admin-button admin-button--compact" type="button" onClick={() => setSelected(null)}>Fechar</button>
            </header>
            <dl className="admin-detail-grid">
              <div><dt>WhatsApp</dt><dd>{formatQuotePhone(selected.customerPhone)}</dd></div>
              <div><dt>E-mail</dt><dd>{selected.customerEmail ?? '—'}</dd></div>
              <div><dt>Empresa</dt><dd>{selected.companyName ?? '—'}</dd></div>
              <div><dt>Status</dt><dd>{quoteStatusLabel(selected.status)}</dd></div>
            </dl>
            {selected.notes ? <p className="admin-note"><strong>Observações:</strong> {selected.notes}</p> : null}
            <table className="admin-table">
              <thead><tr><th>Produto</th><th>SKU</th><th>Qtd.</th><th>Unitário</th><th>Total</th></tr></thead>
              <tbody>
                {selected.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.productName}</td>
                    <td>{item.sku}</td>
                    <td>{item.quantity}</td>
                    <td>{formatQuoteMoney(item.unitPriceCents)}</td>
                    <td>{formatQuoteMoney(item.totalCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="admin-inline-actions">
              {nextQuoteStatuses(selected.status).map((option) => (
                <button className="admin-button admin-button--compact" key={option} onClick={() => void changeStatus(selected, option)} type="button">
                  {quoteStatusLabel(option)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
