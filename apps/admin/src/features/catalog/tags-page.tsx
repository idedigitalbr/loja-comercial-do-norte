import { FormEvent, useEffect, useMemo, useState } from 'react';
import { getStorefrontUrl } from '../../admin-shell';

export type TagItem = {
  id: string;
  name: string;
  slug: string;
  status: string;
  description?: string | null;
  _count?: { products: number };
};

type ProductRef = {
  id: string;
  brand?: { id: string; name: string } | null;
  tags?: Array<{ tag: { id: string; name: string } }>;
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error('Não foi possível carregar os dados.');
  return response.json() as Promise<T>;
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function TagsPage({
  onNavigate,
}: {
  onNavigate?: (path: string) => void;
  onOpenBrand?: (id: string) => void;
}) {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [products, setProducts] = useState<ProductRef[]>([]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [editingItem, setEditingItem] = useState<TagItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      const [tagList, productList] = await Promise.all([
        getJson<TagItem[]>('/api/v1/admin/catalog/tags'),
        getJson<ProductRef[]>('/api/v1/admin/catalog/products').catch(() => []),
      ]);
      setTags(Array.isArray(tagList) ? tagList : []);
      setProducts(Array.isArray(productList) ? productList : []);
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Erro ao carregar tags.');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const countByTagId = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      if (p.brand?.id) {
        map.set(p.brand.id, (map.get(p.brand.id) ?? 0) + 1);
      }
      for (const t of p.tags ?? []) {
        if (t.tag?.id) {
          map.set(t.tag.id, (map.get(t.tag.id) ?? 0) + 1);
        }
      }
    }
    return map;
  }, [products]);

  const filteredTags = useMemo(() => {
    const list = Array.isArray(tags) ? tags : [];
    if (!search.trim()) return list;
    const term = search.toLowerCase();
    return list.filter(
      (item) => item.name.toLowerCase().includes(term) || item.slug.toLowerCase().includes(term)
    );
  }, [tags, search]);

  function handleNameChange(val: string) {
    setName(val);
    if (!editingItem && !slug) {
      setSlug(slugify(val));
    }
  }

  function startEdit(item: TagItem) {
    setEditingItem(item);
    setName(item.name);
    setSlug(item.slug);
    setDescription(item.description ?? '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingItem(null);
    setName('');
    setSlug('');
    setDescription('');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const body = {
        name: name.trim(),
        slug: slug.trim() ? slugify(slug) : slugify(name),
        description: description.trim() || undefined,
      };

      const url = editingItem
        ? `/api/v1/admin/catalog/tags/${editingItem.id}`
        : '/api/v1/admin/catalog/tags';
      const method = editingItem ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? 'Não foi possível salvar a tag.');
      }

      setMessage(editingItem ? 'Tag atualizada com sucesso.' : 'Tag criada com sucesso.');
      cancelEdit();
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Erro ao salvar tag.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(item: TagItem) {
    if (!window.confirm(`Tem certeza de que deseja excluir a tag "${item.name}"?`)) return;
    try {
      const response = await fetch(`/api/v1/admin/catalog/tags/${item.id}/archive`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Não foi possível excluir a tag.');
      setMessage('Tag excluída com sucesso.');
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Erro ao arquivar tag.');
    }
  }

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(filteredTags.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  }

  function toggleSelectItem(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  const storefrontBase = getStorefrontUrl();

  return (
    <section className="wp-admin-page">
      <div className="wp-screen-heading">
        <div className="wp-screen-heading__left">
          <h1 className="wp-heading-inline">Tags de produto</h1>
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

      <div className="wp-two-col-layout">
        {/* Left Form: Add / Edit Tag */}
        <div className="wp-col-form">
          <div className="wp-form-wrap">
            <h2>{editingItem ? 'Editar tag' : 'Adicionar nova tag'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="wp-form-field">
                <label htmlFor="tag-name">Nome</label>
                <input
                  id="tag-name"
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Nome da tag"
                  required
                />
                <p className="wp-description">O nome é como ele aparece no seu site.</p>
              </div>

              <div className="wp-form-field">
                <label htmlFor="tag-slug">Slug</label>
                <input
                  id="tag-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="slug-amigavel"
                />
                <p className="wp-description">
                  O “slug” é a versão amigável do URL do nome. Geralmente contém apenas letras minúsculas, números e hífens.
                </p>
              </div>

              <div className="wp-form-field">
                <label htmlFor="tag-description">Descrição</label>
                <textarea
                  id="tag-description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descrição da tag..."
                />
                <p className="wp-description">
                  A descrição não é muito exibida por padrão; no entanto, alguns temas podem exibi-la.
                </p>
              </div>

              <div className="wp-form-actions">
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={saving}
                >
                  {saving ? 'Salvando…' : editingItem ? 'Atualizar tag' : 'Adicionar nova tag'}
                </button>
                {editingItem && (
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={cancelEdit}
                  >
                    Cancelar edição
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Table: Tag List */}
        <div className="wp-col-table">
          <div className="wp-tablenav top">
            <div className="alignleft actions bulkactions">
              <label htmlFor="bulk-action-selector-top" className="screen-reader-text">
                Selecionar ação em massa
              </label>
              <select id="bulk-action-selector-top" defaultValue="">
                <option value="">Ações em massa</option>
                <option value="delete">Excluir selecionadas</option>
              </select>
              <button
                type="button"
                className="button action"
                onClick={() => {
                  if (selectedIds.length === 0) {
                    alert('Selecione ao menos uma tag.');
                    return;
                  }
                  if (window.confirm(`Excluir as ${selectedIds.length} tags selecionadas?`)) {
                    void Promise.all(
                      selectedIds.map((id) =>
                        fetch(`/api/v1/admin/catalog/tags/${id}/archive`, {
                          method: 'POST',
                          credentials: 'include',
                        })
                      )
                    ).then(() => {
                      setSelectedIds([]);
                      void load();
                    });
                  }
                }}
              >
                Aplicar
              </button>
            </div>

            <div className="alignright">
              <label htmlFor="tag-search-input" className="screen-reader-text">
                Pesquisar tags:
              </label>
              <input
                type="search"
                id="tag-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar tags..."
              />
              <button
                type="button"
                className="button"
                onClick={() => {
                  /* Search is reactive */
                }}
              >
                Pesquisar tags
              </button>
            </div>
          </div>

          <table className="wp-list-table widefat fixed striped table-view-list">
            <thead>
              <tr>
                <td className="manage-column column-cb check-column">
                  <input
                    type="checkbox"
                    checked={filteredTags.length > 0 && selectedIds.length === filteredTags.length}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    aria-label="Selecionar todas as tags"
                  />
                </td>
                <th scope="col" className="manage-column column-name column-primary">
                  <span>Nome</span>
                </th>
                <th scope="col" className="manage-column column-description">
                  <span>Descrição</span>
                </th>
                <th scope="col" className="manage-column column-slug">
                  <span>Slug</span>
                </th>
                <th
                  scope="col"
                  className="manage-column column-posts num"
                  style={{ textAlign: 'right', width: '90px' }}
                >
                  <span>Contagem</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTags.length === 0 ? (
                <tr className="no-items">
                  <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: '#646970' }}>
                    Nenhuma tag encontrada.
                  </td>
                </tr>
              ) : (
                filteredTags.map((item) => {
                  const isChecked = selectedIds.includes(item.id);
                  const count = countByTagId.get(item.id) ?? item._count?.products ?? 0;

                  return (
                    <tr key={item.id} className={isChecked ? 'is-selected' : ''}>
                      <th scope="row" className="check-column">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectItem(item.id)}
                          aria-label={`Selecionar ${item.name}`}
                        />
                      </th>
                      <td className="column-name column-primary has-row-actions">
                        <strong>
                          <span style={{ color: '#1d2327', fontWeight: 600 }}>{item.name}</span>
                        </strong>
                        <div className="row-actions">
                          <span className="edit">
                            <button
                              type="button"
                              className="button-link"
                              onClick={() => startEdit(item)}
                            >
                              Editar
                            </button>
                            {' | '}
                          </span>
                          <span className="delete">
                            <button
                              type="button"
                              className="button-link delete-tag"
                              onClick={() => void handleArchive(item)}
                            >
                              Excluir
                            </button>
                            {' | '}
                          </span>
                          <span className="view">
                            <a
                              href={`${storefrontBase}?tag=${item.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="button-link"
                            >
                              Ver produtos
                            </a>
                          </span>
                        </div>
                      </td>
                      <td className="column-description">
                        {item.description ? (
                          <span title={item.description}>
                            {item.description.length > 60
                              ? `${item.description.slice(0, 60)}…`
                              : item.description}
                          </span>
                        ) : (
                          <span className="wp-muted">—</span>
                        )}
                      </td>
                      <td className="column-slug">{item.slug}</td>
                      <td className="column-posts num" style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="wp-term-count-badge"
                          onClick={() => {
                            if (onNavigate) {
                              onNavigate(`/admin/catalogo/produtos?tag=${item.slug}`);
                            }
                          }}
                          title="Ver produtos desta tag"
                          style={{
                            background: count > 0 ? '#2271b1' : '#f0f0f1',
                            color: count > 0 ? '#fff' : '#646970',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '2px 8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {count}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
