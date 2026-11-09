import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@commerce/ui';
import { resolveMediaUrl, handleImageFallback } from '../../utils/media-url';

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

const PAGE_SIZE = 20;

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
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'DRAFT'>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  // Selections & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  async function loadEvents() {
    setLoading(true);
    setError(null);
    try {
      const data = await getJson<Event[]>('/api/v1/admin/events');
      setEvents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Deseja realmente excluir o evento "${title}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/events/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erro ao excluir evento');
      setMessage(`Evento "${title}" excluído com sucesso.`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  async function applyBulkAction() {
    if (!bulkAction) return;
    if (selectedIds.length === 0) {
      alert('Selecione ao menos um evento para aplicar a ação em massa.');
      return;
    }

    if (bulkAction === 'delete') {
      if (!window.confirm(`Deseja realmente excluir ${selectedIds.length} eventos selecionados?`)) return;
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/v1/admin/events/${id}`, { method: 'DELETE', credentials: 'include' })
        )
      );
      setMessage(`${selectedIds.length} eventos excluídos.`);
    } else if (bulkAction === 'publish') {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/v1/admin/events/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'ACTIVE' }),
          })
        )
      );
      setMessage(`${selectedIds.length} eventos publicados.`);
    } else if (bulkAction === 'draft') {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/v1/admin/events/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'DRAFT' }),
          })
        )
      );
      setMessage(`${selectedIds.length} eventos movidos para rascunho.`);
    }

    setSelectedIds([]);
    setBulkAction('');
    await loadEvents();
  }

  const counts = useMemo(
    () => ({
      all: events.length,
      published: events.filter((e) => e.status === 'ACTIVE').length,
      draft: events.filter((e) => e.status === 'DRAFT').length,
    }),
    [events]
  );

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

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleEvents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEvents.slice(start, start + PAGE_SIZE);
  }, [filteredEvents, currentPage]);

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(visibleEvents.map((e) => e.id));
    } else {
      setSelectedIds([]);
    }
  }

  function toggleSelectEvent(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  return (
    <section className="wp-admin-page">
      {/* WordPress Screen Heading */}
      <div className="wp-screen-heading">
        <div className="wp-screen-heading__left">
          <h1 className="wp-heading-inline">Eventos</h1>
          <button type="button" className="page-title-action" onClick={onCreate}>
            Adicionar novo evento
          </button>
        </div>
      </div>

      {message && (
        <div className="wp-notice wp-notice--success" role="status">
          <p>{message}</p>
        </div>
      )}
      {error && (
        <div className="wp-notice wp-notice--error" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* WordPress Subsubsub Views */}
      <ul className="subsubsub">
        <li className="all">
          <button
            type="button"
            className={statusFilter === 'all' ? 'current' : ''}
            onClick={() => {
              setStatusFilter('all');
              setPage(1);
            }}
          >
            Tudo <span className="count">({counts.all})</span>
          </button>
          {' | '}
        </li>
        <li className="publish">
          <button
            type="button"
            className={statusFilter === 'ACTIVE' ? 'current' : ''}
            onClick={() => {
              setStatusFilter('ACTIVE');
              setPage(1);
            }}
          >
            Publicados <span className="count">({counts.published})</span>
          </button>
          {' | '}
        </li>
        <li className="draft">
          <button
            type="button"
            className={statusFilter === 'DRAFT' ? 'current' : ''}
            onClick={() => {
              setStatusFilter('DRAFT');
              setPage(1);
            }}
          >
            Rascunhos <span className="count">({counts.draft})</span>
          </button>
        </li>
      </ul>

      {/* Tablenav Top */}
      <div className="wp-tablenav top">
        <div className="alignleft actions bulkactions">
          <label htmlFor="bulk-action-selector-top" className="screen-reader-text">
            Selecionar ação em massa
          </label>
          <select
            id="bulk-action-selector-top"
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
          >
            <option value="">Ações em massa</option>
            <option value="publish">Publicar</option>
            <option value="draft">Mover para rascunho</option>
            <option value="delete">Excluir</option>
          </select>
          <button
            type="button"
            className="button action"
            onClick={() => void applyBulkAction()}
          >
            Aplicar
          </button>
        </div>

        <div className="alignright">
          <label htmlFor="event-search-input" className="screen-reader-text">
            Pesquisar eventos:
          </label>
          <input
            type="search"
            id="event-search-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearch(searchInput);
                setPage(1);
              }
            }}
            placeholder="Pesquisar eventos..."
          />
          <button
            type="button"
            className="button"
            onClick={() => {
              setSearch(searchInput);
              setPage(1);
            }}
          >
            Pesquisar eventos
          </button>
        </div>

        <div className="tablenav-pages">
          <span className="displaying-num">{filteredEvents.length} itens</span>
          {totalPages > 1 && (
            <span className="pagination-links">
              <button
                type="button"
                className="tablenav-pages-navspan button"
                disabled={currentPage === 1}
                onClick={() => setPage(1)}
                title="Primeira página"
              >
                «
              </button>
              <button
                type="button"
                className="tablenav-pages-navspan button"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                title="Página anterior"
              >
                ‹
              </button>
              <span className="paging-input">
                <span className="tablenav-paging-text">
                  {currentPage} de <span className="total-pages">{totalPages}</span>
                </span>
              </span>
              <button
                type="button"
                className="tablenav-pages-navspan button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                title="Próxima página"
              >
                ›
              </button>
              <button
                type="button"
                className="tablenav-pages-navspan button"
                disabled={currentPage === totalPages}
                onClick={() => setPage(totalPages)}
                title="Última página"
              >
                »
              </button>
            </span>
          )}
        </div>
      </div>

      {/* WordPress Events Table */}
      <table className="wp-list-table widefat fixed striped table-view-list posts-list">
        <thead>
          <tr>
            <td id="cb" className="manage-column column-cb check-column">
              <input
                id="cb-select-all-1"
                type="checkbox"
                checked={visibleEvents.length > 0 && selectedIds.length === visibleEvents.length}
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
            </td>
            <th scope="col" className="manage-column column-thumb" style={{ width: '60px' }}>
              <span className="screen-reader-text">Cartaz</span>
              <Icon name="image" size={16} strokeWidth={1.8} />
            </th>
            <th scope="col" className="manage-column column-title column-primary sortable">
              <span>Título do Evento</span>
            </th>
            <th scope="col" className="manage-column" style={{ width: '160px' }}>
              <span>Data & Horário</span>
            </th>
            <th scope="col" className="manage-column" style={{ width: '180px' }}>
              <span>Local</span>
            </th>
            <th scope="col" className="manage-column" style={{ width: '140px' }}>
              <span>Palestrante</span>
            </th>
            <th scope="col" className="manage-column" style={{ width: '130px' }}>
              <span>Tipo</span>
            </th>
          </tr>
        </thead>

        <tbody id="the-list">
          {loading ? (
            <tr>
              <td colSpan={7} className="wp-empty-cell">
                Carregando eventos...
              </td>
            </tr>
          ) : visibleEvents.length === 0 ? (
            <tr>
              <td colSpan={7} className="wp-empty-cell">
                Nenhum evento encontrado.
              </td>
            </tr>
          ) : (
            visibleEvents.map((event) => {
              const isChecked = selectedIds.includes(event.id);
              const publicUrl = `http://localhost:3001/evento/${event.slug}`;

              return (
                <tr key={event.id} id={`event-${event.id}`}>
                  <th scope="row" className="check-column">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelectEvent(event.id)}
                    />
                  </th>

                  <td className="column-thumb">
                    <div className="wp-thumb-wrapper" style={{ height: '48px', width: '38px' }}>
                      {event.posterUrl ? (
                        <img
                          src={resolveMediaUrl(event.posterUrl)}
                          alt={event.title}
                          onError={handleImageFallback}
                        />
                      ) : (
                        <div className="wp-thumb-placeholder">
                          <Icon name="calendar" size={18} strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="column-title column-primary has-row-actions">
                    <strong>
                      <button
                        type="button"
                        className="wp-title-link"
                        onClick={() => onEdit(event.id)}
                      >
                        {event.title}
                      </button>
                      {event.status === 'DRAFT' && <span className="post-state"> — Rascunho</span>}
                    </strong>

                    <div className="row-actions">
                      <span className="id-tag">ID: {event.id.slice(0, 8)} | </span>
                      <span className="edit">
                        <button
                          type="button"
                          className="wp-action-link"
                          onClick={() => onEdit(event.id)}
                        >
                          Editar
                        </button>
                        {' | '}
                      </span>
                      <span className="trash">
                        <button
                          type="button"
                          className="wp-action-link wp-action-link--danger"
                          onClick={() => void handleDelete(event.id, event.title)}
                        >
                          Excluir
                        </button>
                        {' | '}
                      </span>
                      <span className="view">
                        <a
                          className="wp-action-link"
                          href={publicUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver no site ↗
                        </a>
                      </span>
                    </div>
                  </td>

                  <td>
                    <strong>{event.eventDateText || '—'}</strong>
                    {event.eventTime ? (
                      <span className="wp-muted" style={{ display: 'block', fontSize: '11px' }}>
                        {event.eventTime}
                      </span>
                    ) : null}
                  </td>

                  <td>
                    {event.location || '—'}
                  </td>

                  <td>{event.instructor || '—'}</td>

                  <td>
                    {event.badge ? (
                      <span
                        className="wp-brand-tag"
                        style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: '1px solid #fca5a5',
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {event.badge}
                      </span>
                    ) : (
                      <span className="wp-muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Tablenav Bottom */}
      <div className="wp-tablenav bottom">
        <div className="alignleft actions bulkactions">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
          >
            <option value="">Ações em massa</option>
            <option value="publish">Publicar</option>
            <option value="draft">Mover para rascunho</option>
            <option value="delete">Excluir</option>
          </select>
          <button
            type="button"
            className="button action"
            onClick={() => void applyBulkAction()}
          >
            Aplicar
          </button>
        </div>

        <div className="tablenav-pages">
          <span className="displaying-num">{filteredEvents.length} itens</span>
          {totalPages > 1 && (
            <span className="pagination-links">
              <button
                type="button"
                className="tablenav-pages-navspan button"
                disabled={currentPage === 1}
                onClick={() => setPage(1)}
              >
                «
              </button>
              <button
                type="button"
                className="tablenav-pages-navspan button"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ‹
              </button>
              <span className="paging-input">
                {currentPage} de <span className="total-pages">{totalPages}</span>
              </span>
              <button
                type="button"
                className="tablenav-pages-navspan button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                ›
              </button>
              <button
                type="button"
                className="tablenav-pages-navspan button"
                disabled={currentPage === totalPages}
                onClick={() => setPage(totalPages)}
              >
                »
              </button>
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
