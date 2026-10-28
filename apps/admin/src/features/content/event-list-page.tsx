import { useEffect, useMemo, useState } from 'react';

type Event = {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  description: string;
  posterUrl?: string | null;
  eventDateText?: string | null;
  eventTime?: string | null;
  location?: string | null;
  instructor?: string | null;
  badge?: string | null;
  status: string;
  createdAt: string;
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error('Não foi possível carregar os dados.');
  return response.json() as Promise<T>;
}

export function EventListPage({
  onCreate,
  onEdit,
}: {
  onCreate: () => void;
  onEdit: (id: string) => void;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'DRAFT'>('all');

  async function loadEvents() {
    setLoading(true);
    try {
      const data = await getJson<Event[]>('/api/v1/admin/events');
      setEvents(data || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Deseja excluir o evento "${title}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/events/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erro ao excluir');
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  const counts = useMemo(() => ({
    all: events.length,
    published: events.filter((e) => e.status === 'ACTIVE').length,
    draft: events.filter((e) => e.status === 'DRAFT').length,
  }), [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (statusFilter === 'ACTIVE' && e.status !== 'ACTIVE') return false;
      if (statusFilter === 'DRAFT' && e.status !== 'DRAFT') return false;
      if (search.trim()) {
        const term = search.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(term);
        const matchesLoc = e.location?.toLowerCase().includes(term);
        const matchesInst = e.instructor?.toLowerCase().includes(term);
        if (!matchesTitle && !matchesLoc && !matchesInst) return false;
      }
      return true;
    });
  }, [events, statusFilter, search]);

  return (
    <div className="admin-page">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Eventos</h1>
          <button
            className="rounded border border-blue-600 bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer"
            onClick={onCreate}
            type="button"
          >
            Adicionar Novo Evento
          </button>
        </div>

        <input
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-600"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar eventos..."
          type="search"
          value={search}
        />
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <button
          className={`cursor-pointer ${statusFilter === 'all' ? 'font-bold text-blue-700 underline' : 'hover:text-slate-800'}`}
          onClick={() => setStatusFilter('all')}
          type="button"
        >
          Tudo <span className="text-slate-400">({counts.all})</span>
        </button>
        <span>|</span>
        <button
          className={`cursor-pointer ${statusFilter === 'ACTIVE' ? 'font-bold text-blue-700 underline' : 'hover:text-slate-800'}`}
          onClick={() => setStatusFilter('ACTIVE')}
          type="button"
        >
          Publicados <span className="text-slate-400">({counts.published})</span>
        </button>
        <span>|</span>
        <button
          className={`cursor-pointer ${statusFilter === 'DRAFT' ? 'font-bold text-blue-700 underline' : 'hover:text-slate-800'}`}
          onClick={() => setStatusFilter('DRAFT')}
          type="button"
        >
          Rascunhos <span className="text-slate-400">({counts.draft})</span>
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-900">
            <tr>
              <th className="py-2.5 pl-4 pr-2 w-14">Cartaz</th>
              <th className="py-2.5 px-3">Título do Evento</th>
              <th className="py-2.5 px-3">Data & Horário</th>
              <th className="py-2.5 px-3">Local</th>
              <th className="py-2.5 px-3">Palestrante</th>
              <th className="py-2.5 px-3">Tipo</th>
              <th className="py-2.5 pr-4 pl-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td className="py-8 text-center text-slate-400" colSpan={7}>Carregando eventos...</td></tr>
            ) : filteredEvents.length === 0 ? (
              <tr><td className="py-8 text-center text-slate-400" colSpan={7}>Nenhum evento encontrado.</td></tr>
            ) : (
              filteredEvents.map((event) => (
                <tr className="hover:bg-slate-50/80 transition group" key={event.id}>
                  <td className="py-2.5 pl-4 pr-2">
                    {event.posterUrl ? (
                      <img
                        alt={event.title}
                        className="h-12 w-9 rounded object-cover border border-slate-200"
                        src={event.posterUrl}
                      />
                    ) : (
                      <div className="flex h-12 w-9 items-center justify-center rounded bg-slate-100 text-[9px] text-slate-400 text-center">
                        Sem cartaz
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <button
                      className="text-left font-bold text-blue-600 hover:underline cursor-pointer"
                      onClick={() => onEdit(event.id)}
                      type="button"
                    >
                      {event.title}
                    </button>
                    {event.status === 'DRAFT' ? (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 uppercase">
                        Rascunho
                      </span>
                    ) : null}
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 opacity-80 group-hover:opacity-100">
                      <button
                        className="text-blue-600 hover:underline cursor-pointer"
                        onClick={() => onEdit(event.id)}
                        type="button"
                      >
                        Editar
                      </button>
                      <span>|</span>
                      <button
                        className="text-red-600 hover:underline cursor-pointer"
                        onClick={() => handleDelete(event.id, event.title)}
                        type="button"
                      >
                        Excluir
                      </button>
                      <span>|</span>
                      <a
                        className="text-emerald-700 hover:underline"
                        href={`http://localhost:3001/evento/${event.slug}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Ver no site ↗
                      </a>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <span className="font-bold">{event.eventDateText || '—'}</span>
                    {event.eventTime ? <span className="text-slate-400 block">{event.eventTime}</span> : null}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{event.location || '—'}</td>
                  <td className="py-2.5 px-3 text-slate-600">{event.instructor || '—'}</td>
                  <td className="py-2.5 px-3">
                    {event.badge ? (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-[#E2091E] uppercase">
                        {event.badge}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-2.5 pr-4 pl-2 text-right">
                    <button
                      className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      onClick={() => onEdit(event.id)}
                      type="button"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
