import { FormEvent, useEffect, useState } from 'react';
import { resolveMediaUrl, handleImageFallback } from '../../utils/media-url';

type EventDraft = {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  posterUrl: string;
  eventDateText: string;
  eventTime: string;
  location: string;
  locationAddress: string;
  instructor: string;
  badge: string;
  ctaLabel: string;
  ctaUrl: string;
  status: 'ACTIVE' | 'DRAFT';
};

export function EventEditorPage({
  eventId,
  onBack,
  onSaved,
}: {
  eventId?: string;
  onBack: () => void;
  onSaved: () => void;
}) {
  const isEditing = Boolean(eventId);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const [draft, setDraft] = useState<EventDraft>({
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    posterUrl: '',
    eventDateText: '',
    eventTime: '',
    location: '',
    locationAddress: '',
    instructor: '',
    badge: 'WORKSHOP',
    ctaLabel: 'Garantir Vaga no WhatsApp',
    ctaUrl: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (eventId) {
      fetch(`/api/v1/admin/events/${encodeURIComponent(eventId)}`, { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setDraft({
              title: data.title || '',
              slug: data.slug || '',
              subtitle: data.subtitle || '',
              description: data.description || '',
              posterUrl: data.posterUrl || '',
              eventDateText: data.eventDateText || '',
              eventTime: data.eventTime || '',
              location: data.location || '',
              locationAddress: data.locationAddress || '',
              instructor: data.instructor || '',
              badge: data.badge || 'WORKSHOP',
              ctaLabel: data.ctaLabel || 'Garantir Vaga no WhatsApp',
              ctaUrl: data.ctaUrl || '',
              status: data.status || 'ACTIVE',
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [eventId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) {
      alert('O título do evento é obrigatório.');
      return;
    }
    setSaving(true);
    try {
      const url = isEditing
        ? `/api/v1/admin/events/${encodeURIComponent(eventId!)}`
        : '/api/v1/admin/events';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });

      if (!res.ok) throw new Error('Falha ao salvar evento');
      onSaved();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="wp-admin-page">
        <div className="wp-screen-meta-panel" style={{ textAlign: 'center', padding: '40px' }}>
          Carregando informações do evento...
        </div>
      </section>
    );
  }

  return (
    <section className="wp-admin-page">
      <form onSubmit={handleSubmit}>
        {/* WordPress Screen Heading */}
        <div className="wp-screen-heading" style={{ marginBottom: '20px' }}>
          <div className="wp-screen-heading__left">
            <button
              type="button"
              className="button button-secondary"
              onClick={onBack}
              style={{ marginRight: '8px' }}
            >
              ← Voltar para Eventos
            </button>
            <h1 className="wp-heading-inline">
              {isEditing ? `Editar evento: ${draft.title}` : 'Adicionar novo evento'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isEditing && draft.slug && (
              <a
                className="button button-secondary"
                href={`http://localhost:3001/evento/${draft.slug}`}
                rel="noreferrer"
                target="_blank"
              >
                Ver evento no site ↗
              </a>
            )}
            <button
              type="submit"
              className="button button-primary"
              disabled={saving}
            >
              {saving ? 'Salvando...' : isEditing ? 'Atualizar evento' : 'Publicar evento'}
            </button>
          </div>
        </div>

        {/* 2-Column WordPress Layout */}
        <div className="product-editor__columns">
          {/* Main Content Column */}
          <div className="product-editor__main">
            <div className="product-editor__card">
              <div className="wp-form-field">
                <label htmlFor="ev-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Título do evento *
                </label>
                <input
                  id="ev-title"
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Ex: Workshop de Confeitaria Profissional"
                  required
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    padding: '8px 12px',
                    height: 'auto',
                  }}
                />
              </div>

              <div className="wp-form-field" style={{ marginTop: '12px' }}>
                <label htmlFor="ev-subtitle">Subtítulo / Chamada</label>
                <input
                  id="ev-subtitle"
                  type="text"
                  value={draft.subtitle}
                  onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                  placeholder="Ex: Decoração com Chantilly e Bicos — Aprenda técnicas exclusivas"
                />
              </div>

              <div className="product-editor__slug">
                <span>Slug permanente</span>
                <code>/evento/{draft.slug || 'gerado-automaticamente'}</code>
                <input
                  type="text"
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                  placeholder="slug-amigavel-personalizado"
                  style={{
                    height: '30px',
                    padding: '0 8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <div className="wp-form-field" style={{ marginTop: '16px' }}>
                <label htmlFor="ev-desc">Descrição completa do evento *</label>
                <textarea
                  id="ev-desc"
                  rows={14}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="Detalhes sobre o conteúdo, público-alvo, benefícios, o que levar e como se preparar..."
                  required
                  style={{
                    fontSize: '13px',
                    lineHeight: '1.6',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="product-editor__aside">
            {/* Box Publicação */}
            <div className="product-editor__side-card">
              <div className="product-editor__side-heading">
                <h3>Publicação</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="status"
                    checked={draft.status === 'ACTIVE'}
                    onChange={() => setDraft({ ...draft, status: 'ACTIVE' })}
                  />
                  <strong style={{ color: '#00a32a' }}>Publicado</strong>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="status"
                    checked={draft.status === 'DRAFT'}
                    onChange={() => setDraft({ ...draft, status: 'DRAFT' })}
                  />
                  <strong style={{ color: '#dba617' }}>Rascunho</strong>
                </label>
              </div>

              <div style={{ paddingTop: '12px', borderTop: '1px solid #dcdcde' }}>
                <button
                  type="submit"
                  className="button button-primary"
                  style={{ width: '100%' }}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : isEditing ? 'Atualizar evento' : 'Publicar evento'}
                </button>
              </div>
            </div>

            {/* Box Cartaz Oficial */}
            <div className="product-editor__side-card">
              <div className="product-editor__side-heading">
                <h3>Cartaz oficial vertical (9:16)</h3>
              </div>

              <div className="wp-form-field">
                <input
                  type="text"
                  value={draft.posterUrl}
                  onChange={(e) => setDraft({ ...draft, posterUrl: e.target.value })}
                  placeholder="/assets/HOME Vitrine/S12-EVENTOS/... ou https://"
                />
              </div>

              {draft.posterUrl ? (
                <div
                  style={{
                    width: '140px',
                    aspectRatio: '9/16',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: '1px solid #dcdcde',
                    background: '#f0f0f1',
                    margin: '8px auto 0',
                  }}
                >
                  <img
                    src={resolveMediaUrl(draft.posterUrl)}
                    alt="Preview do cartaz"
                    onError={handleImageFallback}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
              ) : (
                <p className="wp-description">
                  Insira o caminho do cartaz oficial para exibição na grade de eventos da home e na página do evento.
                </p>
              )}
            </div>

            {/* Box Data & Horário */}
            <div className="product-editor__side-card">
              <div className="product-editor__side-heading">
                <h3>Data & Horário</h3>
              </div>

              <div className="wp-form-field">
                <label>Data do evento (Texto)</label>
                <input
                  type="text"
                  value={draft.eventDateText}
                  onChange={(e) => setDraft({ ...draft, eventDateText: e.target.value })}
                  placeholder="Ex: 31 de Agosto ou 03/10"
                />
              </div>

              <div className="wp-form-field">
                <label>Horário</label>
                <input
                  type="text"
                  value={draft.eventTime}
                  onChange={(e) => setDraft({ ...draft, eventTime: e.target.value })}
                  placeholder="Ex: 19h30 ou 08h às 12h"
                />
              </div>
            </div>

            {/* Box Local & Instrutor */}
            <div className="product-editor__side-card">
              <div className="product-editor__side-heading">
                <h3>Local & Instrutor</h3>
              </div>

              <div className="wp-form-field">
                <label>Local</label>
                <input
                  type="text"
                  value={draft.location}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  placeholder="Ex: Loja Pedreira ou Igreja Nova Terra"
                />
              </div>

              <div className="wp-form-field">
                <label>Endereço</label>
                <input
                  type="text"
                  value={draft.locationAddress}
                  onChange={(e) => setDraft({ ...draft, locationAddress: e.target.value })}
                  placeholder="Ex: Mauriti entre Pedro Miranda e Antônio Everdosa"
                />
              </div>

              <div className="wp-form-field">
                <label>Palestrante / Instrutor</label>
                <input
                  type="text"
                  value={draft.instructor}
                  onChange={(e) => setDraft({ ...draft, instructor: e.target.value })}
                  placeholder="Ex: James Holanda ou Thais Reis"
                />
              </div>

              <div className="wp-form-field">
                <label>Tipo / Badge do evento</label>
                <input
                  type="text"
                  value={draft.badge}
                  onChange={(e) => setDraft({ ...draft, badge: e.target.value })}
                  placeholder="Ex: WORKSHOP, PALESTRA, REINAUGURAÇÃO"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>

            {/* Box Ação de Inscrição (CTA) */}
            <div className="product-editor__side-card">
              <div className="product-editor__side-heading">
                <h3>Ação de inscrição (CTA)</h3>
              </div>

              <div className="wp-form-field">
                <label>Texto do botão</label>
                <input
                  type="text"
                  value={draft.ctaLabel}
                  onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })}
                  placeholder="Ex: Garantir Vaga no WhatsApp"
                />
              </div>

              <div className="wp-form-field">
                <label>Link de destino / WhatsApp</label>
                <input
                  type="text"
                  value={draft.ctaUrl}
                  onChange={(e) => setDraft({ ...draft, ctaUrl: e.target.value })}
                  placeholder="https://wa.me/5591983440880?text=..."
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
