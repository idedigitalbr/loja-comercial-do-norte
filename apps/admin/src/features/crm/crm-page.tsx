import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CrmLead,
  LeadStage,
  LEAD_STAGE_COLORS,
  LEAD_STAGE_LABELS,
  STORE_OPTIONS,
} from './crm-types';

const STAGES: LeadStage[] = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'WON', 'LOST'];

export function CRMPage() {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedStore, setSelectedStore] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

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
        setError('Não foi possível carregar os leads.');
        return;
      }
      const data = await res.json();
      setLeads(data.items || []);
      setCounts(data.counts || {});
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

  async function handleUpdateStage(leadId: string, newStage: LeadStage) {
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
      const updated = await res.json();
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l)));
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead((prev) => (prev ? { ...prev, stage: newStage } : null));
      }
      setMessage(`Lead atualizado para "${LEAD_STAGE_LABELS[newStage]}".`);
      setTimeout(() => setMessage(''), 4000);
      void loadLeads();
    } catch {
      setError('Falha ao comunicar com o servidor.');
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
        prev.map((l) => (l.id === selectedLead.id ? { ...l, leadNotes: updatedNotes } : l))
      );
      setNewNoteContent('');
      setMessage('Anotação registrada com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setError('Falha ao salvar anotação.');
    } finally {
      setSavingNote(false);
    }
  }

  const leadsByStage = useMemo(() => {
    const map: Record<LeadStage, CrmLead[]> = {
      NEW: [],
      CONTACTED: [],
      IN_PROGRESS: [],
      WON: [],
      LOST: [],
    };
    for (const lead of leads) {
      if (map[lead.stage]) {
        map[lead.stage].push(lead);
      } else {
        map.NEW.push(lead);
      }
    }
    return map;
  }, [leads]);

  const totalLeads = leads.length;
  const newLeadsCount = counts.NEW ?? 0;
  const inProgressCount = (counts.CONTACTED ?? 0) + (counts.IN_PROGRESS ?? 0);
  const wonCount = counts.WON ?? 0;

  function formatPhoneDigits(phone: string) {
    return phone.replace(/\D/g, '');
  }

  return (
    <section className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Atendimento &amp; Comercial</p>
          <h2>MiniCRM — Pipeline de Leads (Chat Norti)</h2>
        </div>
        <p>
          Central de oportunidades e contatos originados pelo mascote Norti e formulários do site.
          Organize em Kanban e responda diretamente pelo WhatsApp de cada filial.
        </p>
      </div>

      {message ? <p className="admin-success" role="status">{message}</p> : null}
      {error ? <p className="admin-error" role="alert">{error}</p> : null}

      {/* KPIs DE TOPO */}
      <div className="admin-kpi-grid">
        <article className="admin-kpi">
          <span>Total de Leads</span>
          <strong>{totalLeads}</strong>
          <small>Oportunidades mapeadas</small>
        </article>
        <article className="admin-kpi">
          <span>Novos no Funil</span>
          <strong style={{ color: '#1D4ED8' }}>{newLeadsCount}</strong>
          <small>Aguardando primeiro contato</small>
        </article>
        <article className="admin-kpi">
          <span>Em Negociação</span>
          <strong style={{ color: '#7E22CE' }}>{inProgressCount}</strong>
          <small>Cotação ou atendimento ativo</small>
        </article>
        <article className="admin-kpi">
          <span>Convertidos / Ganhos</span>
          <strong style={{ color: '#15803D' }}>{wonCount}</strong>
          <small>Vendas fechadas</small>
        </article>
      </div>

      {/* FILTROS E BARRA DE BUSCA */}
      <div className="admin-card admin-toolbar admin-toolbar--filters" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1', minWidth: '240px' }}>
          <input
            className="admin-input"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, WhatsApp ou assunto..."
            style={{ width: '100%' }}
            type="search"
            value={search}
          />
        </div>

        <div style={{ minWidth: '220px' }}>
          <select
            className="admin-select"
            onChange={(e) => setSelectedStore(e.target.value)}
            style={{ width: '100%' }}
            value={selectedStore}
          >
            {STORE_OPTIONS.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        <button className="admin-button" onClick={() => void loadLeads()} type="button">
          Atualizar
        </button>
      </div>

      {/* PIPELINE KANBAN */}
      {loading ? (
        <div className="admin-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Carregando pipeline de oportunidades...</p>
        </div>
      ) : (
        <div
          className="admin-kanban-board"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
            alignItems: 'start',
            marginTop: '1.25rem',
          }}
        >
          {STAGES.map((stage) => {
            const stageLeads = leadsByStage[stage];
            const colors = LEAD_STAGE_COLORS[stage];
            return (
              <div
                key={stage}
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  border: `1px solid ${colors.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 220px)',
                  overflow: 'hidden',
                }}
              >
                {/* CABEÇALHO DA COLUNA */}
                <div
                  style={{
                    backgroundColor: colors.bg,
                    borderBottom: `1px solid ${colors.border}`,
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: colors.text }}>
                    {LEAD_STAGE_LABELS[stage]}
                  </span>
                  <span
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      borderRadius: '999px',
                      padding: '2px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      color: colors.text,
                    }}
                  >
                    {stageLeads.length}
                  </span>
                </div>

                {/* LISTA DE CARDS */}
                <div
                  style={{
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    overflowY: 'auto',
                    flex: 1,
                  }}
                >
                  {stageLeads.length === 0 ? (
                    <div style={{ padding: '1.5rem 0.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
                      Nenhum lead neste estágio
                    </div>
                  ) : (
                    stageLeads.map((lead) => {
                      const digits = formatPhoneDigits(lead.customerPhone);
                      const wppText = encodeURIComponent(
                        `Olá, ${lead.customerName}! Aqui é da equipe Comercial do Norte (${lead.preferredStore}). Vi seu contato através do nosso assistente Norti no site e estou aqui para te atender sobre: ${lead.subject}. Como posso te ajudar?`
                      );
                      const wppUrl = `https://wa.me/55${digits.replace(/^55/, '')}?text=${wppText}`;

                      return (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            padding: '0.85rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                            <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>
                              {lead.customerName}
                            </strong>
                            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                              {new Date(lead.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.78rem', color: '#334155', marginBottom: '0.4rem' }}>
                            <span style={{ fontWeight: 600 }}>📞 {lead.customerPhone}</span>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.6rem' }}>
                            <span
                              style={{
                                backgroundColor: '#EEF2FF',
                                color: '#4338CA',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                              }}
                            >
                              📍 {lead.preferredStore}
                            </span>
                            <span
                              style={{
                                backgroundColor: '#F1F5F9',
                                color: '#475569',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '0.7rem',
                              }}
                            >
                              🏷️ {lead.subject}
                            </span>
                          </div>

                          {/* AÇÕES RÁPIDAS NO CARD */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderTop: '1px solid #F1F5F9',
                              paddingTop: '0.5rem',
                              marginTop: '0.4rem',
                            }}
                          >
                            <a
                              href={wppUrl}
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: '#15803D',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                backgroundColor: '#DCFCE7',
                                padding: '3px 8px',
                                borderRadius: '6px',
                              }}
                              target="_blank"
                            >
                              💬 WhatsApp
                            </a>

                            <select
                              aria-label="Mudar estágio do lead"
                              onChange={(e) => handleUpdateStage(lead.id, e.target.value as LeadStage)}
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 4px',
                                borderRadius: '4px',
                                border: '1px solid #CBD5E1',
                                background: '#FFF',
                              }}
                              value={lead.stage}
                            >
                              {STAGES.map((s) => (
                                <option key={s} value={s}>
                                  {LEAD_STAGE_LABELS[s]}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DRAWER / MODAL DE DETALHES COMPLETOS DO LEAD */}
      {selectedLead && (
        <div
          onClick={() => setSelectedLead(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              height: '100%',
              backgroundColor: '#FFFFFF',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* TOPO DO MODAL */}
            <div
              style={{
                padding: '1.25rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                backgroundColor: '#F8FAFC',
              }}
            >
              <div>
                <span
                  style={{
                    backgroundColor: LEAD_STAGE_COLORS[selectedLead.stage].bg,
                    color: LEAD_STAGE_COLORS[selectedLead.stage].text,
                    border: `1px solid ${LEAD_STAGE_COLORS[selectedLead.stage].border}`,
                    borderRadius: '999px',
                    padding: '2px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    display: 'inline-block',
                    marginBottom: '0.4rem',
                  }}
                >
                  {LEAD_STAGE_LABELS[selectedLead.stage]}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0F172A' }}>
                  {selectedLead.customerName}
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                  Protocolo: {selectedLead.publicId} • Registrado em{' '}
                  {new Date(selectedLead.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.4rem',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            {/* CONTEÚDO DO LEAD */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
              {/* CARD DE INFORMAÇÕES DE CONTATO */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  padding: '1rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>WhatsApp</span>
                  <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>{selectedLead.customerPhone}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Loja Preferencial</span>
                  <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>{selectedLead.preferredStore}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Assunto / Interesse</span>
                  <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>{selectedLead.subject}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Origem</span>
                  <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>Chat Mascote Norti</strong>
                </div>
              </div>

              {/* BOTÃO PRINCIPAL WHATSAPP COM A LOJA */}
              <div>
                <a
                  href={`https://wa.me/55${formatPhoneDigits(selectedLead.customerPhone).replace(/^55/, '')}?text=${encodeURIComponent(
                    `Olá, ${selectedLead.customerName}! Aqui é da equipe Comercial do Norte (${selectedLead.preferredStore}). Vi seu contato através do assistente Norti no site e estou aqui para te atender sobre: ${selectedLead.subject}. Como podemos te ajudar?`
                  )}`}
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    backgroundColor: '#25D366',
                    color: '#FFF',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(37,211,102,0.3)',
                  }}
                  target="_blank"
                >
                  <span style={{ fontSize: '1.2rem' }}>💬</span> Iniciar Conversa no WhatsApp com {selectedLead.customerName}
                </a>
              </div>

              {/* HISTÓRICO DA CONVERSA COM O TYPEBOT / NORTI */}
              <div>
                <h4 style={{ fontSize: '0.95rem', color: '#1E293B', marginBottom: '0.5rem' }}>
                  🤖 Histórico do Chat Norti (Typebot)
                </h4>
                <div
                  style={{
                    backgroundColor: '#EFEAE2',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    padding: '0.85rem',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                  }}
                >
                  {Array.isArray(selectedLead.conversationLog) && selectedLead.conversationLog.length > 0 ? (
                    selectedLead.conversationLog.map((msg, idx) => {
                      const isBot = msg.sender === 'bot';
                      return (
                        <div
                          key={msg.id || idx}
                          style={{
                            alignSelf: isBot ? 'flex-start' : 'flex-end',
                            backgroundColor: isBot ? '#FFFFFF' : '#DCF8C6',
                            color: '#1E293B',
                            borderRadius: '8px',
                            padding: '0.5rem 0.75rem',
                            maxWidth: '85%',
                            fontSize: '0.8rem',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            lineHeight: 1.35,
                          }}
                        >
                          <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: isBot ? '#004CB1' : '#15803D', display: 'block' }}>
                            {isBot ? '🐧 Norti' : selectedLead.customerName}
                          </span>
                          <span>{msg.text}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: '#64748B', textAlign: 'center', margin: '1rem 0' }}>
                      Lead registrado diretamente com os dados estruturados do formulário.
                    </p>
                  )}
                </div>
              </div>

              {/* ANOTAÇÕES DA EQUIPE COMERCIAL */}
              <div>
                <h4 style={{ fontSize: '0.95rem', color: '#1E293B', marginBottom: '0.5rem' }}>
                  📝 Anotações Internas da Equipe
                </h4>

                <form onSubmit={handleAddNote} style={{ marginBottom: '1rem' }}>
                  <textarea
                    className="admin-input"
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Adicionar anotação (ex: liguei para cliente, orçamento de 50 fardos enviado)..."
                    rows={2}
                    style={{ width: '100%', marginBottom: '0.4rem', fontSize: '0.82rem' }}
                    value={newNoteContent}
                  />
                  <button
                    className="admin-button"
                    disabled={savingNote || !newNoteContent.trim()}
                    style={{ fontSize: '0.8rem' }}
                    type="submit"
                  >
                    {savingNote ? 'Salvando...' : 'Salvar Anotação'}
                  </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedLead.leadNotes && selectedLead.leadNotes.length > 0 ? (
                    selectedLead.leadNotes.map((note) => (
                      <div
                        key={note.id}
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '0.6rem 0.75rem',
                          fontSize: '0.8rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.7rem', marginBottom: '0.2rem' }}>
                          <strong>{note.authorName}</strong>
                          <span>{new Date(note.createdAt).toLocaleString('pt-BR')}</span>
                        </div>
                        <p style={{ margin: 0, color: '#334155' }}>{note.content}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0 }}>
                      Nenhuma anotação registrada ainda.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
