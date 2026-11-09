import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@commerce/ui';
import { resolveMediaUrl, handleImageFallback } from '../../utils/media-url';

type PostCategory = { id: string; name: string; slug: string };

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverUrl?: string | null;
  videoUrl?: string | null;
  authorName?: string | null;
  badges: string[];
  status: string;
  publishedAt: string;
  views: number;
  category?: PostCategory | null;
  createdAt: string;
};

const PAGE_SIZE = 20;

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error('Não foi possível carregar os dados.');
  return response.json() as Promise<T>;
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const dateStr = d.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} às ${timeStr}`;
  } catch {
    return iso;
  }
}

export function PostListPage({
  onCreate,
  onEdit,
  onManageCategories,
  onNavigate,
}: {
  onCreate: () => void;
  onEdit: (id: string) => void;
  onManageCategories: () => void;
  onNavigate?: (path: string) => void;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'DRAFT'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  // Selections & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [postRes, catRes] = await Promise.all([
        getJson<{ items: Post[] }>('/api/v1/admin/posts?pageSize=100'),
        getJson<PostCategory[]>('/api/v1/admin/posts/categories'),
      ]);
      setPosts(postRes.items || []);
      setCategories(catRes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar posts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Deseja realmente excluir o post "${title}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erro ao excluir post');
      setMessage(`Post "${title}" excluído com sucesso.`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  async function applyBulkAction() {
    if (!bulkAction) return;
    if (selectedIds.length === 0) {
      alert('Selecione ao menos um post para aplicar a ação em massa.');
      return;
    }

    if (bulkAction === 'delete') {
      if (!window.confirm(`Deseja realmente excluir ${selectedIds.length} posts selecionados?`)) return;
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/v1/admin/posts/${id}`, { method: 'DELETE', credentials: 'include' })
        )
      );
      setMessage(`${selectedIds.length} posts excluídos.`);
    } else if (bulkAction === 'publish') {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/v1/admin/posts/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'ACTIVE' }),
          })
        )
      );
      setMessage(`${selectedIds.length} posts publicados.`);
    } else if (bulkAction === 'draft') {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/v1/admin/posts/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'DRAFT' }),
          })
        )
      );
      setMessage(`${selectedIds.length} posts movidos para rascunho.`);
    }

    setSelectedIds([]);
    setBulkAction('');
    await loadData();
  }

  const counts = useMemo(() => {
    return {
      all: posts.length,
      published: posts.filter((p) => p.status === 'ACTIVE').length,
      draft: posts.filter((p) => p.status === 'DRAFT').length,
    };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (statusFilter === 'ACTIVE' && p.status !== 'ACTIVE') return false;
      if (statusFilter === 'DRAFT' && p.status !== 'DRAFT') return false;
      if (categoryFilter && p.category?.id !== categoryFilter) return false;
      if (search.trim()) {
        const term = search.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(term);
        const matchesExcerpt = p.excerpt?.toLowerCase().includes(term);
        if (!matchesTitle && !matchesExcerpt) return false;
      }
      return true;
    });
  }, [posts, statusFilter, categoryFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visiblePosts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPosts.slice(start, start + PAGE_SIZE);
  }, [filteredPosts, currentPage]);

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(visiblePosts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  }

  function toggleSelectPost(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  return (
    <section className="wp-admin-page">
      {/* WordPress Screen Heading */}
      <div className="wp-screen-heading">
        <div className="wp-screen-heading__left">
          <h1 className="wp-heading-inline">Posts</h1>
          <button type="button" className="page-title-action" onClick={onCreate}>
            Adicionar novo
          </button>
          <button type="button" className="page-title-action" onClick={onManageCategories}>
            Categorias de post
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

        <div className="alignleft actions">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="button"
            onClick={() => setPage(1)}
          >
            Filtrar
          </button>
          {(categoryFilter || search) && (
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                setCategoryFilter('');
                setSearch('');
                setSearchInput('');
                setPage(1);
              }}
            >
              Limpar filtros
            </button>
          )}
        </div>

        <div className="alignright">
          <label htmlFor="post-search-input" className="screen-reader-text">
            Pesquisar posts:
          </label>
          <input
            type="search"
            id="post-search-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearch(searchInput);
                setPage(1);
              }
            }}
            placeholder="Pesquisar posts..."
          />
          <button
            type="button"
            className="button"
            onClick={() => {
              setSearch(searchInput);
              setPage(1);
            }}
          >
            Pesquisar posts
          </button>
        </div>

        <div className="tablenav-pages">
          <span className="displaying-num">{filteredPosts.length} itens</span>
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

      {/* WordPress Posts Table */}
      <table className="wp-list-table widefat fixed striped table-view-list posts-list">
        <thead>
          <tr>
            <td id="cb" className="manage-column column-cb check-column">
              <input
                id="cb-select-all-1"
                type="checkbox"
                checked={visiblePosts.length > 0 && selectedIds.length === visiblePosts.length}
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
            </td>
            <th scope="col" className="manage-column column-thumb">
              <span className="screen-reader-text">Capa</span>
              <Icon name="image" size={16} strokeWidth={1.8} />
            </th>
            <th scope="col" className="manage-column column-title column-primary sortable">
              <span>Título</span>
            </th>
            <th scope="col" className="manage-column" style={{ width: '150px' }}>
              <span>Autor</span>
            </th>
            <th scope="col" className="manage-column" style={{ width: '160px' }}>
              <span>Categoria</span>
            </th>
            <th scope="col" className="manage-column" style={{ width: '160px' }}>
              <span>Badges</span>
            </th>
            <th scope="col" className="manage-column column-date sortable" style={{ width: '140px' }}>
              <span>Data</span>
            </th>
          </tr>
        </thead>

        <tbody id="the-list">
          {loading ? (
            <tr>
              <td colSpan={7} className="wp-empty-cell">
                Carregando posts...
              </td>
            </tr>
          ) : visiblePosts.length === 0 ? (
            <tr>
              <td colSpan={7} className="wp-empty-cell">
                Nenhum post encontrado.
              </td>
            </tr>
          ) : (
            visiblePosts.map((post) => {
              const isChecked = selectedIds.includes(post.id);
              const publicUrl = `http://localhost:3001/post/${post.slug}`;

              return (
                <tr key={post.id} id={`post-${post.id}`}>
                  <th scope="row" className="check-column">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelectPost(post.id)}
                    />
                  </th>

                  <td className="column-thumb">
                    <div className="wp-thumb-wrapper">
                      {post.coverUrl ? (
                        <img
                          src={resolveMediaUrl(post.coverUrl)}
                          alt={post.title}
                          onError={handleImageFallback}
                        />
                      ) : (
                        <div className="wp-thumb-placeholder">
                          <Icon name="file-text" size={20} strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="column-title column-primary has-row-actions">
                    <strong>
                      <button
                        type="button"
                        className="wp-title-link"
                        onClick={() => onEdit(post.id)}
                      >
                        {post.title}
                      </button>
                      {post.status === 'DRAFT' && <span className="post-state"> — Rascunho</span>}
                    </strong>

                    <div className="row-actions">
                      <span className="id-tag">ID: {post.id.slice(0, 8)} | </span>
                      <span className="edit">
                        <button
                          type="button"
                          className="wp-action-link"
                          onClick={() => onEdit(post.id)}
                        >
                          Editar
                        </button>
                        {' | '}
                      </span>
                      <span className="trash">
                        <button
                          type="button"
                          className="wp-action-link wp-action-link--danger"
                          onClick={() => void handleDelete(post.id, post.title)}
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

                  <td>{post.authorName || 'Comercial do Norte'}</td>

                  <td>
                    {post.category ? (
                      <button
                        type="button"
                        className="wp-term-link"
                        onClick={() => {
                          setCategoryFilter(post.category!.id);
                          setPage(1);
                        }}
                      >
                        {post.category.name}
                      </button>
                    ) : (
                      <span className="wp-muted">—</span>
                    )}
                  </td>

                  <td>
                    {post.badges && post.badges.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {post.badges.map((b, i) => (
                          <span
                            key={i}
                            className="wp-brand-tag"
                            style={{
                              background: '#fef2f2',
                              color: '#b91c1c',
                              border: '1px solid #fecaca',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="wp-muted">—</span>
                    )}
                  </td>

                  <td className="column-date">
                    <abbr title={post.publishedAt || post.createdAt}>
                      {post.status === 'DRAFT' ? 'Rascunho' : 'Publicado'}
                      <br />
                      {formatDate(post.publishedAt || post.createdAt)}
                    </abbr>
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
          <span className="displaying-num">{filteredPosts.length} itens</span>
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
