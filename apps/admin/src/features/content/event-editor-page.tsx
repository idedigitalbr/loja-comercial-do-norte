import { FormEvent, useEffect, useState } from 'react';

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
      <div className="py-12 text-center text-xs text-slate-500">
        Carregando informações do evento...
      </div>
    );
  }

  return (
    <form className="admin-page" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            onClick={onBack}
            type="button"
          >
            ← Voltar para Eventos
          </button>
          <h1 className="text-xl font-bold text-slate-900">
            {isEditing ? `Editar Evento: ${draft.title}` : 'Adicionar Novo Evento'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && draft.slug ? (
            <a
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-slate-50"
              href={`http://localhost:3001/evento/${draft.slug}`}
              rel="noreferrer"
              target="_blank"
            >
              Ver Evento no Site ↗
            </a>
          ) : null}
          <button
            className="rounded bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
            disabled={saving}
            type="submit"
          >
            {saving ? 'Salvando...' : isEditing ? 'Atualizar Evento' : 'Publicar Evento'}
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Principal */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="ev-title">
              Título do Evento *
            </label>
            <input
              className="w-full rounded border border-slate-300 px-3.5 py-2.5 text-base font-bold text-slate-900 outline-none focus:border-blue-600"
              id="ev-title"
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Ex: Workshop de Confeitaria Profissional"
              required
              type="text"
              value={draft.title}
            />

            <div className="mt-3">
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="ev-subtitle">
                Subtítulo / Chamada
              </label>
              <input
                className="w-full rounded border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                id="ev-subtitle"
                onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                placeholder="Ex: Decoração com Chantilly e Bicos — Aprenda técnicas exclusivas"
                type="text"
                value={draft.subtitle}
              />
            </div>

            <div className="mt-3">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1" htmlFor="ev-slug">
                Slug Permanente
              </label>
              <div className="flex items-center rounded border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                <span className="text-slate-400">/evento/</span>
                <input
                  className="w-full bg-transparent px-1 font-mono text-xs text-slate-800 outline-none"
                  id="ev-slug"
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                  placeholder="gerado-automaticamente"
                  type="text"
                  value={draft.slug}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="ev-desc">
                Descrição Completa do Evento *
              </label>
              <textarea
                className="w-full rounded border border-slate-300 p-3 text-xs text-slate-800 outline-none focus:border-blue-600 leading-relaxed"
                id="ev-desc"
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Detalhes sobre o conteúdo, público-alvo, benefícios, o que levar e como se preparar..."
                required
                rows={12}
                value={draft.description}
              />
            </div>
          </div>
        </div>

        {/* Barra Lateral Direita */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card Publicar */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Status & Visibilidade
            </h2>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  checked={draft.status === 'ACTIVE'}
                  name="status"
                  onChange={() => setDraft({ ...draft, status: 'ACTIVE' })}
                  type="radio"
                />
                <span className="font-semibold text-emerald-800">Publicado</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  checked={draft.status === 'DRAFT'}
                  name="status"
                  onChange={() => setDraft({ ...draft, status: 'DRAFT' })}
                  type="radio"
                />
                <span className="font-medium text-amber-800">Rascunho</span>
              </label>
            </div>
          </div>

          {/* Card Cartaz Oficial (9:16) */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Cartaz Oficial Vertical (9:16)
            </h2>
            <input
              className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-800 outline-none"
              onChange={(e) => setDraft({ ...draft, posterUrl: e.target.value })}
              placeholder="/assets/HOME Vitrine/S12-EVENTOS/..."
              type="text"
              value={draft.posterUrl}
            />
            {draft.posterUrl ? (
              <div className="mt-2.5 overflow-hidden rounded border border-slate-200 aspect-[9/16] relative bg-slate-100 max-h-56">
                <img
                  alt="Preview do cartaz"
                  className="size-full object-cover"
                  src={draft.posterUrl}
                />
              </div>
            ) : null}
          </div>

          {/* Card Data & Local */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Data & Horário
            </h2>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Data do Evento (Texto)
              </label>
              <input
                className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-800 outline-none"
                onChange={(e) => setDraft({ ...draft, eventDateText: e.target.value })}
                placeholder="Ex: 31 de Agosto ou 03/10"
                type="text"
                value={draft.eventDateText}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Horário
              </label>
              <input
                className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-800 outline-none"
                onChange={(e) => setDraft({ ...draft, eventTime: e.target.value })}
                placeholder="Ex: 19h30 ou 08h às 12h"
                type="text"
                value={draft.eventTime}
              />
            </div>
          </div>

          {/* Card Local & Palestrante */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Local & Palestrante
            </h2>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Local
              </label>
              <input
                className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-800 outline-none"
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                placeholder="Ex: Loja Pedreira ou Igreja Nova Terra"
                type="text"
                value={draft.location}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Endereço
              </label>
              <input
                className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-800 outline-none"
                onChange={(e) => setDraft({ ...draft, locationAddress: e.target.value })}
                placeholder="Ex: Mauriti entre Pedro Miranda e Antônio Everdosa"
                type="text"
                value={draft.locationAddress}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Palestrante / Instrutor
              </label>
              <input
                className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-800 outline-none"
                onChange={(e) => setDraft({ ...draft, instructor: e.target.value })}
                placeholder="Ex: James Holanda ou Thais Reis"
                type="text"
                value={draft.instructor}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Badge / Tipo de Evento
              </label>
              <input
                className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-800 outline-none uppercase"
                onChange={(e) => setDraft({ ...draft, badge: e.target.value })}
                placeholder="Ex: WORKSHOP, PALESTRA, REINAUGURAÇÃO"
                type="text"
                value={draft.badge}
              />
            </div>
          </div>

          {/* Card CTA de Inscrição */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Ação de Inscrição (CTA)
            </h2>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Texto do Botão
              </label>
              <input
                className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-800 outline-none"
                onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })}
                placeholder="Ex: Garantir Vaga no WhatsApp"
                type="text"
                value={draft.ctaLabel}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Link de Destino / WhatsApp (opcional)
              </label>
              <input
                className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-800 outline-none"
                onChange={(e) => setDraft({ ...draft, ctaUrl: e.target.value })}
                placeholder="https://wa.me/5591983440880?text=..."
                type="text"
                value={draft.ctaUrl}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
