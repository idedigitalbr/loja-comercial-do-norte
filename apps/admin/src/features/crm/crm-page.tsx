import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@commerce/ui';
import {
  formatQuoteMoney,
  formatQuotePhone,
  nextQuoteStatuses,
  quoteStatusLabel,
  type QuoteStatus,
} from '../quotes/quotes-utils';
import {
  CrmLead,
  CrmOriginFilter,
  CrmViewMode,
  extractChatMessages,
  getLeadOriginMeta,
  LEAD_STAGE_COLORS,
  LEAD_STAGE_LABELS,
  LeadQuote,
  LeadStage,
  STORE_OPTIONS,
} from './crm-types';

const STAGES: LeadStage[] = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'WON', 'LOST'];

const QUOTE_ACTION_LABELS: Partial<Record<QuoteStatus, string>> = {
  IN_REVIEW: 'Colocar em análise',
  ANSWERED: 'Marcar proposta enviada',
  WON: 'Fechar (Ganha)',
  LOST: 'Marcar como perdida',
  CANCELLED: 'Cancelar cotação',
  EXPIRED: 'Marcar expirada',
};

function formatPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

function buildWhatsAppUrl(lead: CrmLead): string {
  const digits = formatPhoneDigits(lead.customerPhone).replace(/^55/, '');
  const primaryQuote = lead.quotes?.[0];
  const text = primaryQuote
    ? `Olá, ${lead.customerName}! Aqui é da equipe Comercial do Norte (${lead.preferredStore}). Recebemos sua cotação #${primaryQuote.publicId.slice(-8)} (${primaryQuote.itemsCount} ${primaryQuote.itemsCount === 1 ? 'item' : 'itens'}) e já estamos preparando seu orçamento. Como posso te ajudar?`
    : `Olá, ${lead.customerName}! Aqui é da equipe Comercial do Norte (${lead.preferredStore}). Vi seu contato através do nosso assistente Norti no site sobre "${lead.subject}" e estou aqui para te atender!`;

  return `https://wa.me/55${digits}?text=${encodeURIComponent(text)}`;
}

function extractModalityFromNotes(notes?: string | null): string | null {
  if (!notes) return null;
  const match = notes.match(/\[Modalidade:\s*([^\]]+)\]/i);
  return match?.[1]?.trim() ?? null;
}

function stripMetadataTags(notes?: string | null): string {
  if (!notes) return '';
  return notes
    .replace(/\[(Unidade\/Loja mais próxima|Modalidade|Distância estimada):[^\]]+\]\s*/gi, '')
    .trim();
}

export function CRMPage({ initialQuotePublicId }: { initialQuotePublicId?: string }) {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedStore, setSelectedStore] = useState('ALL');
  const [originFilter, setOriginFilter] = useState<CrmOriginFilter>('ALL');
  const [stageFilter, setStageFilter] = useState<'ALL' | LeadStage>('ALL');
  const [viewMode, setViewMode] = useState<CrmViewMode>('kanban');
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [updatingQuoteId, setUpdatingQuoteId] = useState<string | null>(null);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStage | null>(null);
  const [consumedInitialQuote, setConsumedInitialQuote] = useState(false);

  const showSuccess = useCallback((text: string) => {
    setMessage(text);
    setError('');
    window.setTimeout(() => {
      setMessage((curr) => (curr === text ? '' : curr));
    }, 4000);
  }, []);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedStore !== 'ALL') params.set('storeId', selectedStore);
    if (search.trim()) params.set('search', search.trim());
    params.set('pageSize', '100');

    try {
      const res = await fetch(`/api/v1/admin/crm/leads?${params}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        setError('Não foi possível carregar os leads e cotações.');
        return;
      }
      const data = (await res.json()) as {
        items?: CrmLead[];
        counts?: Record<string, number>;
      };
      const nextItems = data.items ?? [];
      setLeads(nextItems);
      setCounts(data.counts ?? {});
      setSelectedLead((current) =>
        current ? nextItems.find((item) => item.id === current.id) ?? current : null,
      );
      setError('');
    } catch {
      setError('Falha de conexão com a API do CRM.');
    } finally {
      setLoading(false);
    }
  }, [selectedStore, search]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    if (!initialQuotePublicId || consumedInitialQuote || !leads.length) return;
    const matched = leads.find((lead) =>
      lead.quotes?.some(
        (quote) =>
          quote.publicId === initialQuotePublicId ||
          quote.publicId.endsWith(initialQuotePublicId),
      ),
    );
    if (matched) {
      setSelectedLead(matched);
      setConsumedInitialQuote(true);
    }
  }, [initialQuotePublicId, consumedInitialQuote, leads]);

  useEffect(() => {
    if (!selectedLead) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedLead(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedLead]);

  async function handleUpdateStage(leadId: string, newStage: LeadStage) {
    const current = leads.find((l) => l.id === leadId);
    if (current?.stage === newStage) return;

    try {
      const res = await fetch(`/api/v1/admin/crm/leads/${leadId}/stage`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) {
        setError('Erro ao atualizar estágio do lead.');
        return;
      }
      const updated = (await res.json()) as CrmLead;
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, ...updated, stage: newStage } : l)),
      );
      setSelectedLead((prev) =>
        prev && prev.id === leadId ? { ...prev, ...updated, stage: newStage } : prev,
      );
      showSuccess(`Lead movido para "${LEAD_STAGE_LABELS[newStage]}".`);
      void loadLeads();
    } catch {
      setError('Falha ao comunicar com o servidor.');
    }
  }

  async function handleUpdateQuoteStatus(quote: LeadQuote, nextStatus: QuoteStatus) {
    if (nextStatus === quote.status || updatingQuoteId) return;
    setUpdatingQuoteId(quote.id);
    try {
      const response = await fetch(`/api/v1/admin/quotes/${quote.id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          reason: 'Atualização no CRM (Leads & Cotações)',
        }),
      });
      if (!response.ok) {
        setError('Transição não permitida para esta cotação.');
        return;
      }
      showSuccess(
        `Cotação #${quote.publicId.slice(-8)} atualizada para "${quoteStatusLabel(nextStatus)}".`,
      );
      await loadLeads();
    } catch {
      setError('Falha de conexão ao atualizar a cotação.');
    } finally {
      setUpdatingQuoteId(null);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLead || !newNoteContent.trim() || savingNote) return;

    setSavingNote(true);
    try {
      const res = await fetch(`/api/v1/admin/crm/leads/${selectedLead.id}/notes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNoteContent.trim() }),
      });
      if (!res.ok) {
        setError('Erro ao adicionar anotação.');
        return;
      }
      const createdNote = await res.json();
      const updatedNotes = [createdNote, ...(selectedLead.leadNotes || [])];
      setSelectedLead({ ...selectedLead, leadNotes: updatedNotes });
      setLeads((prev) =>
        prev.map((l) => (l.id === selectedLead.id ? { ...l, leadNotes: updatedNotes } : l)),
      );
      setNewNoteContent('');
      showSuccess('Anotação registrada com sucesso!');
    } catch {
      setError('Falha ao salvar anotação.');
    } finally {
      setSavingNote(false);
    }
  }

  const originStats = useMemo(() => {
    let withQuote = 0;
    let chatOnly = 0;
    for (const lead of leads) {
      const meta = getLeadOriginMeta(lead);
      if (meta.hasQuote) withQuote += 1;
      else chatOnly += 1;
    }
    return { all: leads.length, withQuote, chatOnly };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const meta = getLeadOriginMeta(lead);
      if (originFilter === 'QUOTE' && !meta.hasQuote) return false;
      if (originFilter === 'CHAT' && meta.hasQuote) return false;
      if (viewMode === 'list' && stageFilter !== 'ALL' && lead.stage !== stageFilter) return false;
      return true;
    });
  }, [leads, originFilter, stageFilter, viewMode]);

  const leadsByStage = useMemo(() => {
    const map: Record<LeadStage, CrmLead[]> = {
      NEW: [],
      CONTACTED: [],
      IN_PROGRESS: [],
      WON: [],
      LOST: [],
    };
    for (const lead of filteredLeads) {
      if (map[lead.stage]) {
        map[lead.stage].push(lead);
      } else {
        map.NEW.push(lead);
      }
    }
    return map;
  }, [filteredLeads]);

  const totalLeads = counts.NEW !== undefined
    ? STAGES.reduce((sum, stage) => sum + (counts[stage] ?? 0), 0) || leads.length
    : leads.length;
  const newLeadsCount = counts.NEW ?? leadsByStage.NEW.length;
  const inProgressCount =
    (counts.CONTACTED ?? leadsByStage.CONTACTED.length) +
    (counts.IN_PROGRESS ?? leadsByStage.IN_PROGRESS.length);
  const wonCount = counts.WON ?? leadsByStage.WON.length;
  const conversionRate = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0;

  return (
    <section className="admin-page crm-page">
      <div className="admin-page__heading crm-page__heading">
        <div>
          <p className="admin-eyebrow">Comercial &amp; Atendimento</p>
          <h2>CRM (Leads &amp; Cotações)</h2>
        </div>
        <div className="crm-header-actions">
          <p>
            Pipeline unificado de oportunidades do Chat Norti e cotações da loja. Cada cotação
            entra como lead com itens, protocolo e histórico no mesmo lugar.
          </p>
          <div className="crm-view-switch" role="group" aria-label="Modo de visualização do CRM">
            <button
              className={`crm-view-switch__btn ${viewMode === 'kanban' ? 'is-active' : ''}`}
              onClick={() => setViewMode('kanban')}
              type="button"
            >
              <Icon name="layout-dashboard" size={15} strokeWidth={2} />
              <span>Kanban</span>
            </button>
            <button
              className={`crm-view-switch__btn ${viewMode === 'list' ? 'is-active' : ''}`}
              onClick={() => setViewMode('list')}
              type="button"
            >
              <Icon name="list" size={15} strokeWidth={2} />
              <span>Lista</span>
            </button>
          </div>
        </div>
      </div>

      {message ? (
        <p className="admin-success" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}

      {/* KPIs DE TOPO */}
      <div className="admin-kpi-grid crm-kpi-grid">
        <article className="admin-kpi">
          <div className="crm-kpi__top">
            <span>Total de Leads</span>
            <Icon name="users" size={16} strokeWidth={2} />
          </div>
          <strong>{totalLeads}</strong>
          <small>
            {originStats.withQuote} com cotação · {originStats.chatOnly} via chat
          </small>
        </article>
        <article className="admin-kpi">
          <div className="crm-kpi__top">
            <span>Novos no Funil</span>
            <Icon name="sparkles" size={16} strokeWidth={2} />
          </div>
          <strong style={{ color: '#1D4ED8' }}>{newLeadsCount}</strong>
          <small>Aguardando primeiro contato</small>
        </article>
        <article className="admin-kpi">
          <div className="crm-kpi__top">
            <span>Em Negociação</span>
            <Icon name="clipboard-list" size={16} strokeWidth={2} />
          </div>
          <strong style={{ color: '#7E22CE' }}>{inProgressCount}</strong>
          <small>Atendimento ou cotação ativa</small>
        </article>
        <article className="admin-kpi">
          <div className="crm-kpi__top">
            <span>Convertidos / Ganhos</span>
            <Icon name="trending-up" size={16} strokeWidth={2} />
          </div>
          <strong style={{ color: '#15803D' }}>{wonCount}</strong>
          <small>{conversionRate}% de taxa de conversão</small>
        </article>
      </div>

      {/* BARRA DE FILTROS E ORIGEM */}
      <div className="admin-card crm-toolbar">
        <div className="crm-origin-pills" role="tablist" aria-label="Filtrar por origem">
          <button
            aria-selected={originFilter === 'ALL'}
            className={`crm-pill ${originFilter === 'ALL' ? 'is-active' : ''}`}
            onClick={() => setOriginFilter('ALL')}
            role="tab"
            type="button"
          >
            Todos <span>{originStats.all}</span>
          </button>
          <button
            aria-selected={originFilter === 'QUOTE'}
            className={`crm-pill ${originFilter === 'QUOTE' ? 'is-active' : ''}`}
            onClick={() => setOriginFilter('QUOTE')}
            role="tab"
            type="button"
          >
            Com Cotação <span>{originStats.withQuote}</span>
          </button>
          <button
            aria-selected={originFilter === 'CHAT'}
            className={`crm-pill ${originFilter === 'CHAT' ? 'is-active' : ''}`}
            onClick={() => setOriginFilter('CHAT')}
            role="tab"
            type="button"
          >
            Chat Norti <span>{originStats.chatOnly}</span>
          </button>
        </div>

        <div className="crm-toolbar__controls">
          <div className="crm-search-wrap">
            <Icon name="search" size={15} strokeWidth={2} />
            <input
              aria-label="Buscar por cliente, telefone, empresa, protocolo ou assunto"
              className="crm-search-input"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cliente, WhatsApp, empresa ou protocolo..."
              type="search"
              value={search}
            />
          </div>

          <select
            aria-label="Filtrar por unidade"
            className="crm-select"
            onChange={(e) => setSelectedStore(e.target.value)}
            value={selectedStore}
          >
            {STORE_OPTIONS.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>

          {viewMode === 'list' ? (
            <select
              aria-label="Filtrar por estágio"
              className="crm-select"
              onChange={(e) => setStageFilter(e.target.value as 'ALL' | LeadStage)}
              value={stageFilter}
            >
              <option value="ALL">Todos os estágios</option>
              {STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {LEAD_STAGE_LABELS[stage]}
                </option>
              ))}
            </select>
          ) : null}

          <button
            className="admin-button admin-button--compact"
            onClick={() => void loadLeads()}
            type="button"
          >
            <Icon name="refresh-cw" size={14} strokeWidth={2} />
            <span style={{ marginLeft: '6px' }}>Atualizar</span>
          </button>
        </div>
      </div>

      {/* CONTEÚDO: KANBAN OU LISTA */}
      {loading ? (
        <div className="admin-card crm-loading-card">
          <p>Carregando pipeline de leads e cotações...</p>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="crm-kanban-scroll">
          <div className="crm-kanban-board">
            {STAGES.map((stage) => {
              const stageLeads = leadsByStage[stage];
              const colors = LEAD_STAGE_COLORS[stage];
              const isDropTarget = dragOverStage === stage;

              return (
                <div
                  key={stage}
                  className={`crm-column ${isDropTarget ? 'is-drag-over' : ''}`}
                  onDragLeave={() => {
                    if (dragOverStage === stage) setDragOverStage(null);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverStage !== stage) setDragOverStage(stage);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverStage(null);
                    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
                    setDraggedLeadId(null);
                    if (leadId) void handleUpdateStage(leadId, stage);
                  }}
                  style={{ borderColor: colors.border }}
                >
                  <div
                    className="crm-column__header"
                    style={{
                      backgroundColor: colors.bg,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <div className="crm-column__title" style={{ color: colors.text }}>
                      <span
                        className="crm-column__dot"
                        style={{ backgroundColor: colors.dot }}
                      />
                      <span>{LEAD_STAGE_LABELS[stage]}</span>
                    </div>
                    <span className="crm-column__count" style={{ color: colors.text }}>
                      {stageLeads.length}
                    </span>
                  </div>

                  <div className="crm-column__list">
                    {stageLeads.length === 0 ? (
                      <div className="crm-column__empty">Nenhum lead neste estágio</div>
                    ) : (
                      stageLeads.map((lead) => {
                        const originMeta = getLeadOriginMeta(lead);
                        const primaryQuote = lead.quotes?.[0];
                        const quotesCount = lead.quotes?.length ?? 0;
                        const wppUrl = buildWhatsAppUrl(lead);

                        return (
                          <article
                            key={lead.id}
                            className={`crm-card ${draggedLeadId === lead.id ? 'is-dragging' : ''}`}
                            draggable
                            onClick={() => setSelectedLead(lead)}
                            onDragEnd={() => {
                              setDraggedLeadId(null);
                              setDragOverStage(null);
                            }}
                            onDragStart={(e) => {
                              setDraggedLeadId(lead.id);
                              e.dataTransfer.setData('text/plain', lead.id);
                            }}
                          >
                            <div className="crm-card__top">
                              <span className={`crm-origin-badge crm-origin-badge--${originMeta.kind.toLowerCase()}`}>
                                {originMeta.label}
                              </span>
                              <span className="crm-card__date">
                                {new Date(lead.createdAt).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                })}
                              </span>
                            </div>

                            <div className="crm-card__identity">
                              <strong>{lead.customerName}</strong>
                              {primaryQuote?.companyName ? (
                                <small className="crm-card__company">
                                  {primaryQuote.companyName}
                                </small>
                              ) : null}
                            </div>

                            <div className="crm-card__meta">
                              <span className="crm-card__phone">
                                <Icon name="phone" size={12} strokeWidth={2} />
                                <span>{formatQuotePhone(lead.customerPhone)}</span>
                              </span>
                              <span className="crm-store-pill">
                                📍 {lead.preferredStore}
                              </span>
                            </div>

                            {primaryQuote ? (
                              <div className="crm-card__quote-box">
                                <div className="crm-card__quote-head">
                                  <strong>
                                    #{primaryQuote.publicId.slice(-8)}
                                    {quotesCount > 1 ? ` (+${quotesCount - 1})` : ''}
                                  </strong>
                                  <span
                                    className={`admin-status admin-status--${primaryQuote.status.toLowerCase()}`}
                                  >
                                    {quoteStatusLabel(primaryQuote.status)}
                                  </span>
                                </div>
                                <div className="crm-card__quote-summary">
                                  <span>
                                    {primaryQuote.itemsCount}{' '}
                                    {primaryQuote.itemsCount === 1 ? 'un.' : 'un.'}
                                    {primaryQuote.items?.[0]?.productName
                                      ? ` · ${primaryQuote.items[0].productName}`
                                      : ''}
                                  </span>
                                  <strong>{formatQuoteMoney(primaryQuote.subtotalCents)}</strong>
                                </div>
                              </div>
                            ) : (
                              <div className="crm-card__subject">
                                <span>🏷️ {lead.subject}</span>
                              </div>
                            )}

                            <div
                              className="crm-card__footer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <a
                                className="crm-wpp-btn"
                                href={wppUrl}
                                rel="noreferrer"
                                target="_blank"
                              >
                                💬 WhatsApp
                              </a>

                              <select
                                aria-label="Mudar estágio do lead"
                                className="crm-stage-select"
                                onChange={(e) =>
                                  void handleUpdateStage(lead.id, e.target.value as LeadStage)
                                }
                                value={lead.stage}
                              >
                                {STAGES.map((s) => (
                                  <option key={s} value={s}>
                                    {LEAD_STAGE_LABELS[s]}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </article>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="admin-card admin-table-card" style={{ marginTop: '1rem' }}>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Lead / Cliente</th>
                  <th>Origem &amp; Protocolo</th>
                  <th>Loja Preferencial</th>
                  <th>Cotação / Assunto</th>
                  <th>Estágio CRM</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  const originMeta = getLeadOriginMeta(lead);
                  const primaryQuote = lead.quotes?.[0];
                  const stageColor = LEAD_STAGE_COLORS[lead.stage];

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <strong>{lead.customerName}</strong>
                        <small className="admin-table__subline">
                          {formatQuotePhone(lead.customerPhone)}
                          {primaryQuote?.companyName ? ` · ${primaryQuote.companyName}` : ''}
                        </small>
                      </td>
                      <td>
                        <span
                          className={`crm-origin-badge crm-origin-badge--${originMeta.kind.toLowerCase()}`}
                        >
                          {originMeta.label}
                        </span>
                        <small className="admin-table__subline">
                          {primaryQuote
                            ? `#${primaryQuote.publicId.slice(-8)}`
                            : lead.publicId.slice(-8)}{' '}
                          · {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                        </small>
                      </td>
                      <td>{lead.preferredStore}</td>
                      <td>
                        {primaryQuote ? (
                          <div>
                            <strong>
                              {primaryQuote.itemsCount} un. ·{' '}
                              {formatQuoteMoney(primaryQuote.subtotalCents)}
                            </strong>
                            <small className="admin-table__subline">
                              Status: {quoteStatusLabel(primaryQuote.status)}
                            </small>
                          </div>
                        ) : (
                          <span>{lead.subject}</span>
                        )}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <select
                          aria-label={`Alterar estágio de ${lead.customerName}`}
                          className="admin-inline-select"
                          onChange={(e) =>
                            void handleUpdateStage(lead.id, e.target.value as LeadStage)
                          }
                          style={{
                            borderColor: stageColor.border,
                            color: stageColor.text,
                            backgroundColor: stageColor.bg,
                            fontWeight: 700,
                          }}
                          value={lead.stage}
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>
                              {LEAD_STAGE_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="admin-table__actions">
                          <a
                            className="crm-wpp-btn"
                            href={buildWhatsAppUrl(lead)}
                            rel="noreferrer"
                            target="_blank"
                          >
                            WhatsApp
                          </a>
                          <button
                            className="admin-button admin-button--compact"
                            onClick={() => setSelectedLead(lead)}
                            type="button"
                          >
                            Abrir ficha
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!filteredLeads.length ? (
              <p className="admin-empty" style={{ padding: '2rem', textAlign: 'center' }}>
                Nenhum lead ou cotação encontrado com os filtros atuais.
              </p>
            ) : null}
          </div>
        </div>
      )}

      {/* DRAWER / FICHA COMPLETA DO LEAD E SUAS COTAÇÕES */}
      {selectedLead ? (
        <div
          aria-label={`Ficha do lead ${selectedLead.customerName}`}
          aria-modal="true"
          className="crm-drawer-backdrop"
          onClick={() => setSelectedLead(null)}
          role="dialog"
        >
          <div className="crm-drawer" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const originMeta = getLeadOriginMeta(selectedLead);
              const chatData = extractChatMessages(selectedLead.conversationLog);
              const quotes = selectedLead.quotes ?? [];
              const primaryQuote = quotes[0];
              const modality = extractModalityFromNotes(
                primaryQuote?.notes ?? selectedLead.notes,
              );
              const cleanLeadNotes = stripMetadataTags(selectedLead.notes);

              return (
                <>
                  <header className="crm-drawer__header">
                    <div className="crm-drawer__title-group">
                      <div className="crm-drawer__badges">
                        <span
                          className={`crm-origin-badge crm-origin-badge--${originMeta.kind.toLowerCase()}`}
                        >
                          {originMeta.label}
                        </span>
                        <select
                          aria-label="Estágio do lead no funil"
                          className="crm-drawer__stage-select"
                          onChange={(e) =>
                            void handleUpdateStage(selectedLead.id, e.target.value as LeadStage)
                          }
                          style={{
                            backgroundColor: LEAD_STAGE_COLORS[selectedLead.stage].bg,
                            color: LEAD_STAGE_COLORS[selectedLead.stage].text,
                            borderColor: LEAD_STAGE_COLORS[selectedLead.stage].border,
                          }}
                          value={selectedLead.stage}
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>
                              {LEAD_STAGE_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <h3>{selectedLead.customerName}</h3>
                      <p className="crm-drawer__subtitle">
                        {primaryQuote?.companyName ? `${primaryQuote.companyName} · ` : ''}
                        {primaryQuote?.document ? `${primaryQuote.document} · ` : ''}
                        Registrado em{' '}
                        {new Date(selectedLead.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>

                    <button
                      aria-label="Fechar ficha do lead"
                      className="crm-drawer__close"
                      onClick={() => setSelectedLead(null)}
                      type="button"
                    >
                      <Icon name="x" size={18} strokeWidth={2} />
                    </button>
                  </header>

                  <div className="crm-drawer__body">
                    <a
                      className="crm-drawer__wpp-cta"
                      href={buildWhatsAppUrl(selectedLead)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span>💬</span>
                      <span>
                        Iniciar atendimento no WhatsApp com {selectedLead.customerName}
                      </span>
                    </a>

                    <div className="crm-info-grid">
                      <div>
                        <span>WhatsApp</span>
                        <strong>{formatQuotePhone(selectedLead.customerPhone)}</strong>
                      </div>
                      <div>
                        <span>Loja Preferencial</span>
                        <strong>{selectedLead.preferredStore}</strong>
                      </div>
                      <div>
                        <span>E-mail</span>
                        <strong>{selectedLead.customerEmail || primaryQuote?.customerEmail || '—'}</strong>
                      </div>
                      <div>
                        <span>{modality ? 'Modalidade' : 'Assunto / Interesse'}</span>
                        <strong>{modality ?? selectedLead.subject}</strong>
                      </div>
                    </div>

                    {/* COTAÇÕES VINCULADAS AO LEAD */}
                    {quotes.length > 0 ? (
                      <section className="crm-section">
                        <div className="crm-section__header">
                          <h4>
                            <Icon name="clipboard-list" size={16} strokeWidth={2} />
                            <span>
                              {quotes.length === 1
                                ? 'Cotação vinculada ao lead'
                                : `Cotações vinculadas (${quotes.length})`}
                            </span>
                          </h4>
                        </div>

                        <div className="crm-quotes-stack">
                          {quotes.map((quote) => {
                            const actions = nextQuoteStatuses(quote.status);
                            const quoteCleanNotes = stripMetadataTags(quote.notes);

                            return (
                              <div key={quote.id} className="crm-quote-panel">
                                <div className="crm-quote-panel__top">
                                  <div>
                                    <span className="crm-quote-panel__eyebrow">
                                      Protocolo #{quote.publicId.slice(-8)} ·{' '}
                                      {new Date(quote.createdAt).toLocaleString('pt-BR')}
                                    </span>
                                    <div className="crm-quote-panel__totals">
                                      <strong>
                                        {quote.itemsCount}{' '}
                                        {quote.itemsCount === 1 ? 'unidade' : 'unidades'}
                                      </strong>
                                      <span>·</span>
                                      <strong>{formatQuoteMoney(quote.subtotalCents)}</strong>
                                    </div>
                                  </div>
                                  <span
                                    className={`admin-status admin-status--${quote.status.toLowerCase()}`}
                                  >
                                    {quoteStatusLabel(quote.status)}
                                  </span>
                                </div>

                                {quoteCleanNotes ? (
                                  <p className="admin-note" style={{ margin: '0.6rem 0' }}>
                                    <strong>Observações do cliente:</strong> {quoteCleanNotes}
                                  </p>
                                ) : null}

                                <div className="crm-quote-table-wrap">
                                  <table className="admin-table crm-quote-table">
                                    <thead>
                                      <tr>
                                        <th>Produto</th>
                                        <th>SKU</th>
                                        <th>Qtd.</th>
                                        <th>Unitário</th>
                                        <th>Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {quote.items.map((item) => (
                                        <tr key={item.id}>
                                          <td>
                                            <strong>{item.productName}</strong>
                                          </td>
                                          <td>{item.sku}</td>
                                          <td>{item.quantity}</td>
                                          <td>{formatQuoteMoney(item.unitPriceCents)}</td>
                                          <td>{formatQuoteMoney(item.totalCents)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                {actions.length > 0 ? (
                                  <div className="crm-quote-actions">
                                    <span>Avançar cotação:</span>
                                    <div className="admin-inline-actions">
                                      {actions.map((option) => (
                                        <button
                                          key={option}
                                          className={`admin-button admin-button--compact ${
                                            option === 'CANCELLED' ||
                                            option === 'LOST' ||
                                            option === 'EXPIRED'
                                              ? 'admin-button--outline'
                                              : ''
                                          }`}
                                          disabled={updatingQuoteId === quote.id}
                                          onClick={() =>
                                            void handleUpdateQuoteStatus(quote, option)
                                          }
                                          type="button"
                                        >
                                          {QUOTE_ACTION_LABELS[option] ??
                                            quoteStatusLabel(option)}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="crm-quote-closed-note">
                                    Cotação finalizada em{' '}
                                    {quote.closedAt
                                      ? new Date(quote.closedAt).toLocaleDateString('pt-BR')
                                      : 'status final'}
                                    .
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    ) : cleanLeadNotes ? (
                      <p className="admin-note">
                        <strong>Observações:</strong> {cleanLeadNotes}
                      </p>
                    ) : null}

                    {/* HISTÓRICO DO CHAT NORTI */}
                    <section className="crm-section">
                      <div className="crm-section__header">
                        <h4>
                          <Icon name="message-circle" size={16} strokeWidth={2} />
                          <span>Histórico do Chat Norti</span>
                        </h4>
                        {chatData.ticketId ? (
                          <small className="crm-section__meta">
                            Ticket {chatData.ticketId}
                            {chatData.category ? ` · ${chatData.category}` : ''}
                          </small>
                        ) : null}
                      </div>

                      {chatData.messages.length > 0 ? (
                        <div className="crm-chat-log">
                          {chatData.messages.map((msg, idx) => {
                            const isBot = msg.sender === 'bot';
                            return (
                              <div
                                key={msg.id || idx}
                                className={`crm-chat-bubble ${isBot ? 'is-bot' : 'is-user'}`}
                              >
                                <span className="crm-chat-bubble__author">
                                  {isBot ? '🐧 Norti' : selectedLead.customerName}
                                </span>
                                <span>{msg.text}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="crm-empty-muted">
                          {quotes.length > 0
                            ? 'Cotação enviada diretamente pela loja virtual (sem conversa prévia no chat).'
                            : 'Lead registrado com os dados estruturados do formulário.'}
                        </div>
                      )}
                    </section>

                    {/* ANOTAÇÕES INTERNAS DA EQUIPE COMERCIAL */}
                    <section className="crm-section">
                      <div className="crm-section__header">
                        <h4>
                          <Icon name="edit-3" size={16} strokeWidth={2} />
                          <span>Anotações Internas da Equipe</span>
                        </h4>
                      </div>

                      <form className="crm-note-form" onSubmit={handleAddNote}>
                        <textarea
                          className="admin-input"
                          onChange={(e) => setNewNoteContent(e.target.value)}
                          placeholder="Adicionar anotação (ex: liguei para o cliente, orçamento de 50 fardos enviado)..."
                          rows={2}
                          value={newNoteContent}
                        />
                        <button
                          className="admin-button admin-button--compact"
                          disabled={savingNote || !newNoteContent.trim()}
                          type="submit"
                        >
                          {savingNote ? 'Salvando...' : 'Salvar Anotação'}
                        </button>
                      </form>

                      <div className="crm-notes-list">
                        {selectedLead.leadNotes && selectedLead.leadNotes.length > 0 ? (
                          selectedLead.leadNotes.map((note) => (
                            <div key={note.id} className="crm-note-item">
                              <div className="crm-note-item__meta">
                                <strong>{note.authorName}</strong>
                                <span>
                                  {new Date(note.createdAt).toLocaleString('pt-BR')}
                                </span>
                              </div>
                              <p>{note.content}</p>
                            </div>
                          ))
                        ) : (
                          <p className="crm-empty-muted">Nenhuma anotação registrada ainda.</p>
                        )}
                      </div>
                    </section>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      ) : null}
    </section>
  );
}
